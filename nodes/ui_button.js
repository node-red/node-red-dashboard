module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function ButtonNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        var payloadType = config.payloadType;
        var payload = config.payload;

        if (payloadType === 'flow' || payloadType === 'global') {
            try {
                var parts = RED.util.normalisePropertyExpression(payload);
                if (parts.length === 0) {
                    throw new Error();
                }
            }
            catch(err) {
                node.warn("Invalid payload property expression - defaulting to node id")
                payload = node.id;
                payloadType = 'str';
            }
        }
        else {
            payload = payload || node.id;
        }

        node.on("input", function(msg) {
            node.topi = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg);
        });

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            emitOnlyNewValues: false,
            forwardInputMessages: config.passthru || false,
            storeFrontEndInputAsState: false,
            control: {
                type: 'button',
                label: config.label,
                tooltip: config.tooltip,
                color: config.color,
                bgcolor: config.bgcolor,
                className: config.className,
                icon: config.icon,
                order: config.order,
                value: payload,
                format: config.bgcolor,
                width: config.width || group.config.width || 3,
                height: config.height || 1
            },
            beforeSend: function (msg,m2) {
                var t = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg)
                if (typeof t === "undefined") { t = node.topi; }
                if (t !== undefined) { msg.topic = t; }
                if (((config.topicType || "str") === "str") && t == "") { delete msg.topic; }
                if (m2 !== undefined) { msg.event = m2.event; }
            },
            convertBack: function (value) {
                if (payloadType === "date") {
                    value = Date.now();
                }
                else {
                    try {
                        value = RED.util.evaluateNodeProperty(payload,payloadType,node);
                    }
                    catch(e) {
                        if (payloadType === "bin") { node.error("Badly formatted buffer"); }
                        else { node.error(e,payload); }
                    }
                }
                return value;
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_button", ButtonNode);
};
