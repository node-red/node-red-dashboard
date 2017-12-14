module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function TextInputNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            forwardInputMessages: config.passthru,
            control: {
                type: (config.delay <= 0 ? 'text-input-CR' : 'text-input'),
                label: config.label,
                mode: config.mode,
                delay: config.delay,
                order: config.order,
                value: '',
                width: config.width || group.config.width || 6,
                height: config.height || 1
            },
            beforeSend: function (msg) {
                if (config.mode === "time") { msg.payload = Date.parse(msg.payload); }
                msg.topic = config.topic || msg.topic;
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_text_input", TextInputNode);
};
