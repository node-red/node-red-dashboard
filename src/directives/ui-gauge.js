/* global JustGage */
/* global angular */
angular.module('ui').directive('uiGauge', [ '$timeout', '$interpolate',
    function ($timeout, $interpolate) {
        return {
			restrict: 'E',
			replace: true,
			template: '<div id="gauge_{{$id}}" class="200x160px"></div>',
			link: function(scope, element, attrs) {
				$timeout(function() {
					var gauge = new JustGage({
						id: 'gauge_' + scope.$eval('$id'),
						value: scope.$eval('me.item.value'),
						min: scope.$eval('me.item.min'),
						max: scope.$eval('me.item.max'),
						title: scope.$eval('me.item.label'),
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
