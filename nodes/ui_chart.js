module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function ChartNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;
        
        var done = ui.add({
            emitOnInput: false,
            emitOnlyNewValues: false,
            node: node, 
            tab: tab, 
            group: config.group, 
            control: {
                type: 'chart',
                order: config.order,
                format: config.format
            },
            convert: function(value, oldValue) {
                if (!oldValue) {
                    oldValue = [{ 
                        key: "Series 1",
                        values: []
 		            }]; 
                }
                
                oldValue[0].values.push([new Date().getTime(), value]);
                return oldValue;
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_chart", ChartNode);
};