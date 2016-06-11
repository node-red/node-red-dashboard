/* global JustGage */
/* global angular */
angular.module('ui').directive('uiGauge', [ '$timeout', '$interpolate',
    function ($timeout, $interpolate) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'components/ui-gauge/ui-gauge.html',
            link: function(scope, element, attrs) {
                $timeout(function() {
                    var gauge;
                    // Wave type gauge
                    if (scope.$eval('me.item.gtype') === 'wave') {
                        var gaugeConfig = liquidFillGaugeDefaultSettings();
                        gaugeConfig.minValue = scope.$eval('me.item.min');
                        gaugeConfig.maxValue = scope.$eval('me.item.max');
                        gaugeConfig.textVertPosition = 0.33;
                        gaugeConfig.waveHeight = 0.08;
                        //gaugeConfig.waveAnimateTime = 10000;
                        gaugeConfig.waveRise = false;
                        gaugeConfig.displayPercent = false;

                        // TODO - Opinionated colours - should be moved to themes
                        gaugeConfig.circleColor = scope.$eval('me.item.waveoptions.circleColor')[scope.main.selectedTab.theme];
                        gaugeConfig.waveColor = scope.$eval('me.item.waveoptions.waveColor')[scope.main.selectedTab.theme];
                        gaugeConfig.textColor = scope.$eval('me.item.waveoptions.textColor')[scope.main.selectedTab.theme];
                        gaugeConfig.waveTextColor = scope.$eval('me.item.waveoptions.waveTextColor')[scope.main.selectedTab.theme];

                        gauge = loadLiquidFillGauge("gauge"+scope.$eval('$id'), scope.$eval('me.item.value'), gaugeConfig);

                        scope.$watch('me.item.value', function (newValue) {
                            gauge.update(newValue);
                        });
                    }
                    // Justgage type gauges
                    else {
                        var gaugeOptions = {
                            id: 'gauge_' + scope.$eval('$id'),
                            value: scope.$eval('me.item.value'),
                            min: scope.$eval('me.item.min'),
                            max: scope.$eval('me.item.max'),
                            title: scope.$eval('me.item.title'),
                            label: scope.$eval('me.item.label'),
                            pointer: true,
                            textRenderer: function(v) {
                                return scope.$eval('me.item.getText()');
                            }
                        }
                        if (scope.$eval('me.item.gtype') === 'donut') {
                            gaugeOptions.donut = true;
                            //gaugeOptions.donutStartAngle = 270;
                            gaugeOptions.pointer = false;
                        }

                        if (scope.main.selectedTab.theme !== 'theme-light') {
                            gaugeOptions.gaugeWidthScale = scope.$eval('me.item.gageoptions.lineWidth')[scope.main.selectedTab.theme];
                            gaugeOptions.gaugeColor = scope.$eval('me.item.gageoptions.backgroundColor')[scope.main.selectedTab.theme];
                            gaugeOptions.pointerOptions = scope.$eval('me.item.gageoptions.pointerOptions')[scope.main.selectedTab.theme];
                            gaugeOptions.levelColors = scope.$eval('me.item.gageoptions.levelColors')[scope.main.selectedTab.theme];
                        }

                        if (scope.$eval('me.item.gtype') === 'compass') {
                            gaugeOptions.donut = true;
                            gaugeOptions.gaugeWidthScale = 0.2;
                            gaugeOptions.pointer = true;
                            gaugeOptions.refreshAnimationTime = 5;
                            gaugeOptions.pointerOptions = {toplength:12, bottomlength:12, bottomwidth:5, color:scope.$eval('me.item.gageoptions.compassColor')[scope.main.selectedTab.theme]};
                            gaugeOptions.gaugeColor = scope.$eval('me.item.gageoptions.compassColor')[scope.main.selectedTab.theme];
                            gaugeOptions.levelColors = [scope.$eval('me.item.gageoptions.compassColor')[scope.main.selectedTab.theme]];
                        }

                        gauge = new JustGage(gaugeOptions);
                        scope.$watch('me.item.value', function (newValue) {
                            if (scope.$eval('me.item.gtype') === 'compass') {
                                var r = gaugeOptions.max - gaugeOptions.min;
                                newValue = newValue % r;
                                if (newValue < 0) { newValue += r; }
                            }
                            gauge.refresh(newValue);
                        });
                    }
                }, 0);
            }
        }
    }]);
