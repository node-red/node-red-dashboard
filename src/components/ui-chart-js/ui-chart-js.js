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
                    scope.config = loadConfiguration(type);

                    // when new values arrive, update the chart
                    scope.$watch('me.item.value', function (newValue) {

                        if (newValue != undefined && newValue.length > 0) {
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
                                    if (seriesIndex < scope.config.data.length) { scope.config.data.push([]); };

                                    // Add the data
                                    scope.config.data[seriesIndex].push(newValue.values.data);

                            } else {
                                // Bar charts and non update line charts replace the data
                                scope.config.data = newValue.values.data;
                                if (type === LINE_TYPE) { scope.config.series = newValue.values.series; };
                                if (type === BAR_TYPE) { scope.config.labels = newValue.values.series; };
                                
                            }
                        } else {
                            // Flow deployed - reset data and labels
                            scope.config.data = [];
                            scope.config.labels = [];
                            scope.config.series = [];
                        }
                    }); 
                }, 0);
            }
        }
    }
]);

function loadConfiguration(type) {
    if (type === 'line') {
        return {
            data: [],
            series: [],
            options: {
                animation: false,
                elements: {
                    line: {
                        fill: false
                    }
                },
                spanGaps: true,
                scales: {
                    xAxes: [{
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
                    }]  
                }
            }
        }
    } else {
        //bar chart returns no configuration
        return {};
    }
}
