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
                    scope.config = loadConfiguration(type, scope);
                    
                    // Fix autoskip so last two scale labels don't overlap
                    Chart.scaleService.updateScaleDefaults('time', {
                        afterBuildTicks: function(me){
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

                    // When new values arrive, update the chart
                    scope.$watch('me.item.value', function (newValue) {
                        if (newValue !== undefined && newValue.length > 0) {
                            scope.config.nodata = false;
                            newValue = newValue[0];

                            // Updating line charts push to the data arrays
                            if (type === 'line' && newValue.update) {
                                // Find the series index
                                var seriesLabel = newValue.key;
                                var seriesIndex = scope.config.series.indexOf(seriesLabel);

                                // If it's a new series, add it
                                if (seriesIndex === -1) {
                                    scope.config.series.push(seriesLabel);
                                    seriesIndex = scope.config.series.indexOf(seriesLabel);
                                    scope.config.data.push([]);
                                }

                                // Ensure the data array is of the correct length
                                if (seriesIndex > scope.config.data.length) { scope.config.data.push([]); }

                                // Add the data
                                scope.config.data[seriesIndex].push(newValue.values.data);

                                // Check for removal cases
                                if (newValue.removedData.length > 0) {
                                    newValue.removedData.forEach(function(series, index) {
                                        scope.config.data[series.seriesIndex].splice(0, series.noPoints);
                                    })
                                }

                                // Removal of series
                                if (newValue.removedSeries.length > 0) {
                                    newValue.removedSeries.forEach(function(index) {
                                        scope.config.data.splice(index, 1);
                                        scope.config.series.splice(index, 1);
                                    })
                                }
                            }
                            else {
                                // Bar charts and non update line charts replace the data
                                scope.config.data = newValue.values.data;
                                if (type === 'line') { scope.config.series = newValue.values.series }
                                else { scope.config.labels = newValue.values.series; }
                            }
                        }
                        else {
                            // Reset config and clear data
                            scope.config = loadConfiguration(type, scope);
                            scope.config.nodata = true;
                        }
                    });
                }, 0);
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
    var baseColours = ['#1F77B4', '#AEC7E8', '#FF7F0E', '#2CA02C', '#98DF8A', '#D62728', '#FF9896', '#9467BD', '#C5B0D5'];
    var config = {};
    config.data = [];
    config.series = [];
    config.labels = [];
    config.options = {
        animation: false,
        spanGaps: true,
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
    var colours = [];
    baseColours.forEach(function(colour, index) {
        colours.push({
            backgroundColor: colour,
            borderColor:colour
            // hoverBackgroundColor:colour,
            // hoverBorderColor:colour
        });
    });

    // Configure axis
    if (type === 'line') {
        config.colours = colours;
        config.options.scales.xAxes = [{
            type: 'time',
            time: {
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
            },
            scaleLabel: {
                fontColor: "#fff",
                display: true
            },
        }];
        config.options.tooltips = {
            mode: 'x-axis',
            callbacks: {
                title: function(tooltip, data) {
                    // Display and format the most recent time value as the title.
                    // This ensures the title reflects the xAxis time.
                    var largest = tooltip[0].xLabel;
                    for (var i=1; i<tooltip.length; i++) {
                        if (tooltip[i].xLabel > largest) {
                            largest = tooltip[i].xLabel;
                        }
                    }
                    return moment(largest).format(xFormat);
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
                radius: 0,
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
        config.colours = baseColours;
        config.options.scales.xAxes = [{}];
        if (isNaN(yMin)) { yMin = 0; }
    }

    // Configure scales
    if (type !== 'pie') {
        config.options.scales.yAxes = [{}];
        config.options.scales.xAxes[0].ticks = {};
        config.options.scales.yAxes[0].ticks = {};

        if ((type === 'line') || (type === 'bar')) {
            if (!isNaN(yMin)) { config.options.scales.yAxes[0].ticks.min = yMin; }
            if (!isNaN(yMax)) { config.options.scales.yAxes[0].ticks.max = yMax; }
            if (type === 'bar') {
                config.options.scales.yAxes[0].ticks.beginAtZero = true;
            }
        }
        if (type === 'horizontalBar') {
            config.options.scales.xAxes[0].ticks.beginAtZero = true;
            if (!isNaN(yMin)) { config.options.scales.xAxes[0].ticks.min = yMin; }
            if (!isNaN(yMax)) { config.options.scales.xAxes[0].ticks.max = yMax; }
        }

        // Theme settings
        if (scope.$eval('me.item.theme') === 'theme-dark') {
            config.options.scales.xAxes[0].ticks.fontColor = config.options.scales.yAxes[0].ticks.fontColor = "#fff";
            config.options.scales.xAxes[0].gridLines = config.options.scales.yAxes[0].gridLines = {
                color:"rgba(255,255,255,0.1)",
                zeroLineColor:"rgba(255,255,255,0.1)"
            }
        }
        else {
            config.options.scales.xAxes[0].ticks.fontColor = config.options.scales.yAxes[0].ticks.fontColor = "#666";
            config.options.scales.xAxes[0].gridLines = config.options.scales.yAxes[0].gridLines = {
                color:"rgba(0,0,0,0.1)",
                zeroLineColor:"rgba(0,0,0,0.1)"
            }
        }
        // Ensure scale labels do not rotate
        config.options.scales.xAxes[0].ticks.maxRotation = 0;
        config.options.scales.xAxes[0].ticks.autoSkipPadding = 4;
        config.options.scales.xAxes[0].ticks.autoSkip = true;
    }
    else {
        //Pie chart
        config.colours = baseColours;
    }

    // Configure legend
    if (type !== 'bar' && type !== 'horizontalBar' && JSON.parse(legend)) {
        config.options.legend = { display: true };
        if (type === 'pie') {
            config.options.legend.position = 'left';
        }
        if (scope.$eval('me.item.theme') === 'theme-dark') {
            config.options.legend.labels = { fontColor:"#fff" };
        }
        else {
            config.options.legend.labels = {fontColor:"#666"};
        }
    }
    return config;
}
