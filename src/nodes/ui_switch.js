module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function SwitchNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add(node, config.group, {
            type: 'switch',
            label: config.label,
            value: false
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_switch", SwitchNode);
};