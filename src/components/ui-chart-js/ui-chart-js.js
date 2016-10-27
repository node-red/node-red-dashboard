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
                                        
                    scope.config = loadConfiguration(type);
                    // when new values arrive, update the chart
                    scope.$watch('me.item.value', function (newValue) {
                        if (newValue != undefined) {
                            newValue = newValue[0];
                            
                            // If we are updating, push to arrays
                            if (newValue.update) {

                                //Find the series index
                                var seriesLabel = newValue.key;
                                var seriesIndex = scope.config.series.indexOf(seriesLabel);

                                //If it's a new series, add it
                                if (seriesIndex === -1) {
                                    scope.config.series.push(seriesLabel);
                                    seriesIndex = scope.config.series.indexOf(seriesLabel);
                                    scope.config.data.push([]);
                                } 

                                if (seriesIndex < scope.config.data.length) {
                                    scope.config.data.push([]);
                                }

                                scope.config.data[seriesIndex].push(newValue.values.data);

                            } else {
                                //Display all data
                                scope.config.data = newValue.values.data;
                                scope.config.series = newValue.values.series;
                            }
                        }
                    }); 
                }, 0);
            }
        }
    }
]);

function loadConfiguration(type) {

    // Set colours
    var colours = [{
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: '#A2DED0',
        hoverBackgroundColor: '#A2DED0',
        hoverBorderColor: '#A2DED0'
    }, {
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: '#803690',
        hoverBackgroundColor: '#803690',
        hoverBorderColor: '#803690'
    }];

    return {
        colours: colours,
        data: [],
        series: [],
        options: {
            animation: false,
            backgroundColor: "#A2DED0",
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
}