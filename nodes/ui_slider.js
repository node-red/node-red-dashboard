module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function SliderNode(config) {
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
                type: 'slider',
                label: config.label,
                order: config.order,
                value: config.min,
                min: config.min,
                max: config.max,
				width: config.width || 6,
				height: config.height || 1
            },
            beforeSend: function (msg) {
                msg.topic = config.topic;
            },
            convert: ui.toNumber.bind(this, config)
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_slider", SliderNode);
};
