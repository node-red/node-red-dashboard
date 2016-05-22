module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function DropdownNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var tab = RED.nodes.getNode(config.tab);
        var group = RED.nodes.getNode(config.group);
        if (!tab || !group) { return; }

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            control: {
                type: 'dropdown',
                label: config.label,
                order: config.order,
                value: config.payload || node.id,
                width: config.width || 6,
                height: config.height || 1,
                options: config.options
            },
            beforeSend: function (msg) {
                msg.topic = config.topic;
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_dropdown", DropdownNode);
};
