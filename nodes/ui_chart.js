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
        var useChartjs = config.useChartjs || false;
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
                width: parseInt(config.width || group.config.width || 6),
                height: parseInt(config.height || group.config.width/2+1 || 4),
                ymin: config.ymin,
                ymax: config.ymax,
                dot: config.dot || false,
                xformat : config.xformat || "HH:mm:SS",
                cutout: parseInt(config.cutout || 0),
                colors: config.colors
            },
            convertBack: function(data) {
                if (useChartjs) { return data; }
                if (data[0]) {
                    if (data[0] && data[0].hasOwnProperty("values") && data[0].values.hasOwnProperty("series") ) {
                        var o = [];
                        for (var i=0; i<data[0].values.series.length; i++) {
                            if (data[0].values.data[i] !== undefined) {
                                if (typeof data[0].values.data[i] === "number") {
                                    o.push({ key:data[0].values.series[i], values:data[0].values.data[i] });
                                }
                                else {
                                    var d = data[0].values.data[i].map(function(i) { return [i.x, i.y]; });
                                    o.push({ key:data[0].values.series[i], values:d });
                                }
                            }
                        }
                        data = o;
                    }
                    return data;
                }
            },
            convert: function(value, oldValue, msg) {
                if (ChartIdList.hasOwnProperty(node.id) && ChartIdList[node.id] !== node.chartType) {
                    value = "changed";
                    oldValue = [];
                }
                ChartIdList[node.id] = node.chartType;
                var converted = {};
                if (Array.isArray(value)) {
                    if (!useChartjs) {
                        if (node.chartType !== "line") {
                            var nb = { series:[], data:[], labels:[] };
                            for (var v in value) {
                                if (value.hasOwnProperty(v)) {
                                    nb.data.push(value[v].values);
                                    nb.series.push(value[v].key);
                                }
                            }
                            value = [{key:node.id, values:nb}];
                        }
                        else {
                            if (value[0] && value[0].hasOwnProperty("values")) {
                                if (Array.isArray(value[0].values)) { // Handle "old" style data array
                                    var na = {series:[], data:[]};
                                    for (var n=0; n<value.length; n++) {
                                        na.series.push(value[n].key);
                                        na.data.push(value[n].values.map(function(i) {
                                            return {x:i[0], y:i[1]};
                                        }));
                                    }
                                    value = [{ key:node.id, values:na}];
                                }
                            }
                        }
                    }
                    converted.update = false;
                    converted.updatedValues = value;
                }
                else {
                    value = parseFloat(value);                      // only handle numbers
                    if (isNaN(value)) { return oldValue || []; }    // return if not a number
                    var label = msg.topic || 'Label';
                    var series = msg.series || "";
                    var storageKey = node.id;
                    var found = false;
                    if (!oldValue) { oldValue = [];}
                    if (oldValue.length === 0) {
                        oldValue = [{ key:storageKey, values:{ data:[], series:[], labels:[] } }];
                    }
                    if (!useChartjs && node.chartType === "line") { // Line chart
                        // Find the chart data
                        for (var j = 0; j < oldValue.length; j++) {
                            if (oldValue[j].key === storageKey) {
                                found = oldValue[j];
                                break;
                            }
                        }

                        // Setup the data structure if this is the first time
                        if (!found) {
                            found = { key:storageKey, values:{ series:[], labels:[], data:[] } };
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

                        // // Add a new point
                        // //var time = new Date().getTime();
                        // var timestamp = msg.timestamp;
                        // var time;
                        // if (timestamp == null) { time = new Date().getTime(); }
                        // else { time = new Date(timestamp).getTime(); }
                        //
                        // // Remove datapoints older than a certain time
                        // var limitOffsetSec = parseInt(config.removeOlder) * parseInt(config.removeOlderUnit);
                        // var limitTime = new Date().getTime() - limitOffsetSec * 1000;
                        // var pointsLimit = config.removeOlderPoints;
                        // var removed = [];
                        // var removeSeries = [];
                        //
                        // // don't bother add old data if out of window
                        // if (time < limitTime) { return oldValue; }
                        // // Add the data to the correct series
                        // var point = {"x":time, "y":value};
                        // found.values.data[seriesIndex].push(point);

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
                            key: label,
                            update: true,
                            removedData: removed,
                            removedSeries: removeSeries,
                            values: {
                                //  data: point
                            }
                        }];
                        converted.updatedValues = oldValue;
                    }
                    else if (useChartjs && (node.chartType === "line" || node.chartType === "bar" || node.chartType === "horizontalBar" || node.chartType === "radar")) {  // Bar and Radar
                        var refill = false;
                        if (node.chartType === "line") { series = label; label = ""; }
                        var s = oldValue[0].values.series.indexOf(series);
                        var l = oldValue[0].values.labels.indexOf(label);
                        if (s === -1) {
                            oldValue[0].values.series.push(series);
                            s = oldValue[0].values.series.length - 1;
                            oldValue[0].values.data[s] = [];
                            if (l > 0) { refill = true; }
                        }
                        if (l === -1) {
                            oldValue[0].values.labels.push(label);
                            l = oldValue[0].values.labels.length - 1;
                            if (l > 0) { refill = true; }
                        }
                        if (node.chartType === "line") {
                            var timestamp = msg.timestamp;
                            var limitOffsetSec = parseInt(config.removeOlder) * parseInt(config.removeOlderUnit);
                            var time = new Date().getTime();
                            var limitTime = time - limitOffsetSec * 1000;
                            if (timestamp !== undefined) { time = new Date(timestamp).getTime(); }
                            if (time < limitTime) { return oldValue; } // ignore if too old for window
                            var point = { "x":time, "y":value };
                            oldValue[0].values.data[s].push(point);
                        }
                        else {
                            oldValue[0].values.data[s][l] = value;
                            if (refill) {
                                for (var i = 0; i < oldValue[0].values.series.length; i++) {
                                    for (var k = 0; k < oldValue[0].values.labels.length; k++) {
                                        oldValue[0].values.data[i][k] = oldValue[0].values.data[i][k] || null;
                                    }
                                }
                            }
                        }
                        console.log(JSON.stringify(oldValue));
                        converted.update = false;
                        converted.updatedValues = oldValue;
                    }
                    else { // Pie and Polar chart (or Bar chart in old format)
                        for (var p=0; p<oldValue[0].values.labels.length; p++) {
                            if (oldValue[0].values.labels[p] === label) {
                                oldValue[0].values.data[p] = value;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            oldValue[0].values.labels.push(label);
                            oldValue[0].values.data.push(value);
                        }
                        converted.update = false;
                        converted.updatedValues = oldValue;
                    }
                }
                return converted;
            }
        };

        var done = ui.add(options);
        setTimeout(function() {
            node.emit("input",{payload:"start"}); // trigger a redraw at start to flush out old data.
            if (node.wires.length === 2) { // if it's an old version of the node honour it
                node.send([null, {payload:"restore", for:node.id}]);
            }
        }, 100);
        node.on("close", done);
    }
    RED.nodes.registerType("ui_chart", ChartNode);
};
