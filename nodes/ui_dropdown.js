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

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            control: control,
            
            beforeEmit: function (msg, newValue) {
                // as of now, only allow a full replacement of options
                // beforeEmit is only called when an node linked to us send a msg
                // we are expecting to receive an "update options" msg 
                // which we expect to be an array of new options

                // for convenience, we pass an indication to the node connected to this dropdown
                // that this is an "update options" message coming from the input sender
                // 'beforeEmit' is called before 'beforeSend', so we may pass in that info
                // otherwise that convenience info would not be sent (would not cause any problems)...
                msg.isOptionUpdate = true;
                msg.isOptionsValid = false; // initial value

                if (!Array.isArray(msg.payload)) return {isOptionsValid: false, value: undefined, newOptions : undefined};

                // an empty array will remove all items from the dropdown 
                if (msg.payload.length === 0) {
                    msg.isOptionsValid = true;
                    control.options = [];
                    return {isOptionsValid: true, value: undefined, newOptions : []};
                }

                // just doing rudimentary checks on the input payload...
                if (msg.payload[0].hasOwnProperty("label") && msg.payload[0].hasOwnProperty("value")) { 
                    // we expect all objects to contain 'label' and 'value' members
                    for (i = 0; i < msg.payload.length; i++) {
                        if (! (msg.payload[i].hasOwnProperty("label") && msg.payload[i].hasOwnProperty("value")) ) break;
                    }
                    isOptionsValid = (i === msg.payload.length);
                } else {
                    var newOpts = [];
                    // we just assume a value array, so we create label / value pairs
                    for (i = 0; i < msg.payload.length; i++) {
                        if ( typeof(msg.payload[i]) === 'object' ) break; // invalid
                        newOpts.push({label: msg.payload[i], value: msg.payload[i]});
                    }
                    isOptionsValid = (i === msg.payload.length);
                    msg.payload = newOpts;
                }

                // the sending node may pass item to be selected from the new options list
                // if selectItem does not exist in the options list, dropdown will not select anything
                if (isOptionsValid) {
                    value = (msg.selectItem ? msg.selectItem : msg.payload[0].value);
                    control.options = msg.payload;
                }
    
                msg.isOptionsValid = isOptionsValid;
                return {isOptionsValid: isOptionsValid, value: value, newOptions: isOptionsValid ? msg.payload : undefined};
            },
            
            beforeSend: function (msg) {
                msg.topic = config.topic;
            }
        });

        node.on("close", done);
    }
    RED.nodes.registerType("ui_dropdown", DropdownNode);
};
