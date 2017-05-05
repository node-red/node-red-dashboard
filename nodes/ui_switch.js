module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function validateSwitchValue(node,property,type,payload) {
        if (payloadType === 'flow' || payloadType === 'global') {
            try {
                var parts = RED.util.normalisePropertyExpression(payload);
                if (parts.length === '') {
                    throw new Error();
                }
            } catch(err) {
                node.warn("Invalid payload property expression - defaulting to node id")
                payload = node.id;
                payloadType = 'str';
            }
        } else {
            payload = payload || node.id;
        }
    }
    function SwitchNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        var parts;
        var onvalue = config.onvalue;
        var onvalueType = config.onvalueType;
        if (onvalueType === 'flow' || onvalueType === 'global') {
            try {
                parts = RED.util.normalisePropertyExpression(onvalue);
                //console.log(parts);
                if (parts.length === 0) {
                    throw new Error();
                }
            } catch(err) {
                node.warn("Invalid onvalue property expression - defaulting to true")
                onvalue = true;
                onvalueType = 'bool';
            }
        }
        var offvalue = config.offvalue;
        var offvalueType = config.offvalueType;
        if (offvalueType === 'flow' || offvalueType === 'global') {
            try {
                parts = RED.util.normalisePropertyExpression(offvalue);
                if (parts.length === 0) {
                    throw new Error();
                }
            } catch(err) {
                node.warn("Invalid offvalue property expression - defaulting to false")
                offvalue = false;
                offvalueType = 'bool';
            }
        }

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            forwardInputMessages: config.passthru,
            storeFrontEndInputAsState: (config.decouple === "true") ? false : true,
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
                var myOnValue,myOffvalue;
                if (onvalueType === "date") { myOnValue = Date.now(); }
                else { myOnValue = RED.util.evaluateNodeProperty(onvalue,onvalueType,node); }

                if (offvalueType === "date") { myOffvalue = Date.now(); }
                else { myOffvalue = RED.util.evaluateNodeProperty(offvalue,offvalueType,node); }

                if (RED.util.compareObjects(myOnValue,payload)) { return true; }
                else if (RED.util.compareObjects(myOffvalue,payload)) { return false; }
                else { return oldval; }
            },
            convertBack: function (value) {
                var payload = value ? onvalue : offvalue;
                var payloadType = value ? onvalueType : offvalueType;
                if (payloadType === "date") { value = Date.now(); }
                else { value = RED.util.evaluateNodeProperty(payload,payloadType,node); }
                return value;
            },
            beforeSend: function (msg) {
                msg.topic = config.topic || msg.topic;
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_switch", SwitchNode);
};
