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
					var gauge = new JustGage({
						id: 'gauge_' + scope.$eval('$id'),
						value: scope.$eval('me.item.value'),
						min: scope.$eval('me.item.min'),
						max: scope.$eval('me.item.max'),
						title: scope.$eval('me.item.title'),
						label: scope.$eval('me.item.label'),
						textRenderer: function(v) {
							return scope.$eval('me.item.getText()');
						}
					});
					
					scope.$watch('me.item.value', function (newValue) {
						gauge.refresh(newValue);
					});
				}, 0);
			}
		}
    }]);
