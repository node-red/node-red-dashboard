
/* global angular */
angular.module('ui').directive('uiChartJs', [ '$timeout', '$interpolate',
    function ($timeout, $interpolate) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'components/ui-chart-js/ui-chart-js.html',
            link: function(scope, element, attrs) {
                $timeout(function() {
                    var type = scope.$eval('me.item.look');
                    var useOneColor = scope.$eval('me.item.useOneColor');

                    // Chart.Tooltip.positioners = {};
                    // Chart.Tooltip.positioners.cursor = function(chartElements, coordinates) {
                    //     return coordinates;
                    // };

                    // Fix autoskip so last two scale labels don't overlap
                    Chart.scaleService.updateScaleDefaults('time', {
                        afterBuildTicks: function(me) {
                            var end = me.ticks.length-1;
                            if (end > 1) {
                                var lastDiff = me.parseTime(me.ticks[end]).diff(me.parseTime(me.ticks[end-1]));
                                var penulDiff = me.parseTime(me.ticks[end-1]).diff(me.parseTime(me.ticks[end-2]));
                                if (lastDiff < penulDiff) {
                                    me.ticks.splice(end-1,1);
                                }
                            }
                        }
                    });

                    // Override the default "miter" linejoin setting
                    Chart.defaults.global.elements.line.borderJoinStyle = "round";

                    Chart.plugins.register({
                        beforeDatasetsDraw: function(chartInstance) {
                            var ctx = chartInstance.chart.ctx;
                            var chartArea = chartInstance.chartArea;
                            ctx.save();
                            ctx.beginPath();
                            ctx.rect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
                            ctx.clip();
                        },
                        afterDatasetsDraw: function(chartInstance) {
                            chartInstance.chart.ctx.restore();
                        }
                    });

                    // Watch for any changes to controls
                    scope.$watchGroup(['me.item.legend','me.item.interpolate','me.item.ymin','me.item.ymax','me.item.xformat','me.item.dot','me.item.cutout','me.item.nodata','me.item.animation','me.item.spanGaps','me.item.options','me.item.look'], function (newValue, oldValue) {
                        type = newValue[11];
                        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                            scope.config = loadConfiguration(type, scope);
                        }
                    });

                    // When new values arrive, update the chart
                    scope.$watch('me.item.value', function (newValue) {
                        if (newValue !== undefined && newValue.length > 0) {
                            newValue = newValue[0];
                            if (!scope.hasOwnProperty("config")) {
                                scope.config = loadConfiguration(type, scope);
                            }
                            scope.config.nodata = false;

                            // Updating line charts push to the data arrays
                            if (type === 'line' && newValue.update) {
                                // Find the series index
                                var seriesName = newValue.values.series;
                                var seriesIndex = scope.config.series.indexOf(seriesName);
                                // If it's a new series, add it
                                if (seriesIndex === -1) {
                                    scope.config.series.push(seriesName);
                                    seriesIndex = scope.config.series.indexOf(seriesName);
                                    scope.config.data.push([]);
                                }

                                // Ensure the data array is of the correct length
                                if (seriesIndex > scope.config.data.length) { scope.config.data.push([]); }

                                // Remove old data point(s)
                                if (newValue.remove) { scope.config.data[seriesIndex].splice(0, newValue.remove); }

                                // Add the data
                                scope.config.data[seriesIndex].push(newValue.values.data);
                            }
                            else {
                                // Bar charts and non update line charts replace the data
                                if (type === "line") {
                                    //scope.config = loadConfiguration(type, scope);
                                    if (newValue.values.data[0][0] === undefined) {
                                        var flag = false;
                                        for (var i=1; i < newValue.values.data.length; i++ ) {
                                            if ((newValue.values.data[i][0]) && (newValue.values.data[i][0].hasOwnProperty("x"))) { flag = true; }
                                        }
                                        if (flag) { newValue.values.data[0] = [{x:null, y:null}]; }
                                        else { newValue.values.data[0] = [null]; }
                                    }
                                    if (!isNaN(newValue.values.data[0][0])) {
                                        delete scope.config.options.scales.xAxes[0].type;
                                        delete scope.config.options.scales.xAxes[0].time;
                                    }
                                }
                                if ((type === "bar") || (type === "horizontalBar")) {
                                    if ((newValue.values.series.length > 1) || useOneColor) {
                                        scope.config.colours = scope.lineColours;
                                    }
                                    else { scope.config.colours = scope.barColours; }
                                }
                                if (type === "pie") {
                                    scope.config.colours = scope.barColours;
                                }
                                else if (type === "polar-area") {
                                    if (scope.config.options && scope.config.options.useDifferentColor) {
                                        scope.config.colours = scope.barColours;
                                        var colors = [];
                                        scope.barColours.map(function (v) {
                                            var item = Object.assign({}, v);
                                            var bgColor = [];
                                            item.backgroundColor.map(function (c) {
                                                var op = (0.7 / newValue.values.series.length) + 0.1;
                                                var rgb = tinycolor(c).toRgb();
                                                var nc = "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+op+")";
                                                bgColor.push(nc);
                                            });
                                            item.backgroundColor = bgColor;
                                            colors.push(item);
                                        });
                                        scope.config.colours = colors;
                                    }
                                }
                                scope.config.data = newValue.values.data;
                                scope.config.series = newValue.values.series;
                                scope.config.labels = newValue.values.labels;
                            }
                        }
                        else {
                            // Clear data and reset config
                            delete scope.config;
                            scope.config = loadConfiguration(type, scope);
                        }
                    });
                }, 0);
                $timeout(function() {
                    scope.$broadcast("$resize");
                }, 50);
            }
        }
    }
]);

