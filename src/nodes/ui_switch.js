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
            order: config.order,
            value: false
        }, function (payload) {
            return payload.toString() == config.offvalue ? false : true;
        }, function (value) {
            return value ? config.onvalue : config.offvalue;
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_switch", SwitchNode);
};