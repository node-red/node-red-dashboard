module.exports = function(RED) {
    var ui = require('../ui')(RED);
    var ChartIdList = {};

    function ChartNode(config) {
        RED.nodes.createNode(this, config);
        this.chartType = config.chartType || "line";
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        if (config.width === "0") { delete config.width; }
        if (config.height === "0") { delete config.height; }
        // number of pixels wide the chart will be... 43 = sizes.sx - sizes.px
        var pixelsWide = ((config.width || group.config.width || 6) - 1) * 43 - 15;
        //console.log("pixelsWide",pixelsWide);

        if (!tab || !group) { return; }
        var options = {
            emitOnlyNewValues: false,
            node: node,
            tab: tab,
            group: group,
            control: {
                type: 'chart',
                look: node.chartType,
                order: config.order,
                label: config.label,
                legend: config.legend || false,
                interpolate: config.interpolate,
                nodata: config.nodata,
                width: config.width || group.config.width || 6,
                height: config.height || parseInt(group.config.width/2+1) || 4,
                ymin: config.ymin,
                ymax: config.ymax,
                xformat : config.xformat || "%H:%M:%S"
            },
            convert: function(value, oldValue, msg) {
                if (ChartIdList.hasOwnProperty(node.id) && ChartIdList[node.id] !== node.chartType) {
                    value = "changed";
                    oldValue = [];
                }
                ChartIdList[node.id] = node.chartType;
                if (Array.isArray(value)) {
                    oldValue = value;
                } else {
                    value = parseFloat(value);
                    var point;
                    if (isNaN(value)) { return oldValue; }
                    var topic = msg.topic || 'Data';
                    var found;
                    if (!oldValue) { oldValue = [];}
                    if (node.chartType === "bar") {  // handle bar type data
                        // if (oldValue.length === 0) { oldValue = [{ key:node.id, values:[] }] }
                        // for (var j = 0; j < oldValue[0].values.length; j++) {
                        //     if (oldValue[0].values[j][0] === topic) {
                        //         oldValue[0].values[j][1] = value;
                        //         point = [topic, value];
                        //         found = true;
                        //         break;
                        //     }
                        // }
                        // if (!found) {
                        //     point = [topic, value];
                        //     oldValue[0].values.push(point);
                        // }

                        // todo - dan reimplment for barcharts
                    }
                    else { // handle line and area data

                        // Search for the 'Data' key on the oldValue passed in
                        for (var i = 0; i < oldValue.length; i++) {
                            if (oldValue[i].key === topic) {
                                found = oldValue[i];
                                break;
                            }
                        }

                        // Setup the data structure if this is the first time
                        if (!found) {
                            found = { key:topic, values:{labels: [], data: []} };
                            oldValue.push(found);
                        }

                        // Create the new point and add to the dataset
                        var time = new Date().getTime();
                        found.values.labels.push(time);
                        found.values.data.push(value);
                        

                        // Remove datapoints older than a certain time
                        var limitOffsetSec = parseInt(config.removeOlder) * parseInt(config.removeOlderUnit);
                        var limitTime = new Date().getTime() - limitOffsetSec * 1000;

                        var remove = [];

                        oldValue.forEach(function (series, index) {
                            var i=0;
                            while (i<series.values.data.length && series.values.data[i][0]<limitTime) { i++; }
                            if (i) { 
                                series.values.data.splice(0, i);
                                series.values.labels.splice(0, i);
                            }
                            if (series.values.data.length === 0) { remove.push(index); }
                        });

                        remove.forEach(function (index) {
                            oldValue.splice(index, 1);
                        });

                        // If more datapoints than number of pixels wide...
                        // TODO - warning is not the answer but hey... it's a hint.
                        if (found.values.data.length % pixelsWide === 0) {
                            node.warn("More than "+found.values.length+" datapoints");
                        }
                    }
                }
                // Return an object including the new point and all the values
                var obj = {
                    update: true,
                    newPoint: [{
                        key: 'Data', 
                        update: true, 
                        values: [{
                            label: time, 
                            data: value
                        }]
                    }],
                    updatedValues: oldValue
                }
                return obj;
            }
        };
        var done = ui.add(options);
        setTimeout(function() {
            node.send([null, {payload:"restore", for:node.id}]);
            node.emit("input",{payload:"start"}); // trigger a redraw at start to flush out old data.
        }, 100);
        node.on("close", done);
    }
    RED.nodes.registerType("ui_chart", ChartNode);
};
