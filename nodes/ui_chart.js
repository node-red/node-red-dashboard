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
            convert: function(value, oldValue, msg) {
                value = parseFloat(value);
                if (isNaN(value)) return;
                
                var topic = msg.topic || 'Data';
                if (!oldValue) oldValue = []; 
                
                var found;
                for (var i=0; i<oldValue.length; i++) {
                    if (oldValue[i].key === topic) {
                        found = oldValue[i];
                        break;
                    }
                }
                if (!found) {
                    found = { key: topic, values: [] };
                    oldValue.push(found);
                }
                
                var point = [new Date().getTime(), value];
                found.values.push(point);
                
                ui.emit('update-value-chart', {
                    id: node.id,
                    key: topic,
                    value: point
                });
                
                return oldValue;
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_chart", ChartNode);
};