function loadConfiguration(type,scope) {
    //console.log("LOAD CONFIG",type,scope);
    var config = scope.config || { data:[], series:[], labels:[], nodata:true }
    var item = scope.$eval('me.item');
    var yMin = parseFloat(item.ymin);
    var yMax = parseFloat(item.ymax);
    var xFormat = item.xformat;
    var themeState = scope.$eval('main.selectedTab.theme.themeState');
    //var themeState = item.theme ? item.theme.themeState : false;
    var useUTC = item.useUTC || false;

    config.options = {
        animation: item.animation,
        spanGaps: item.spanGaps,
        scales: {},
        legend: false,
        responsive: true,
        maintainAspectRatio: false,
        useDifferentColor: item.useDifferentColor
    };
    if (type === 'pie') {
        config.options.cutoutPercentage = item.cutout || 0;
        config.options.elements = { arc: { borderWidth:0 }};
    }

    //Build colours array
    var bColours = item.colors || ['#1F77B4', '#AEC7E8', '#FF7F0E', '#2CA02C', '#98DF8A', '#D62728', '#FF9896', '#9467BD', '#C5B0D5'];
    var baseColours = bColours.concat([
        '#7EB3C6','#BB9A61','#3F8FB9','#57A13F',
        '#BC5879','#6DC2DF','#D7D185','#91CA96',
        '#DEB64D','#31615A','#B46E3F','#9B2FAA',
        '#61A240','#AA3167','#9D6D5E','#3498DB',
        '#EC7063','#DAF7A6','#FFC300','#D98880',
        '#48C9B0','#7FB3D5','#F9E79F','#922B21']);
    config.colours = config.colours || baseColours;
    scope.barColours = [];
    scope.lineColours = [];
    baseColours.forEach(function(colour, index) {
        scope.lineColours.push({
            backgroundColor: colour,
            borderColor: colour
        });
        scope.barColours.push({
            backgroundColor: baseColours,
            borderColor: "#888",
            borderWidth: 1
        });
    });

    // Configure axis
    if (type === 'line') {
        config.options.scales.xAxes = [{
            type: 'time',
            scaleLabel: {
                fontColor: "#fff",
                display: true
            }
        }];
        if (xFormat !== "auto") {
            config.options.scales.xAxes[0].time = {
                // Override xAxes formats
                displayFormats: {
                    'millisecond': xFormat,
                    'second': xFormat,
                    'minute': xFormat,
                    'hour': xFormat,
                    'day': xFormat,
                    'week': xFormat,
                    'month': xFormat,
                    'quarter': xFormat,
                    'year': xFormat
                }
            }
        }
        if (useUTC === true) {
            config.options.scales.xAxes[0].time.parser = function (m) {
                return moment.utc(m);
            }
        }

        config.options.tooltips = {
            mode: 'x-axis',
            position: 'cursor',
            bodyFontSize: 10,
            bodySpacing: 0,
            callbacks: {
                title: function(tooltip, data) {
                    // Display and format the most recent time value as the title.
                    // This ensures the title reflects the xAxis time.
                    var largest = tooltip[0].xLabel;
                    largest = new Date(largest).getTime();
                    if (isNaN(largest) || (largest < 1000000)) { return largest; }
                    for (var i=1; i<tooltip.length; i++) {
                        if (tooltip[i].xLabel > largest) {
                            largest = tooltip[i].xLabel;
                        }
                    }
                    var mo = moment(largest);
                    if (useUTC === true) { mo = moment.utc(largest); }
                    if (xFormat !== "auto") { return mo.format(xFormat); }
                    else {
                        return mo.calendar(null, {
                            sameDay: 'HH:mm:ss',
                            nextDay: 'HH:mm',
                            lastDay: 'HH:mm',
                            lastWeek: 'MMM D, hA',
                            sameElse: 'lll'
                        });
                    }
                }
            }
        }
        config.options.hover = {
            mode: 'x-axis'
        }
        config.options.elements = {
            line: {
                fill: false
            },
            point: {
                radius: item.dot ? 2 : 0,
                hitRadius: 4,
                hoverRadius: 4 }
        }
        switch (item.interpolate) {
            case 'cubic': {
                config.options.elements.line.cubicInterpolationMode = "default";
                break;
            }
            case 'monotone': {
                config.options.elements.line.cubicInterpolationMode = "monotone";
                break;
            }
            case 'linear': {
                config.options.elements.line.tension = 0;
                break;
            }
            case 'bezier': {
                config.options.elements.line.tension = 0.4;
                break;
            }
            case 'step': {
                config.options.elements.line.stepped = true;
                break;
            }
        }
    }
    else if ((type === 'bar') || (type === 'horizontalBar')) {
        config.options.scales.xAxes = [{}];
    }
    else if (type === "radar") {
        config.options = {
            scale: {
                ticks: {
                    beginAtZero: true,
                    showLabelBackdrop: false
                }
            }
        };
        if (!isNaN(yMin)) { config.options.scale.ticks.min = yMin; }
        if (!isNaN(yMax)) { config.options.scale.ticks.max = yMax; }
        if (themeState) {
            var tc = themeState['widget-textColor'].value;
            var gc = tinycolor(tc).toRgb();
            var gl = "rgba("+gc.r+","+gc.g+","+gc.b+",0.1)";
            var gl2 = "rgba("+gc.r+","+gc.g+","+gc.b+",0.3)";
            var gl3 = "rgba("+gc.r+","+gc.g+","+gc.b+",0.6)";
            config.options.scale.ticks.fontColor= gl3; // labels such as 10, 20, etc
            config.options.scale.ticks.fontSize = 8;
            config.options.scale.pointLabels = { fontColor: tc, fontSize: 14 }; // labels around the edge like 'Running'
            config.options.scale.gridLines = { color: gl };
            config.options.scale.angleLines = { color: gl2 }; // lines radiating from the center
        }
    }

    // Configure scales
    if ((type !== 'pie') && (type !== 'polar-area') && (type !== 'radar')) {
        config.options.scales.yAxes = [{}];
        config.options.scales.xAxes[0].ticks = {};
        config.options.scales.yAxes[0].ticks = {};

        if ((type === 'line') || (type === 'bar')) {
            config.options.scales.yAxes[0].ticks.autoSkip = true;
            config.options.scales.yAxes[0].ticks.callback = function(value, index, values) {
                var locale = (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;
                return value.toLocaleString(locale);
            }
            if (!isNaN(yMin)) { config.options.scales.yAxes[0].ticks.min = yMin; }
            if (!isNaN(yMax)) { config.options.scales.yAxes[0].ticks.max = yMax; }
            if ((!isNaN(yMin)) && (!isNaN(yMax))) {
                config.options.scales.yAxes[0].ticks.stepSize = (yMax - yMin) / 4;
            }
            if (type === 'bar') {
                config.options.scales.yAxes[0].ticks.beginAtZero = true;
            }
        }

        if (type === 'horizontalBar') {
            config.options.scales.xAxes[0].ticks.beginAtZero = true;
            if (!isNaN(yMin)) { config.options.scales.xAxes[0].ticks.min = yMin; }
            if (!isNaN(yMax)) { config.options.scales.xAxes[0].ticks.max = yMax; }
            config.options.scales.xAxes[0].ticks.callback = function(value, index, values) {
                var locale = (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;
                return value.toLocaleString(locale);
            }
        }

        // Theme settings
        if (themeState) {
            config.options.scales.xAxes[0].ticks.fontColor = config.options.scales.yAxes[0].ticks.fontColor = themeState['widget-textColor'].value;
            var gridColor = tinycolor(themeState['widget-textColor'].value).toRgb();
            var gridlineColour = "rgba("+gridColor.r+","+gridColor.g+","+gridColor.b+",0.1)";

            config.options.scales.xAxes[0].gridLines = config.options.scales.yAxes[0].gridLines = {
                color: gridlineColour,
                zeroLineColor: gridlineColour
            }
        }

        // Ensure scale labels do not rotate
        config.options.scales.xAxes[0].ticks.maxRotation = 0;
        config.options.scales.xAxes[0].ticks.autoSkipPadding = 4;
        config.options.scales.xAxes[0].ticks.autoSkip = true;
    }

    // Configure legend
    //if (type !== 'bar' && type !== 'horizontalBar' && JSON.parse(legend)) {
    if ((item.legend === true) || (item.legend === "true")) {
        config.overrides = [];
        config.options.legend = {
            display:true,
            position:'top',
            labels: { boxWidth:10, fontSize:12, padding:8 },
            onClick: function(e, legendItem) {
                var index = legendItem.datasetIndex || 0;
                var ci = this.chart;
                var meta;
                if ((type === "pie") || (type === "polar-area")) {
                    for (var l = 0; l < ci.config.data.datasets.length; l++) {
                        meta = ci.getDatasetMeta(l);
                        meta.data[legendItem.index].hidden = meta.data[legendItem.index].hidden === false ? true : false;
                    }
                }
                else {
                    meta = ci.getDatasetMeta(index);
                    meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                }
                config.overrides[index] = {hidden:meta.hidden};
                ci.update();
            }
        };
        if ((type === "pie") || (type === "polar-area") || (type === "radar")) {
            config.options.legend.position = 'left';
        }
        //set colours based on widget text colour
        if (themeState) {
            config.options.legend.labels.fontColor = themeState['widget-textColor'].value;
        }
    }

    // Configure custom tooltip
    if ((type === "pie") || (type === "polar-area")) {
        // show series instead of labels
        config.options.tooltips = {
            callbacks: {
                title: function(item, data) {
                    return data.labels[item[0].index];
                },
                label: function(item, data) {
                    var ds = data.datasets[item.datasetIndex];
                    var label = ds.label || "";
                    if (label) { label += ": "; }
                    label += ds.data[item.index];
                    return label;
                }
            }
        };
    }

    // Allow override of any options if really required.
    config.options = Object.assign({},config.options,item.options);
    return config;
}
