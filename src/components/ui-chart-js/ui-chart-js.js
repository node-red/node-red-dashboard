/* global JustGage */
/* global angular */
angular.module('ui').directive('uiChartJs', [ '$timeout', '$interpolate',
    function ($timeout, $interpolate) {
        return {
            restrict: 'E',
            replace: true,
            template: '<div ng-include="getChartTemplateUrl()"></div>',
            link: function(scope, element, attrs) {
                $timeout(function() {
                    var type = scope.$eval('me.item.look');
                    const LINE_TYPE = 'line';
                    const BAR_TYPE = 'bar';
                    scope.getChartTemplateUrl = function() {
                        return 'components/ui-chart-js/ui-chart-js-'+type+'.html';
                    }                    
                    scope.config = loadConfiguration(type, scope);
                   
                    // When new values arrive, update the chart
                    scope.$watch('me.item.value', function (newValue) {

                        if (newValue != undefined && newValue.length > 0) {
                            scope.config.nodata = false;
                            newValue = newValue[0];

                            // Updating line charts push to the data arrays
                            if (type === LINE_TYPE && newValue.update) {
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
                                    if (seriesIndex > scope.config.data.length) { scope.config.data.push([]); };

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

                            } else {
                                // Bar charts and non update line charts replace the data
                                scope.config.data = newValue.values.data;
                                if (type === LINE_TYPE) { scope.config.series = newValue.values.series; };
                                if (type === BAR_TYPE) { scope.config.labels = newValue.values.series; };
                                
                            }
                        } else {
                            // Flow deployed - reset config
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
    var colours = ['#1F77B4', '#AEC7E8', '#FF7F0E', '#2CA02C', '#98DF8A', '#D62728', '#FF9896', '#9467BD', '#C5B0D5'];
    var config = {};
    config.data = [];
    config.series = [];
    config.labels = [];
    config.colours = colours;
    config.options = {
        animation: false,
        spanGaps: true,
        scales: {},
        legend: false,
        responsive: true
    };
    
    if (type === 'line') {
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
            }
        }];
        config.options.elements = {
            line: {
                fill: false
            }
        }
        config.options.tooltips = {
            callbacks: {
                title: function(tooltip, data) {
                    // Display and format the most recent time value as the title.
                    // This ensures the title reflects the xAxis time.
                    // TODO - Remove the unnecessary series from tooltip
                    // Currently, all series will be displayed
                    // in the tooltip even if there is no data point at 
                    // that time (x value).
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
        switch(interpolate) {
            case 'linear':
                config.options.elements.line.tension = 0;
                break;
            case 'bezier':
                config.options.elements.line.tension = 0.4;
                break;
            case 'step':
                config.options.elements.line.stepped = true;
                break;
        } 
    }

    config.options.scales.yAxes = [{}];
    if (!isNaN(yMin) && !isNaN(yMax)) {
        config.options.scales.yAxes[0].ticks = {
            min: yMin,
            max: yMax
        }
    }
    if (type === 'bar') {
        config.options.scales.yAxes[0].beginAtZero = true;
    }
    if (type === 'line' && JSON.parse(legend)) {
        config.options.legend = {display: true};
    }
    return config;
}
