var inited = false;

module.exports = function(RED) {
	if (!inited) {
		inited = true;
		init(RED.server, RED.httpAdmin, RED.log, RED.settings);
	}
	
	return { add: add, emit: emit };
};

var serveStatic = require('serve-static'),
	socketio = require('socket.io'),
	path = require('path'),
	events = require('events'),
	config = require('../config');

config.path = config.path || "/ui";
	
var tabs = [];

var updateValueEventName = 'update-value';

var io = undefined;
var controlValues = {};
var ev = new events.EventEmitter();

function emit(event, data) {
	io.emit(event, data);
}

function noConvert(value) {
	return value;
}

function beforeEmit(newValue) {
	return { value: newValue };
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
	
	convert - callback to convert the value before sending it to the front-end
	convertBack - callback to convert the message from front-end before sending it to the next connected node
	
	beforeEmit - callback to prepare the message that is emitted to the front-end
	beforeSend - callback to prepare the message that is sent to the output 
*/
function add(opt) {
	opt.beforeEmit = opt.beforeEmit || beforeEmit;
	opt.beforeSend = opt.beforeSend || beforeSend;
	opt.convert = opt.convert || noConvert;
	opt.convertBack = opt.convertBack || noConvert;
	var remove = addControl(opt.tab, opt.group, opt.control);
	opt.control.id = opt.node.id;
	
	opt.node.on("input", function(msg) {
		var newValue = opt.convert(msg.payload);

		if (controlValues[opt.node.id] != newValue) {
			
			controlValues[opt.node.id] = newValue;
			
			var toEmit = beforeEmit(newValue);
			toEmit.id = opt.node.id;
			io.emit(updateValueEventName, toEmit);
 
 			//forward to output
 			msg.payload = opt.convertBack(newValue);
			opt.beforeSend(msg);
			opt.node.send(msg);
		}
	});
	
	var handler = function (msg) {
		if (msg.id !== opt.node.id) return;
		var converted = opt.convertBack(msg.value);
		controlValues[msg.id] = converted;
		
		var toSend = {payload: converted};
		opt.beforeSend(toSend);
		opt.node.send(toSend);
		
		//fwd to all UI clients
		io.emit(updateValueEventName, msg);
	};
	
	ev.on(updateValueEventName, handler);
	
	return function() {
		ev.removeListener(updateValueEventName, handler);
		remove();
	};
}

//from: http://stackoverflow.com/a/28592528/3016654
function join() {
	var trimRegex = new RegExp('^\\/|\\/$','g'),
	paths = Array.prototype.slice.call(arguments);
	return '/'+paths.map(function(e){return e.replace(trimRegex,"");}).filter(function(e){return e;}).join('/');
}

function init(server, app, log, settings) {
	var fullPath = join(settings.httpAdminRoot, config.path);
	var socketIoPath = join(fullPath, 'socket.io');
	
	io = socketio(server, {path: socketIoPath});
	app.use(config.path, serveStatic(path.join(__dirname, "public")));

	var vendor_packages = [
		'angular', 'angular-sanitize', 
		'angular-animate', 'angular-aria', 
		'angular-material', 'angular-material-icons'
	];
	
	vendor_packages.forEach(function (packageName) {
		app.use(config.path + '/vendor/' + packageName, serveStatic(path.join(__dirname, '../node_modules/', packageName)));
	});

	log.info("UI started at " + fullPath);

	io.on('connection', function(socket) {
		updateUi(socket);
		
		socket.on(updateValueEventName, 
			ev.emit.bind(ev, updateValueEventName));
		
		socket.on('ui-replay-state', function() {
			var ids = Object.getOwnPropertyNames(controlValues);
			ids.forEach(function (id) {
				socket.emit(updateValueEventName, {
					id: id,
					value: controlValues[id]
				})
			});
			
			socket.emit('ui-replay-done');
		});
	});
}

var updateUiPending = false;
function updateUi(to) {
	if (!to) {
		if (updateUiPending) return; 
		updateUiPending = true;
		to = io;
	}

	process.nextTick(function() {
		to.emit('ui-controls', {
			title: config.title,
			tabs: tabs
		});
		updateUiPending = false;
	});
}

function find(array, predicate) {
	for (var i=0; i<array.length; i++) {
		if (predicate(array[i]))
			return array[i];
	}
}

function itemSorter(item1, item2) {
	return item1.order - item2.order;
}

function addControl(tab, groupHeader, control) {
	if (typeof control.type !== 'string') return;
	groupHeader = groupHeader || config.defaultGroupHeader;
	
	var foundTab = find(tabs, function (t) {return t.id === tab.id });
	if (!foundTab) {
		foundTab = {
			id: tab.id,
			header: tab.config.name,
			order: tab.config.order,
			icon: tab.config.icon,
			items: []
		};
		tabs.push(foundTab);
		tabs.sort(itemSorter);
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
	
	foundTab.items.forEach(function (group) {
		group.order = group.items.reduce(function (prev, c) { return prev + c}) / group.items.length;
		foundTab.items.sort(itemSorter);
	})
	
	updateUi();
	
	return function() {
		var index = foundGroup.items.indexOf(control);
		if (index >= 0) {
			foundGroup.items.splice(index, 1);
			
			if (foundGroup.items.length === 0) {
				index = foundTab.items.indexOf(foundGroup);
				if (index >= 0) {
					foundTab.items.splice(index, 1);
					
					if (foundTab.items.length === 0) {
						index = tabs.indexOf(foundTab);
						if (index >= 0) {
							tabs.splice(index, 1);
						}
					}
				}
			}
			
			updateUi();
		}
	}
}
