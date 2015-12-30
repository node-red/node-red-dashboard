module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function TextInputNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;

        var done = ui.add({
            node: node,
            tab: tab,
            group: config.group,
            control: {
                type: 'text-input',
                label: config.name,
                mode:  config.mode,
                delay: config.delay,
                order: config.order,
                value: ''
            },
            beforeSend: function (msg) {
                msg.topic = config.topic;
            },
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_text_input", TextInputNode);
};
