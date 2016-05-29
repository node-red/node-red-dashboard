module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function ChartNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        if (config.width === "0") { delete config.width; }
        if (config.height === "0") { delete config.height; }

        if (!tab || !group) { return; }
        var options = {
            emitOnlyNewValues: false,
            node: node,
            tab: tab,
            group: group,
            control: {
                type: 'chart',
                order: config.order,
                label: config.label,
                interpolate: config.interpolate,
                nodata: config.nodata,
                width: config.width || group.config.width || 6,
                height: config.height || parseInt(group.config.width/2+0.5) || 3,
                ymin: config.ymin,
                ymax: config.ymax
            },
            convert: function(value, oldValue, msg) {
                if (Array.isArray(value)) {
                    oldValue = value;
                } else {
                    value = parseFloat(value);
                    if (isNaN(value)) { return; }
                    var topic = msg.topic || 'Data';
                    if (!oldValue) { oldValue = []; }

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
                        while (i<series.values.length && series.values[i][0]<limitTime) { i++; }
                        if (i) { series.values.splice(0, i); }
                        if (series.values.length === 0) { remove.push(index); }
                    });

                    remove.forEach(function (index) {
                        oldValue.splice(index, 1);
                    });
                }
                return oldValue;
            }
        };
        var done = ui.add(options);
        setTimeout(function() {node.send([null, {payload:"restore", for:node.id}]);}, 100);
        node.on("close", done);
    }
    RED.nodes.registerType("ui_chart", ChartNode);
};
