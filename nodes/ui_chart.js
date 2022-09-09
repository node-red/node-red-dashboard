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
        //var pixelsWide = ((config.width || group.config.width || 6) - 1) * 43 - 15;
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
                useUTC: config.useUTC || false,
                animation: false,
                spanGaps: false,
                useDifferentColor: config.useDifferentColor || false,
                options: {},
                className: config.className || '',
            },
            convertBack: function(data) {
                if (data) {
                    if (data[0] && data[0].hasOwnProperty("values")) {
                        return [data[0].values];
                    }
                    if (data.length == 0) {
                        return [];
                    }
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
                    if (value[0].hasOwnProperty("series") && value[0].hasOwnProperty("data")) {
                        if (!Array.isArray(value[0].series)) { node.error("series not array",msg); return; }
                        if (!Array.isArray(value[0].data)) { node.error("Data not array",msg); return; }
                        var flag = true;
                        for (var dd = 0; dd < value[0].data.length; dd++ ) {
                            if (!isNaN(value[0].data[dd][0])) { flag = false; }
                        }
                        if (node.chartType === "line") {
                            if (flag) { delete value[0].labels; }
                            if (config.removeOlderPoints) {
                                for (var dl=0; dl < value[0].data.length; dl++ ) {
                                    if (value[0].data[dl].length > config.removeOlderPoints) {
                                        value[0].data[dl] = value[0].data[dl].slice(-config.removeOlderPoints);
                                    }
                                }
                            }
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
                        if (!msg.series) {
                            label = msg.topic || msg.label || " ";
                            series = msg.series || "";
                        }
                    }
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
                            if (oldValue[0].values.data[s][u].x >= limitTime) { break; } // stop as soon as we are in time window.
                            else { rc += 1; }
                        }
                        if (rc > 0) { oldValue[0].values.data[s].splice(0,rc); }
                        if (config.removeOlderPoints) {
                            var rc2 = oldValue[0].values.data[s].length-config.removeOlderPoints;
                            if (rc2 > 0) { oldValue[0].values.data[s].splice(0,rc2); rc = rc2;}
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
                                        oldValue[0].values.data[x].splice(0,1);
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
        }, 100);

        node.on("close", function() {
            if (st) { clearTimeout(st); }
            ui.ev.removeListener('changetab', chgtab);
            done();
        })
    }
    RED.nodes.registerType("ui_chart", ChartNode);
};
