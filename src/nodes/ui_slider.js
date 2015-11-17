module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function SliderNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;

        var done = ui.add(node, tab, config.group, {
            type: 'slider',
            label: config.name,
            order: config.order,
            value: config.min,
            min: config.min,
            max: config.max
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_slider", SliderNode);
};