module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function ChartNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;
        
        var options = {
            emitOnlyNewValues: false,
            node: node, 
            tab: tab, 
            group: config.group, 
            control: {
                type: 'chart',
                order: config.order,
                interpolate: config.interpolate,
                nodata: config.nodata
            },
            convert: function(value, oldValue, msg) {
                if (value instanceof Array) {
                    oldValue = value;
                } else {
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
                    
                    var time = Math.floor((new Date().getTime() - 1448528370000) / 100);
                    var point = [time, value];
                    found.values.push(point);
                }
                
                return oldValue;
            }
        };
        var done = ui.add(options);
        
        setTimeout(function() {node.send([null, {payload: "restore", for: node.id}]);}, 100);

        node.on("close", done);
    }

    RED.nodes.registerType("ui_chart", ChartNode);
};