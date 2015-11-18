module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function SwitchNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;

        var done = ui.add({
            node: node, 
            tab: tab, 
            group: config.group, 
            control: {
                type: 'switch',
                label: config.name,
                order: config.order,
                value: false
            }, 
            convert: function (payload) {
                switch (payload.toString()) {
                    case config.onvalue: return true;
                    case config.offvalue: return false;
                    default:
                        return payload ? true : false;
                }
            }, 
            convertBack: function (value) {
                return value ? config.onvalue : config.offvalue;
            },
            beforeSend: function (msg) {
                msg.topic = config.topic;
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_switch", SwitchNode);
};