module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function SwitchNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;

        var done = ui.add(node, tab, config.group, {
            type: 'switch',
            label: config.name,
            value: false
        }, function (payload) {
            return payload?true:false;
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_switch", SwitchNode);
};