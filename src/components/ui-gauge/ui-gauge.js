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

					if (scope.main.selectedTab.theme !== 'theme-light') {
						gaugeOptions.gaugeWidthScale = scope.$eval('me.item.lineWidth')[scope.main.selectedTab.theme];
						gaugeOptions.gaugeColor = scope.$eval('me.item.background')[scope.main.selectedTab.theme];
                        gaugeOptions.pointer = true;
                        gaugeOptions.pointerOptions = scope.$eval('me.item.pointerOptions')[scope.main.selectedTab.theme];
                        gaugeOptions.levelColors = scope.$eval('me.item.levelColors')[scope.main.selectedTab.theme];
					}

					var gauge = new JustGage(gaugeOptions);
					scope.$watch('me.item.value', function (newValue) {
						gauge.refresh(newValue);
					});
				}, 0);
			}
		}
    }]);
