module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function TextNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        var done = ui.add(node, config.group, {
            type: 'text',
            label: config.label,
            format: config.format,
            value: false
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_text", TextNode);
};