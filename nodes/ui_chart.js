module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function ChartNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;
        
        var done = ui.add({
            emitOnlyNewValues: false,
            node: node, 
            tab: tab, 
            group: config.group, 
            control: {
                type: 'chart',
                order: config.order,
                format: config.format
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_chart", ChartNode);
};