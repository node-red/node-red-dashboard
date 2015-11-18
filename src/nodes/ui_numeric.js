module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function NumericNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;

        var done = ui.add({
            node: node, 
            tab: tab, 
            group: config.group, 
            control: {
                type: 'numeric',
                label: config.name,
                order: config.order,
                format: config.format,
                value: config.min,
                min: config.min,
                max: config.max,
            },
            beforeSend: function (msg) {
                msg.topic = config.topic;
            },
            convert: ui.toNumber.bind(this, config)
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_numeric", NumericNode);
};