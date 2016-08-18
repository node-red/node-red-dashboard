module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function DropdownNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        var control = {
                type: 'dropdown',
                label: config.label,
                order: config.order,
                value: config.payload || node.id,
                width: config.width || group.config.width || 6,
                height: config.height || 1,
                options: config.options
            };

        var emitOptions;

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
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
          
                emitOptions = {isOptionsValid: false, value: undefined, newOptions : undefined};

                do {
                    if (!Array.isArray(msg.payload)) break;

                    emitOptions.newOptions = [];
                    if (msg.payload.length === 0) {
                        emitOptions.isOptionsValid = true;
                        break;
                    }

                    // could check whether or not all members have same type
                    for (var i = 0; i < msg.payload.length; i++) {
                        var opt = msg.payload[i];
                        if (opt == undefined || opt == null) continue;

                        switch (typeof opt) {
                            case 'number':
                                opt = "" + opt;
                            case 'string':
                                emitOptions.newOptions.push({label: opt, value: opt});
                                break;

                            case 'object':
                                // assuming array of {label:value}
                                for (var m in opt) {
                                    emitOptions.newOptions.push({label: m, value: opt[m]});
                                    // break after first entry - assuming one entry only
                                    // might as well support {label1:value1,...,labeln:valuen}  
                                    break;                                 
                                }
                            default:
                                // do nothing, just continue with next option
                        }
                    }

                    if (emitOptions.newOptions.length > 0) emitOptions.value = emitOptions.newOptions[0].value;
                    if (msg.selectItem) emitOptions.value = msg.selectItem;
                    emitOptions.isOptionsValid = true;

                } while (false);

                // finally adjust msg to reflect the input
                msg.isOptionsMsg = true;
                if (emitOptions.isOptionsValid) {
                    control.options = emitOptions.newOptions;
                    control.value = emitOptions.value;
                    
                } else {
                    // send error message
                    node.error("ERR: Invalid Options", msg);
                }

                // we do not ovveride payload here due to 'opt.emitOnlyNewValues' in ui.js
                // when undefined is returned, msg will not be forwarded
            
                return emitOptions.isOptionsValid ? emitOptions : undefined; // always pass entire object (newValue == oldValue)     
            },
            
            beforeEmit: function (msg, newValue) {
                return emitOptions;
            },
            
            beforeSend: function (msg) {
                if (msg.isOptionsMsg) msg.payload = emitOptions.value;
                msg.topic = config.topic;
            }
        });

        node.on("close", done);
    }
    RED.nodes.registerType("ui_dropdown", DropdownNode);
};
