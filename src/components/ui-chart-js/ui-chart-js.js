/* global JustGage */
/* global angular */
angular.module('ui').directive('uiChartJs', [ '$timeout', '$interpolate',
    function ($timeout, $interpolate) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'components/ui-chart-js/ui-chart-js.html',
            link: function(scope, element, attrs) {
            
                $timeout(function() {

                    var formatTime = function(d) {
                        return d3.time.format(scope.$eval('me.item.xformat'))(new Date(d));
                    }

                    var config = {
                        colours: [{
                            backgroundColor: 'rgba(0,0,0,0)',
                            borderColor: '#A2DED0',
                            hoverBackgroundColor: '#A2DED0',
                            hoverBorderColor: '#A2DED0'
                        }],
                        data: [[]],
                        labels: [],
                        options: {
                            animation: false,
                            fill: false,
                            backgroundColor: "#A2DED0",
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
                    scope.config = config;
                    // watch the scope change and update the chart with the new value
                    scope.$watch('me.item.value', function (newValue) {
                        if (newValue) {
                            newValue = newValue[0];
                            //If we are updating, add the data points
                            if (newValue.hasOwnProperty('update') && newValue.update) {
                                //push
                                config.labels.push(newValue.values[0].label);
                                config.data[0].push(newValue.values[0].data);
                            } else {
                                //assign all the labels and data to the corresponding arrays
                                config.labels = newValue.values.labels;
                                config.data[0] = newValue.values.data;
                            }
                        }
                        
                    }); 
                }, 0);
            }
        }
    }]);
