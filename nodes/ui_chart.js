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
                ymin: config.ymin || 0,
                ymax: config.ymax,
                xformat : config.xformat || "HH:mm:SS"
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
                    var series = msg.topic || 'Series 1';
                    var storageKey = node.id;
                    var found;
                    if (!oldValue) { oldValue = [];}
                    var converted = {};
                    if (node.chartType === "bar") {  // handle bar type data
                        if (oldValue.length == 0) {
                            oldValue = [{
                                key: storageKey,
                                values: {
                                    data: [],
                                    series: []
                                }
                            }]
                        }
                        for (var i=0; i<oldValue[0].values.series.length; i++) {
                            if (oldValue[0].values.series[i] === series) {
                                oldValue[0].values.data[i] = value;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            oldValue[0].values.series.push(series);
                            oldValue[0].values.data.push(value);
                        }
                        converted.update = false;
                        converted.updatedValues = oldValue;
                    }
                    else { // Line chart

                        // Find the chart data
                        for (var i = 0; i < oldValue.length; i++) {
                            if (oldValue[i].key === storageKey) {
                                found = oldValue[i];
                                break;
                            }
                        }

                        // Setup the data structure if this is the first time
                        if (!found) {
                            found = { 
                                key: storageKey, 
                                values: {
                                    series: [],
                                    data: []
                                }
                            }
                            oldValue.push(found);
                        }

                        // Create the new point and add to the dataset
                        // Create series if it doesn't exist
                        var seriesIndex = found.values.series.indexOf(series);
                        if (seriesIndex === -1) {
                            found.values.series.push(series);
                            found.values.data.push([]);
                            seriesIndex = found.values.series.indexOf(series);
                        }

                        // Add a new point
                        var time = new Date().getTime();

                        // Add the data to the correct series
                        var point = {"x": time, "y": value};
                        found.values.data[seriesIndex].push(point);
                        

                        // Remove datapoints older than a certain time
                        var limitOffsetSec = parseInt(config.removeOlder) * parseInt(config.removeOlderUnit);
                        var limitTime = new Date().getTime() - limitOffsetSec * 1000;
                        var pointsLimit = config.removeOlderPoints;
                        var removed = [];
                        var removeSeries = [];

                        oldValue[0].values.data.forEach(function(series, seriesIndex) {
                            var i = 0;
                            while (i < series.length && series[i]['x'] < limitTime) { i++; }
                            if (i > 0) { 
                                series.splice(0, i);
                                removed.push({seriesIndex: seriesIndex, noPoints: i});
                            }

                            // Remove old datapoints if total is greater than points limit
                            if (pointsLimit > 0 && series.length > pointsLimit) {
                                var noToRemove = series.length - pointsLimit;
                                series.splice(0, noToRemove);
                                removed.push({seriesIndex: seriesIndex, noPoints: noToRemove});
                            }

                            if (series.length === 0) { removeSeries.push(seriesIndex); }
                        });

                        // Ensure series match up
                        removeSeries.forEach(function(index) {
                            oldValue[0].values.series.splice(index, 1);
                            oldValue[0].values.data.splice(index, 1);
                        });

                        // If more datapoints than number of pixels wide...
                        // if (found.values.data[seriesIndex].length % pixelsWide === 0) {
                        //     node.warn("More than "+found.values.length+" datapoints");
                        // }
                        
                        // Return an object including the new point and all the values
                        converted.update = true;
                        converted.newPoint = [{
                            key: series, 
                            update: true,
                            removedData: removed,
                            removedSeries: removeSeries,
                            values: {
                                data: point
                            }
                        }];
                        converted.updatedValues = oldValue;
                    }
                }
                return converted;
            }
        };

        var done = ui.add(options);
        setTimeout(function() {
            node.emit("input",{payload:"start"}); // trigger a redraw at start to flush out old data.
        }, 100);
        node.on("close", done);
    }
    RED.nodes.registerType("ui_chart", ChartNode);
};
