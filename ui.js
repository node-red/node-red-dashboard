
var inited = false;

module.exports = function(RED) {
    if (!inited) {
        inited = true;
        init(RED.server, RED.httpNode || RED.httpAdmin, RED.log, RED.settings);
    }
    return {
        add: add,
        addLink: addLink,
        addBaseConfig: addBaseConfig,
        emit: emit,
        emitSocket: emitSocket,
        toNumber: toNumber.bind(null, false),
        toFloat: toNumber.bind(null, true),
        updateUi: updateUi,
        ev: ev,
        getTheme: getTheme,
        getSizes: getSizes
    };
};

var serveStatic = require('serve-static'),
    socketio = require('socket.io'),
    path = require('path'),
    fs = require('fs'),
    events = require('events'),
    dashboardVersion = require('./package.json').version;

var baseConfiguration = {};

var menu = [];
var globals = [];
var updateValueEventName = 'update-value';
var io;
var currentValues = {};
var replayMessages = {};
var removeStateTimers = {};
var removeStateTimeout = 1000;
var ev = new events.EventEmitter();
ev.setMaxListeners(0);

var settings = {};

function toNumber(keepDecimals, config, input) {
    if (input === undefined) { return; }
    if (typeof input !== "number") {
        var inputString = input.toString();
        input = keepDecimals ? parseFloat(inputString) : parseInt(inputString);
    }
    if (config.step) { input = Math.round(Math.round(input/config.step)*config.step*10000)/10000; }
    return isNaN(input) ? config.min : input;
}

function emit(event, data) {
    io.emit(event, data);
}

function emitSocket(event, data) {
    if (data.hasOwnProperty("socketid") && (data.socketid !== undefined)) {
        io.to(data.socketid).emit(event,data);
    }
    else {
        io.emit(event, data);
    }
}

function noConvert(value) {
    return value;
}

function beforeEmit(msg, value) {
    return { value:value };
}

function beforeSend(msg) {
    //do nothing
}

