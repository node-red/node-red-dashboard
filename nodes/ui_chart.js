module.exports = function(RED) {
    var ui = require('../ui')(RED);
    var ChartIdList = {};

    function ChartNode(config) {
        RED.nodes.createNode(this, config);
        this.chartType = config.chartType || "line";
        this.newStyle = (!config.hasOwnProperty("useOldStyle") || (config.useOldStyle === true)) ? false : true;
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
        var dnow = Date.now();
        var options = {
            emitOnlyNewValues: true,
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
                xformat : config.xformat || "HH:mm:ss",
                cutout: parseInt(config.cutout || 0),
                colors: config.colors,
                useOneColor: config.useOneColor || false,
                animation: false,
                spanGaps: false
            },
            convertBack: function(data) {
                if (node.newStyle) {
                    if (data && data[0] && data[0].hasOwnProperty("values")) {
                        return [data[0].values];
                    }
                }
                else {
                    if (data && data[0]) {
                        if (data[0] && data[0].hasOwnProperty("values") && data[0].values.hasOwnProperty("series") ) {
                            var o = [];
                            for (var i=0; i<data[0].values.series.length; i++) {
                                if (data[0].values.data[i] !== undefined) {
                                    if (node.chartType !== "line") {
                                        o.push({ key:data[0].values.series[i], values:data[0].values.data[i][0] });
                                    }
                                    else {
                                        var d = data[0].values.data[i].map(function(i) { return [i.x, i.y]; });
                                        o.push({ key:data[0].values.series[i], values:d });
                                    }
                                }
                            }
                            data = o;
                        }
                    }
                    return data;
                }
            },
            convert: function(value, oldValue, msg) {
                var converted = {};
                if (ChartIdList.hasOwnProperty(node.id) && ChartIdList[node.id] !== node.chartType) {
                    value = [];
                }
                if (this.control.look !== node.chartType) {
                    if ((this.control.look === "line") || (node.chartType === "line")) { value = []; }
                    node.chartType = this.control.look;
                }
                ChartIdList[node.id] = node.chartType;
                if (Array.isArray(value)) {
                    if (value.length === 0) { // reset chart
                        converted.update = false;
                        converted.updatedValues = [];
                        return converted;
                    }
                    // New style
                    if (!value[0].hasOwnProperty("key")) {
                        if (value[0].hasOwnProperty("series") && value[0].hasOwnProperty("data")) {
                            var flag = true;
                            for (var dd = 0; dd < value[0].data.length; dd++ ) {
                                if (!isNaN(value[0].data[dd][0])) { flag = false; }
                            }
                            if (node.chartType === "line") {
                                if (flag) { delete value[0].labels; }
                            }
                            else if (node.chartType === "bar" || node.chartType === "horizontalBar") {
                                if (flag) {
                                    var tmp = [];
                                    for (var d=0; d<value[0].data.length; d++) {
                                        tmp.push([value[0].data[d]]);
                                    }
                                    value[0].data = tmp;
                                    var tmp2 = value[0].series;
                                    value[0].series = value[0].labels;
                                    value[0].labels = tmp2;
                                }
                            }
                            value = [{ key:node.id, values:(value[0] || {series:[], data:[], labels:[]}) }];
                        }
                        else {
                            node.warn("Bad data inject");
                            value = oldValue;
                        }
                    }
                    // Old style
                    else {
                        if (node.chartType !== "line") {
                            var nb = { series:[], data:[], labels:[] };
                            for (var v in value) {
                                if (value.hasOwnProperty(v)) {
                                    nb.data.push([ value[v].values ]);
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
                                    value = [{ key:node.id, values:na }];
                                }
                            }
                        }
                    }
                    //console.log("RETURN",JSON.stringify(value));
                    converted.update = false;
                    converted.updatedValues = value;
                }
                else {
                    if (value === false) { value = null; }              // let false also create gaps in chart
                    if (value !== null) {                               // let null object through for gaps
                        value = parseFloat(value);                      // only handle numbers
                        if (isNaN(value)) { return; }                   // return if not a number
                    }
                    converted.newPoint = true;
                    var label = msg.label || " ";
                    var series = msg.series || msg.topic || "";
                    //if (node.chartType === "bar" || node.chartType === "horizontalBar" || node.chartType === "pie") {
                    if (node.chartType !== "line") {
                        if (!node.newStyle || !msg.series) {
                            label = msg.topic || msg.label || " ";
                            series = msg.series || "";
                        }
                    }
                    var found = false;
                    if ((!oldValue) || (oldValue.length === 0)) {
                        oldValue = [{ key:node.id, values:{ series:[], data:[], labels:[] } }];
                    }
                    //if (node.chartType === "line" || node.chartType === "pie" || node.chartType === "bar" || node.chartType === "horizontalBar" || node.chartType === "radar") {  // Line, Bar and Radar
                    var refill = false;
                    if (node.chartType === "line") { label = ""; }
                    var s = oldValue[0].values.series.indexOf(series);
                    if (!oldValue[0].values.hasOwnProperty("labels")) { oldValue[0].values.labels = []; }
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
                        var time;
                        if (msg.timestamp !== undefined) { time = new Date(msg.timestamp).getTime(); }
                        else { time = new Date().getTime(); }
                        var limitOffsetSec = parseInt(config.removeOlder) * parseInt(config.removeOlderUnit);
                        var limitTime = time - limitOffsetSec * 1000;
                        if (time < limitTime) { return oldValue; } // ignore if too old for window
                        var point = { "x":time, "y":value };
                        oldValue[0].values.data[s].push(point);
                        converted.newPoint = [{ key:node.id, update:true, values:{ series:series, data:point, labels:label } }];
                        var rc = 0;
                        for (var u = 0; u < oldValue[0].values.data[s].length; u++) {
                            if (oldValue[0].values.data[s][u].x >= limitTime) {
                                break;  // stop as soon as we are in time window.
                            }
                            else {
                                oldValue[0].values.data[s].shift();
                                rc += 1;
                            }
                        }
                        if (config.removeOlderPoints) {
                            while (oldValue[0].values.data[s].length > config.removeOlderPoints) {
                                oldValue[0].values.data[s].shift();
                                rc += 1;
                            }
                        }
                        if (rc > 0) { converted.newPoint[0].remove = rc; }
                        var swap; // insert correctly if a timestamp was earlier.
                        for (var t = oldValue[0].values.data[s].length-2; t>=0; t--) {
                            if (oldValue[0].values.data[s][t].x <= time) {
                                break;  // stop if we are in the right place
                            }
                            else {
                                swap = oldValue[0].values.data[s][t];
                                oldValue[0].values.data[s][t] = oldValue[0].values.data[s][t+1];
                                oldValue[0].values.data[s][t+1] = swap;
                            }
                        }
                        if (swap) { converted.newPoint = true; } // if inserted then update whole chart

                        if (Date.now() > (dnow + 60000)) {
                            dnow = Date.now();
                            for (var x = 0; x < oldValue[0].values.data.length; x++) {
                                for (var y = 0; y < oldValue[0].values.data[x].length; y++) {
                                    if (oldValue[0].values.data[x][y].x >= limitTime) {
                                        break;  // stop as soon as we are in time window.
                                    }
                                    else {
                                        oldValue[0].values.data[x].shift();
                                        converted.newPoint = true;
                                        y = y - 1;
                                    }
                                }
                            }
                        }

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
                    converted.update = true;
                    converted.updatedValues = oldValue;
                }
                return converted;
            }
        };

        var chgtab = function() {
            node.receive({payload:"R"});
        };
        ui.ev.on('changetab', chgtab);

        var done = ui.add(options);

        var st = setTimeout(function() {
            node.emit("input",{payload:"start"}); // trigger a redraw at start to flush out old data.
            if (node.wires.length === 2) { // if it's an old version of the node honour it
                node.send([null, {payload:"restore", for:node.id}]);
            }
        }, 100);

        node.on("close", function() {
            ui.ev.removeListener('changetab', chgtab);
            done();
        })
    }
    RED.nodes.registerType("ui_chart", ChartNode);
};
