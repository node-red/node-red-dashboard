module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function SliderNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add(node, config.group, {
            type: 'slider',
            label: config.label,
            value: config.min,
            min: config.min,
            max: config.max
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_slider", SliderNode);
};