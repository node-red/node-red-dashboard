module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function TextNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;
        
        var done = ui.add(node, tab, config.group, {
            type: 'text',
            label: config.name,
            format: config.format,
            value: false
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_text", TextNode);
};