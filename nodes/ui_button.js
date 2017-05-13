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
            } catch(err) {
                node.warn("Invalid payload property expression - defaulting to node id")
                payload = node.id;
                payloadType = 'str';
            }
        } else {
            payload = payload || node.id;
        }

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            emitOnlyNewValues: false,
            forwardInputMessages: config.passthru || false,
            control: {
                type: 'button',
                label: config.label,
                color: config.color,
                bgcolor: config.bgcolor,
                icon: config.icon,
                order: config.order,
                value: payload,
                width: config.width || group.config.width || 3,
                height: config.height || 1
            },
            beforeSend: function (msg) {
                msg.topic = config.topic;
            },
            convertBack: function (value) {
                if (payloadType === "date") {
                    value = Date.now();
                } else {
                    value = RED.util.evaluateNodeProperty(payload,payloadType,node);
                }
                return value;
            },
            storeFrontEndInputAsState: false
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_button", ButtonNode);
};
