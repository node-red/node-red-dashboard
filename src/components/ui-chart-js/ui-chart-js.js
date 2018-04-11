var lineColours = [];
var barColours = [];

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

                    scope.$watchGroup(['me.item.legend','me.item.interpolate','me.item.ymin','me.item.ymax','me.item.xformat','me.item.dot','me.item.cutout','me.item.nodata','me.item.animation','me.item.spanGaps'], function (newValue) {
                        scope.config = loadConfiguration(type, scope);
                    });

                    scope.$watch('me.item.look', function (newValue) {
                        if ((type === "line") || (newValue === "line")) { delete scope.config; }
                        type = newValue;
                        scope.config = loadConfiguration(type, scope);
                    });

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

                                // Add the data
                                scope.config.data[seriesIndex].push(newValue.values.data);

                                // Remove old data point(s)
                                for (var a=0; a < (newValue.remove || 0); a++) {
                                    scope.config.data[seriesIndex].shift();
                                }
                            }
                            else {
                                // Bar charts and non update line charts replace the data
                                if (type === "line") {
                                    scope.config = loadConfiguration(type, scope);
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
                                        scope.config.colours = lineColours;
                                    }
                                    else { scope.config.colours = barColours; }
                                }
                                if (type === "pie") {
                                    scope.config.colours = barColours;
                                }
                                scope.config.data = newValue.values.data;
                                scope.config.series = newValue.values.series;
                                scope.config.labels = newValue.values.labels;
                            }
                        }
                        else {
                            // Reset config and clear data
                            delete scope.config;
                            scope.config = loadConfiguration(type, scope);
                        }
                    });
                }, 0);
                $timeout(function() {
                    scope.$broadcast("$resize");
                }, 100);
            }
        }
    }
]);

function loadConfiguration(type,scope) {
    var yMin = parseFloat(scope.$eval('me.item.ymin'));
    var yMax = parseFloat(scope.$eval('me.item.ymax'));
    var legend = scope.$eval('me.item.legend');
    var interpolate = scope.$eval('me.item.interpolate');
    var xFormat = scope.$eval('me.item.xformat');
    var showDot = scope.$eval('me.item.dot');
    var baseColours = scope.$eval('me.item.colors') || ['#1F77B4', '#AEC7E8', '#FF7F0E', '#2CA02C', '#98DF8A', '#D62728', '#FF9896', '#9467BD', '#C5B0D5'];
    var config = scope.config || {};
    var themeState = scope.$eval('me.item.theme.themeState');
    var useOneColor = scope.$eval('me.item.useOneColor');
    if (!scope.config) {
        config.data = [];
        config.series = [];
        config.labels = [];
        config.nodata = true;
    }
    config.options = {
        animation: scope.$eval('me.item.animation'),
        spanGaps: scope.$eval('me.item.spanGaps'),
        scales: {},
        legend: false,
        responsive: true,
        maintainAspectRatio: false
    };
    if (type === 'pie') {
        config.options.cutoutPercentage = scope.$eval('me.item.cutout') || 0;
        config.options.elements = { arc: { borderWidth:0 }};
    }

    //Build colours array
    config.colours = config.colours || baseColours;
    barColours = [];
    lineColours = [];
    baseColours.forEach(function(colour, index) {
        lineColours.push({
            backgroundColor: colour,
            borderColor: colour
        });
        barColours.push({
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
            },
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
                    'year': xFormat,
                }
            };
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
                    if (isNaN(largest) || (largest < 1000000)) { return largest; }
                    for (var i=1; i<tooltip.length; i++) {
                        if (tooltip[i].xLabel > largest) {
                            largest = tooltip[i].xLabel;
                        }
                    }
                    if (xFormat !== "auto") { return moment(largest).format(xFormat); }
                    else {
                        return moment(largest).calendar(null, {
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
                radius: showDot ? 2 : 0,
                hitRadius: 4,
                hoverRadius: 4 }
        }
        switch (interpolate) {
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
        if (isNaN(yMin)) { yMin = 0; }
    }
    else if (type === "radar") {
        config.options.scale = {ticks:{}};
        if (!isNaN(yMin)) { config.options.scale.ticks.min = yMin; }
        if (!isNaN(yMax)) { config.options.scale.ticks.max = yMax; }
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
    if (type !== 'bar' && type !== 'horizontalBar' && JSON.parse(legend)) {
        config.options.legend = {
            display:true,
            position:'top',
            labels: { boxWidth:10, fontSize:12, padding:8 }
        };
        if ((type === "pie") || (type === "polar-area") || (type === "radar")) {
            config.options.legend.position = 'left';
        }

        //set colours based on widget text colour
        if (themeState) {
            config.options.legend.labels.fontColor = themeState['widget-textColor'].value;
        }
    }

    return config;
}
