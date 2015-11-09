module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function NumericNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add(node, config.group, {
            type: 'numeric',
            label: config.label,
            format: config.format,
            value: config.min,
            min: config.min,
            max: config.max,
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_numeric", NumericNode);
};