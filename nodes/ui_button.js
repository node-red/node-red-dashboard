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

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            control: {
                type: 'button',
                label: config.label,
                color: config.color,
                icon: config.icon,
                order: config.order,
                value: config.payload || node.id,
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
                    value = RED.util.evaluateNodeProperty(value,payloadType,node);
                }
                return value;
            },
            storeFrontEndInputAsState: false
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_button", ButtonNode);
};
