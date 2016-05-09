module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function SwitchNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var tab = RED.nodes.getNode(config.tab);
        var group = RED.nodes.getNode(config.group);
        if (!tab || !group) return;

        var done = ui.add({
            node: node, 
            tab: tab, 
            group: group,
            control: {
                type: 'switch' + (config.style ? '-' + config.style : ''),
                label: config.label,
                order: config.order,
                value: false,
                onicon: config.onicon,
                officon: config.officon,
                oncolor: config.oncolor,
                offcolor: config.offcolor,
				width: config.width || 6,
				height: config.height || 1
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
