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
                    scope.getChartTemplateUrl = function() {
                        return 'components/ui-chart-js/ui-chart-js-'+type+'.html';
                   }
                    var config = loadConfiguration();
                    if (type === 'bar') {
                        config.options.fill = true;
                    }
                    scope.config = loadConfiguration();
                    // when new values arrive, update the chart
                    scope.$watch('me.item.value', function (newValue) {
                        if (newValue != undefined) {
                            newValue = newValue[0];
                            //If we are updating, add the data points
                            if (newValue.hasOwnProperty('update') && newValue.update) {
                                scope.config.labels.push(newValue.values[0].label);
                                scope.config.data[0].push(newValue.values[0].data);
                            } else {
                                //assign all the labels and data to the corresponding arrays
                                scope.config.labels = newValue.values.labels;
                                scope.config.data[0] = newValue.values.data;
                            }
                        }
                    }); 
                }, 0);
            }
        }
    }
]);

function loadConfiguration() {
    return {
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
}