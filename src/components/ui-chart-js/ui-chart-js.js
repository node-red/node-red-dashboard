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

                    var config = {
                        colours: [{
                            backgroundColor: 'rgba(0,0,0,0)',
                            borderColor: '#A2DED0',
                            hoverBackgroundColor: '#A2DED0',
                            hoverBorderColor: '#A2DED0'
                        }],
                        data: [[100]],
                        labels: [100],
                        options: {
                            animation: false,
                            fill: false,
                            backgroundColor: "#A2DED0"
                        }
                    }
                    scope.config = config;
                    // watch the scope change and update the chart with the new value
                    scope.$watch('me.item.value', function (newValue) {

                        if (newValue) {
                            console.log(newValue);
                            console.log('^new value in ui-chart-js');

                            newValue = newValue[0];
                            
                            console.log(config);

                            //if there are multiple values then this means the data is coming across for the first time so swap out the arrays
                            if (newValue.hasOwnProperty('update') && newValue.update) {
                                //push
                                config.labels.push(newValue.values[0].label);
                                config.data[0].push(newValue.values[0].data);
                            } else {
                                //assign all the labels and data to the array
                                config.labels = newValue.values.labels;
                                config.data[0] = newValue.values.data;
                            }
                        }
                        
                    }); 
                }, 0);
            }
        }
    }]);
