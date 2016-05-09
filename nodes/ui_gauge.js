module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function GaugeNode(config) {
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
                type: 'gauge',
                name: config.name,
                title: config.title,
                label: config.label,
                order: config.order,
                value: config.min,
                format: config.format,
                min: config.min,
                max: config.max,
				width: config.width || 3,
				height: config.height || 3
            },
            beforeSend: function (msg) {
                msg.topic = config.topic;
            },
            convert: ui.toFloat.bind(this, config)
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_gauge", GaugeNode);
};
