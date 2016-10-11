module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function SwitchNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        var onvalueType = config.onvalueType;
        var offvalueType = config.offvalueType;

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            forwardInputMessages: config.passthru,
            control: {
                type: 'switch' + (config.style ? '-' + config.style : ''),
                label: config.label,
                order: config.order,
                value: false,
                onicon: config.onicon,
                officon: config.officon,
                oncolor: config.oncolor,
                offcolor: config.offcolor,
                width: config.width || group.config.width || 6,
                height: config.height || 1
            },
            convert: function (payload,oldval) {
                var onvalue;
                if (onvalueType === "date") { onvalue = Date.now(); } 
                else { onvalue = RED.util.evaluateNodeProperty(config.onvalue,onvalueType,node); }

                var offvalue;
                if (offvalueType === "date") { offvalue = Date.now(); }
                else { offvalue = RED.util.evaluateNodeProperty(config.offvalue,offvalueType,node); }

                if (RED.util.compareObjects(onvalue,payload)) { return true; }
                else if (RED.util.compareObjects(offvalue,payload)) { return false; }
                else { return oldval; }
            },
            convertBack: function (value) {
                var payload = value ? config.onvalue : config.offvalue;
                var payloadType = value ? onvalueType : offvalueType;
                if (payloadType === "date") { value = Date.now(); }
                else { value = RED.util.evaluateNodeProperty(payload,payloadType,node); }
                return value;
            },
            beforeSend: function (msg) {
                msg.topic = config.topic || msg.topic;
            },
            beforeEmit: function(msg, value) {
                return { msg:msg, value:value };
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_switch", SwitchNode);
};
