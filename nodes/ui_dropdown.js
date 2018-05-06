module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function DropdownNode(config) {
        RED.nodes.createNode(this, config);
        this.pt = config.passthru;
        this.state = [" "," "];
        var node = this;
        node.status({});

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        var control = {
                type: 'dropdown',
                label: config.label,
                place: config.place || "Select option",
                order: config.order,
                value: config.payload || node.id,
                width: config.width || group.config.width || 6,
                height: config.height || 1
            };

        for (var o=0; o<config.options.length; o++) {
            config.options[o].label = config.options[o].label || config.options[o].value;
        }
        control.options = config.options;

        var emitOptions;

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
                    if (!msg.options || !Array.isArray(msg.options)) { break; }
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
                                emitOptions.newOptions.push({label:opt, value:opt});
                                break;
                            }
                            case 'string': {
                                emitOptions.newOptions.push({label:opt, value:opt});
                                break;
                            }
                            case 'object': {
                                // assuming object of {label:value}
                                for (var m in opt) {
                                    if (opt.hasOwnProperty(m)) {
                                        emitOptions.newOptions.push({label:m, value:opt[m]});
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
                msg._fromInput = true;
                if (emitOptions.isOptionsValid) {
                    control.options = emitOptions.newOptions;
                    control.value = emitOptions.value;
                }
                else {
                    if (msg.options) {
                        node.error("ERR: Invalid Options", msg);
                    }
                }

                if (msg.hasOwnProperty("payload")) {
                    emitOptions.value = msg.payload;
                    control.value = emitOptions.value;
                    emitOptions._fromInput = true;
                    return emitOptions;
                }
                // we do not overide payload here due to 'opt.emitOnlyNewValues' in ui.js
                // when undefined is returned, msg will not be forwarded
                return emitOptions.isOptionsValid ? emitOptions : undefined; // always pass entire object (newValue == oldValue)
            },

            beforeEmit: function (msg, newValue) {
                return emitOptions;
            },

            beforeSend: function (msg) {
                if (msg._fromInput) {
                    delete msg.options;
                    msg.payload = emitOptions.value;
                }
                msg.topic = config.topic || msg.topic;
                if (node.pt) {
                    node.status({shape:"dot",fill:"grey",text:msg.payload});
                }
                else {
                    node.state[1] = msg.payload;
                    node.status({shape:"dot",fill:"grey",text:node.state[1] + " | " + node.state[1]});
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
