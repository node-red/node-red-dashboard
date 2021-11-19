module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function SpacerNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            control: {
                type: 'spacer',
                order: config.order,
                width: config.width || group.config.width || 6,
                height: config.height || 1,
                className: config.className || ''
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_spacer", SpacerNode);
};
