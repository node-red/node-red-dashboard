module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function DropdownNode(config) {
        RED.nodes.createNode(this, config);
        this.pt = config.passthru;
        this.multiple = config.multiple || false;
        this.state = [" "," "];
        var node = this;
        node.status({});

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        var control = {
            type: 'dropdown',
            multiple: config.multiple,
            label: config.label,
            tooltip: config.tooltip,
            place: config.place,
            order: config.order,
            value: config.payload || node.id,
            width: config.width || group.config.width || 6,
            height: config.height || 1,
            className: config.className || '',
        };

        for (var o=0; o<config.options.length; o++) {
            config.options[o].label = config.options[o].label || config.options[o].value;
        }
        control.options = config.options;

        var emitOptions = { value:undefined };

        node.on("input", function(msg) {
            node.topi = msg.topic;
        });

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            forwardInputMessages: config.passthru,
            control: control,

            convert: function (payload, oldValue, msg) {
                // convert msg
                // as of now, only allow a full replacement of options
                // beforeEmit is only called when a node linked to us sends a msg
                // we are expecting to receive an "update options" msg
                // which we expect to be an array of new options

                // for convenience, we pass an indication to the node connected to this dropdown
                // that this is an "update options" message coming from the input sender
                // 'beforeEmit' is called before 'beforeSend', so we may pass in that info
                // otherwise that convenience info would not be sent (would not cause any problems)...

                emitOptions = {isOptionsValid:false, value:undefined, newOptions:undefined};
                do {
                    if (!msg.options) { break; }
                    if (typeof msg.options === "string" ) { msg.options = [ msg.options ]; }
                    if (!Array.isArray(msg.options)) { break; }
                    emitOptions.newOptions = [];
                    if (msg.options.length === 0) {
                        emitOptions.isOptionsValid = true;
                        break;
                    }
                    // could check whether or not all members have same type
                    for (var i = 0; i < msg.options.length; i++) {
                        var opt = msg.options[i];
                        if (opt === undefined || opt === null) { continue; }
                        switch (typeof opt) {
                            case 'number': {
                                opt = "" + opt;
                                emitOptions.newOptions.push({label:opt, value:opt, type:"number"});
                                break;
                            }
                            case 'string': {
                                emitOptions.newOptions.push({label:opt, value:opt, type:"string"});
                                break;
                            }
                            case 'object': {
                                // assuming object of {label:value}
                                for (var m in opt) {
                                    if (opt.hasOwnProperty(m)) {
                                        emitOptions.newOptions.push({label:m, value:opt[m], type:typeof(opt[m])});
                                    }
                                }
                                break;
                            }
                            default:
                                // do nothing, just continue with next option
                        }
                    }
                    // send null object on change of menu list
                    if (emitOptions.newOptions.length > 0) { emitOptions.value = null; }
                    // or send the preselected value
                    if (msg.payload) { emitOptions.value = msg.payload; }
                    emitOptions.isOptionsValid = true;
                } while (false);
                // finally adjust msg to reflect the input
                msg._dontSend = true;
                if (emitOptions.isOptionsValid) {
                    control.options = emitOptions.newOptions;
                    control.value = emitOptions.value;
                }
                else {
                    if (msg.options) {
                        node.error("ERR: Invalid Options", msg);
                    }
                }
                if (msg.hasOwnProperty("resetSearch") && msg.resetSearch) {
                    emitOptions.resetSearch = true;
                }
                if (msg.hasOwnProperty("payload")) {
                    if (node.multiple) {
                        if (typeof msg.payload === "string") {
                            msg.payload = msg.payload.split(',');
                        }
                    }
                    emitOptions.value = msg.payload;
                    control.value = emitOptions.value;
                    delete msg._dontSend;
                    return emitOptions;
                }
                // we do not overide payload here due to 'opt.emitOnlyNewValues' in ui.js
                // when undefined is returned, msg will not be forwarded
                return emitOptions.isOptionsValid ? emitOptions : undefined; // always pass entire object (newValue == oldValue)
            },

            beforeEmit: function (msg, newValue) {
                if (msg.socketid) { emitOptions.socketid = msg.socketid; }
                return emitOptions;
            },

            convertBack: function (msg) {
                var val = node.multiple ? [] : "";
                var m = RED.util.cloneMessage(msg);
                var mm = (m.hasOwnProperty("id") && m.hasOwnProperty("value")) ? m.value : m;
                for (var i=0; i<control.options.length; i++) {
                    if (!node.multiple) {
                        delete m["$$mdSelectId"];
                        if (JSON.stringify(control.options[i].value) == JSON.stringify(mm)) {
                            val = control.options[i].value;
                            if (typeof val === "string" && control.options[i].type.indexOf("str") !== 0) {
                                try { val = JSON.parse(val); }
                                catch(e) {}
                            }
                            break;
                        }
                    }
                    else if (node.multiple && mm !== null) {
                        if (!Array.isArray(mm)) {
                            if (mm.hasOwnProperty("value")) { mm = mm.value; }
                            // if (typeof m === "string") { m = [ m ]; }
                            if (mm == null) { mm = []; }
                            else { mm = [ mm ]; }
                        }
                        mm.map(x => delete x["$$mdSelectId"])
                        for (var j = 0; j < mm.length; j++) {
                            if (JSON.stringify(control.options[i].value) === JSON.stringify(mm[j])) {
                                var v = control.options[i].value;
                                if (typeof v === "string" && control.options[i].type !== "string") {
                                    try { v = JSON.parse(v); }
                                    catch(e) {}
                                }
                                val.push(v);
                                break;
                            }
                        }
                    }
                }
                return val;
            },

            beforeSend: function (msg) {
                if (msg.payload === undefined) { msg.payload = []; }
                if (msg.payload === "") { msg._dontSend = true; }
                if (msg._dontSend) {
                    delete msg.options;
                    msg.payload = emitOptions.value;
                }
                var t = undefined;
                try {
                    t = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg) || node.topi;
                }
                catch(e) { }
                if (t !== undefined) { msg.topic = t; }
                if (msg.payload === null || msg._dontSend) { node.status({}); }
                else {
                    var stat = "";
                    if (Array.isArray(msg.payload)) { stat = msg.payload.length + " items"; }
                    else {
                        if (typeof msg.payload === "object") { stat = JSON.stringify(msg.payload); }
                        else { stat = msg.payload.toString(); }
                        if (stat.length > 32) { stat = stat.substr(0,31)+"..."; }
                    }
                    if (node.pt) {
                        node.status({shape:"dot",fill:"grey",text:stat});
                    }
                    else {
                        node.state[1] = stat;
                        node.status({shape:"dot",fill:"grey",text:node.state[1] + " | " + node.state[1]});
                    }
                }
            }
        });

        if (!node.pt) {
            node.on("input", function(msg) {
                node.state[0] = msg.payload;
                node.status({shape:"dot",fill:"grey",text:node.state[0] + " | " + node.state[1]});
            });
        }

        node.on("close", done);
    }
    RED.nodes.registerType("ui_dropdown", DropdownNode);
};
