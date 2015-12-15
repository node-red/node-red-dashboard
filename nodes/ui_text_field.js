module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function TextFieldNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;

        var done = ui.add({
            node: node,
            tab: tab,
            group: config.group,
            control: {
                type: 'text_field',
                label: config.label,
                order: config.order,
                value: ''
            },
            beforeSend: function (msg) {
                msg.topic = config.topic;
            },
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_text_field", TextFieldNode);
};