/*
options:
    node - the node that represents the control on a flow
    control - the control to be added
    tab - tab config node that this control belongs to
    group - group name
    [emitOnlyNewValues] - boolean (default true).
        If true, it checks if the payload changed before sending it
        to the front-end. If the payload is the same no message is sent.

    [convert] - callback to convert the value before sending it to the front-end
    [convertBack] - callback to convert the message from front-end before sending it to the next connected node

    [beforeEmit] - callback to prepare the message that is emitted to the front-end
    [beforeSend] - callback to prepare the message that is sent to the output

    [forwardInputMessages] - default true. If true, forwards input messages to the output
    [storeFrontEndInputAsState] - default true. If true, any message received from front-end is stored as state
*/
function add(opt) {
    clearTimeout(removeStateTimers[opt.node.id]);
    delete removeStateTimers[opt.node.id];

    if (typeof opt.emitOnlyNewValues === 'undefined') {
        opt.emitOnlyNewValues = true;
    }
    if (typeof opt.forwardInputMessages === 'undefined') {
        opt.forwardInputMessages = true;
    }
    if (typeof opt.storeFrontEndInputAsState === 'undefined') {
        opt.storeFrontEndInputAsState = true;
    }
    opt.beforeEmit = opt.beforeEmit || beforeEmit;
    opt.beforeSend = opt.beforeSend || beforeSend;
    opt.convert = opt.convert || noConvert;
    opt.convertBack = opt.convertBack || noConvert;
    opt.control.id = opt.node.id;
    var remove = addControl(opt.tab, opt.group, opt.control);

    opt.node.on("input", function(msg) {
        if (typeof msg.enabled === 'boolean') {
            var state = replayMessages[opt.node.id];
            if (!state) { replayMessages[opt.node.id] = state = {id: opt.node.id}; }
            state.disabled = !msg.enabled;
            io.emit(updateValueEventName, state);
        }

        // remove res and req as they are often circular
        if (msg.hasOwnProperty("res")) { delete msg.res; }
        if (msg.hasOwnProperty("req")) { delete msg.req; }

        // Retrieve the dataset for this node
        var oldValue = currentValues[opt.node.id];

        // Call the convert function in the node to get the new value
        // as well as the full dataset.
        var conversion = opt.convert(msg.payload, oldValue, msg);

        // If the update flag is set, emit the newPoint, and store the full dataset
        var fullDataset;
        var newPoint;
        if ((typeof(conversion) === 'object') && (conversion.update !== undefined)) {
            newPoint = conversion.newPoint;
            fullDataset = conversion.updatedValues;
        }
        else {
            // If no update flag is set, this means the conversion contains
            // the full dataset or the new value (e.g. gauges)
            fullDataset = conversion;
        }

        // If we have something new to emit
        if (newPoint !== undefined || !opt.emitOnlyNewValues || oldValue != fullDataset) {
            currentValues[opt.node.id] = fullDataset;

            // Determine what to emit over the websocket
            // (the new point or the full dataset).

            // Always store the full dataset.
            var toStore = opt.beforeEmit(msg, fullDataset);
            var toEmit;
            if (newPoint !== undefined) { toEmit = opt.beforeEmit(msg, newPoint); }
            else { toEmit = toStore; }

            var addField = function(m) {
                if (opt.control.hasOwnProperty(m) && opt.control[m].indexOf("{{") !== -1) {
                    var a = opt.control[m].split("{{");
                    a.shift();
                    for (var i = 0; i < a.length; i++) {
                        var b = a[i].split("}}")[0].trim();
                        b.replace(/\"/g,'').replace(/\'/g,'');
                        if (b.indexOf("|") !== -1) { b = b.split("|")[0]; }
                        if (b.indexOf(" ") !== -1) { b = b.split(" ")[0]; }
                        if (b.indexOf("?") !== -1) { b = b.split("?")[0]; }
                        b.replace(/\(/g,'').replace(/\)/g,'');
                        if (b.indexOf("msg.") >= 0) {
                            b = b.split("msg.")[1];
                            if (b.indexOf(".") !== -1) { b = b.split(".")[0]; }
                            if (b.indexOf("[") !== -1) { b = b.split("[")[0]; }
                            if (!toEmit.hasOwnProperty("msg")) { toEmit.msg = {}; }
                            if (!toEmit.msg.hasOwnProperty(b) && msg.hasOwnProperty(b)) {
                                toEmit.msg[b] = JSON.parse(JSON.stringify(msg[b]));
                            }
                        }
                        else {
                            if (b.indexOf(".") !== -1) { b = b.split(".")[0]; }
                            if (b.indexOf("[") !== -1) { b = b.split("[")[0]; }
                            if (!toEmit.hasOwnProperty(b) && msg.hasOwnProperty(b)) {
                                toEmit[b] = JSON.parse(JSON.stringify(msg[b]));
                            }
                        }
                    }
                }
            }

            // if label, or format field is set to a msg property, emit that as well
            addField("label");
            addField("format");
            if (msg.hasOwnProperty("enabled")) { toEmit.disabled = !msg.enabled; }
            toEmit.id = toStore.id = opt.node.id;
            //console.log("EMIT",JSON.stringify(toEmit));

            // Emit and Store the data
            io.emit(updateValueEventName, toEmit);
            replayMessages[opt.node.id] = toStore;

            // Handle the node output
            if (opt.forwardInputMessages && opt.node._wireCount) {
                msg.payload = opt.convertBack(fullDataset);
                msg = opt.beforeSend(msg) || msg;
                opt.node.send(msg);
            }
        }
    });

    var handler = function (msg) {
        if (msg.id !== opt.node.id) { return; }
        var converted = opt.convertBack(msg.value);
        if (opt.storeFrontEndInputAsState) {
            currentValues[msg.id] = converted;
            replayMessages[msg.id] = msg;
        }
        var toSend = {payload: converted};
        toSend = opt.beforeSend(toSend, msg) || toSend;
        toSend.socketid = toSend.socketid || msg.socketid;
        opt.node.send(toSend);

        if (opt.storeFrontEndInputAsState) {
            //fwd to all UI clients
            io.emit(updateValueEventName, msg);
        }
    };

    ev.on(updateValueEventName, handler);

    return function() {
        ev.removeListener(updateValueEventName, handler);
        remove();
        removeStateTimers[opt.node.id] = setTimeout(function() {
            delete currentValues[opt.node.id];
            delete replayMessages[opt.node.id];
        }, removeStateTimeout);
    };
}

//from: http://stackoverflow.com/a/28592528/3016654
function join() {
    var trimRegex = new RegExp('^\\/|\\/$','g'),
    paths = Array.prototype.slice.call(arguments);
    return '/'+paths.map(function(e) {return e.replace(trimRegex,"");}).filter(function(e) {return e;}).join('/');
}

function init(server, app, log, redSettings) {
    var uiSettings = redSettings.ui || {};
    if ((uiSettings.hasOwnProperty("path")) && (typeof uiSettings.path === "string")) {
        settings.path = uiSettings.path;
    }
    else { settings.path = 'ui'; }
    settings.defaultGroupHeader = uiSettings.defaultGroup || 'Default';

    var fullPath = join(redSettings.httpNodeRoot, settings.path);
    var socketIoPath = join(fullPath, 'socket.io');

    io = socketio(server, {path: socketIoPath});

    fs.stat(path.join(__dirname, 'dist/index.html'), function(err, stat) {
        if (!err) {
            app.use( join(settings.path), serveStatic(path.join(__dirname, "dist")) );
        }
        else {
            log.info("Dashboard using development folder");
            app.use(join(settings.path), serveStatic(path.join(__dirname, "src")));
            var vendor_packages = [
                'angular', 'angular-sanitize', 'angular-animate', 'angular-aria', 'angular-material', 'angular-touch',
                'angular-material-icons', 'svg-morpheus', 'font-awesome',
                'sprintf-js',
                'jquery', 'jquery-ui',
                'd3', 'raphael', 'justgage',
                'angular-chart.js', 'chart.js', 'moment',
                'angularjs-color-picker', 'tinycolor2', 'less'
            ];
            vendor_packages.forEach(function (packageName) {
                app.use(join(settings.path, 'vendor', packageName), serveStatic(path.join(__dirname, 'node_modules', packageName)));
            });
        }
    });

    log.info("Dashboard version " + dashboardVersion + " started at " + fullPath);

    io.on('connection', function(socket) {
        ev.emit("newsocket", socket.client.id, socket.request.connection.remoteAddress);
        updateUi(socket);

        socket.on(updateValueEventName, ev.emit.bind(ev, updateValueEventName));
        socket.on('ui-replay-state', function() {
            var ids = Object.getOwnPropertyNames(replayMessages);
            ids.forEach(function (id) {
                socket.emit(updateValueEventName, replayMessages[id]);
            });
            socket.emit('ui-replay-done');
        });
        socket.on('ui-change', function(index) {
            var name = "";
            var tl = menu.length;
            if (tl > 0 && index <= tl) {
                name = menu[index].header === undefined ? menu[index].name : menu[index].header;
            }
            ev.emit("changetab", index, name, socket.client.id, socket.request.connection.remoteAddress);
            //if (index < menu.length) { updateUi(); }
        });
        socket.on('ui-refresh', function() {
            updateUi();
        });
        socket.on('disconnect', function() {
            ev.emit("endsocket", socket.client.id, socket.request.connection.remoteAddress);
        });
    });
}

var updateUiPending = false;
function updateUi(to) {
    if (!to) {
        if (updateUiPending) { return; }
        updateUiPending = true;
        to = io;
    }
    process.nextTick(function() {
        menu.forEach(function(o) {
            o.theme = baseConfiguration.theme;
        });
        to.emit('ui-controls', {
            site: baseConfiguration.site,
            theme: baseConfiguration.theme,
            menu: menu,
            globals: globals
        });
        updateUiPending = false;
    });
}

function find(array, predicate) {
    for (var i=0; i<array.length; i++) {
        if (predicate(array[i])) {
            return array[i];
        }
    }
}

function itemSorter(item1, item2) {
    if (item1.order === 0 && item2.order !== 0) {
        return 1;
    }
    else if (item1.order !== 0 && item2.order === 0) {
        return -1;
    }
    return item1.order - item2.order;
}

function addControl(tab, groupHeader, control) {
    if (typeof control.type !== 'string') { return function() {}; }

    // global template?
    if (control.type === 'template' && control.templateScope === 'global') {
        // add content to globals
        globals.push(control);
        updateUi();

        // return remove function
        return function() {
            var index = globals.indexOf(control);
            if (index >= 0) {
                globals.splice(index, 1);
                updateUi();
            }
        }
    }
    else {
        groupHeader = groupHeader || settings.defaultGroupHeader;
        control.order = parseFloat(control.order);

        var foundTab = find(menu, function (t) {return t.id === tab.id });
        if (!foundTab) {
            foundTab = {
                id: tab.id,
                header: tab.config.name,
                order: parseFloat(tab.config.order),
                icon: tab.config.icon,
                items: []
            };
            menu.push(foundTab);
            menu.sort(itemSorter);
        }

        var foundGroup = find(foundTab.items, function (g) {return g.header === groupHeader;});
        if (!foundGroup) {
            foundGroup = {
                header: groupHeader,
                items: []
            };
            foundTab.items.push(foundGroup);
        }
        foundGroup.items.push(control);
        foundGroup.items.sort(itemSorter);
        foundGroup.order = groupHeader.config.order;
        foundTab.items.sort(itemSorter);

        updateUi();

        // Return the remove function for this control
        return function() {
            var index = foundGroup.items.indexOf(control);
            if (index >= 0) {
                // Remove the item from the group
                foundGroup.items.splice(index, 1);

                // If the group is now empty, remove it from the tab
                if (foundGroup.items.length === 0) {
                    index = foundTab.items.indexOf(foundGroup);
                    if (index >= 0) {
                        foundTab.items.splice(index, 1);

                        // If the tab is now empty, remove it as well
                        if (foundTab.items.length === 0) {
                            index = menu.indexOf(foundTab);
                            if (index >= 0) {
                                menu.splice(index, 1);
                            }
                        }
                    }
                }
                updateUi();
            }
        }
    }
}

function addLink(name, link, icon, order, target) {
    var newLink = {
        name: name,
        link: link,
        icon: icon,
        order: order || 1,
        target: target
    };

    menu.push(newLink);
    menu.sort(itemSorter);
    updateUi();

    return function() {
        var index = menu.indexOf(newLink);
        if (index < 0) { return; }
        menu.splice(index, 1);
        updateUi();
    }
}

function addBaseConfig(config) {
    if (config) { baseConfiguration = config; }
    updateUi();
}

function getTheme() {
    if (baseConfiguration && baseConfiguration.hasOwnProperty("theme") && (typeof baseConfiguration.theme !== "undefined") ) {
        return baseConfiguration.theme.themeState;
    }
    else {
        return undefined;
    }
}

function getSizes() {
    if (baseConfiguration && baseConfiguration.hasOwnProperty("site") && (typeof baseConfiguration.site !== "undefined") && baseConfiguration.site.hasOwnProperty("sizes")) {
        return baseConfiguration.site.sizes;
    }
    else {
        return { sx:48, sy:48, gx:6, gy:6, cx:6, cy:6, px:0, py:0 };
    }
}
