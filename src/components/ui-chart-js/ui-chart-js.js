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
                   
                    // when new values arrive, update the chart
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
    
    var colours = ['#1F77B4', '#AEC7E8', '#FF7F0E']
      
    var config = {};
    config.data = [];
    config.series = [];
    config.labels = [];
    config.colours = colours;
    config.options = {
        animation: false,
        spanGaps: true,
        scales: {},
        legend: false
    };
    
    if (type === 'line') {
        config.options.scales.xAxes = [{
            type: 'time',
            time: {
                displayFormats: {
                    'millisecond': 'HH:mm:SS',
                    'second': 'HH:mm:SS',
                    'minute': 'HH:mm:SS',
                    'hour': 'HH:mm:SS',
                    'day': 'HH:mm:SS',
                    'week': 'HH:mm:SS',
                    'month': 'HH:mm:SS',
                    'quarter': 'HH:mm:SS',
                    'year': 'HH:mm:SS',
                }
            }
        }];
        config.options.elements = {
            line: {
                fill: false
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

    if (!isNaN(yMin) && !isNaN(yMax)) {
        config.options.scales.yAxes = [{
            ticks: {
                min: yMin,
                max: yMax
            }
        }]
    }
    if (JSON.parse(legend) && type === 'line') {
        config.options.legend = {display: true};
    }
    return config;
}
