module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function ButtonNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        var done = ui.add(node, config.group, {
            type: 'button',
            label: config.label,
            value: node.id
        });
        
        node.on("close", done);
    }

    RED.nodes.registerType("ui_button", ButtonNode);
};