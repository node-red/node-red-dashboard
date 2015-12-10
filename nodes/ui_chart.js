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
                    
                    var time = new Date().getTime();
                    var point = [time, value];
                    found.values.push(point);
                    
                    var limitOffsetSec = parseInt(config.removeOlder) * parseInt(config.removeOlderUnit);
                    var limitTime = new Date().getTime() - limitOffsetSec * 1000;
                    
                    var remove = [];
                    oldValue.forEach(function (series, index) {
                        var i=0;
                        while (i<series.values.length && series.values[i][0]<limitTime) i++;
                        if (i) series.values.splice(0, i);
                        
                        if (series.values.length === 0)
                            remove.push(index);
                    });
                    
                    remove.forEach(function (index) {
                        oldValue.splice(index, 1);
                    });
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