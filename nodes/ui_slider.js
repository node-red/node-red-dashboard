module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function SliderNode(config) {
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
                type: 'slider',
                label: config.label,
                order: config.order,
                value: config.min,
                min: config.min,
                max: config.max,
                step: config.step || 1,
                width: config.width || group.config.width || 6,
                height: config.height || 1
            },
            beforeSend: function (msg) {
                msg.topic = config.topic || msg.topic;
            },
            convert: ui.toNumber.bind(this, config)
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_slider", SliderNode);
};
