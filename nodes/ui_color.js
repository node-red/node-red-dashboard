module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function ColorPickerNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;

        var done = ui.add({
            node: node, 
            tab: tab, 
            group: config.group, 
                control: {
                type: 'color',
                label: config.name,
                order: config.order,
                value: '#ffffff'
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_color", ColorPickerNode);
};