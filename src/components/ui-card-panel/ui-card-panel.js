/* global angular */

angular.module('ui').directive('uiCardPanel', [
    function() {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'components/ui-card-panel/ui-card-panel.html',
            controller: 'uiCardPanelController',
            controllerAs: 'ctrl',

            link: function (scope, element, attrs, controller) {
                var root = element.find(".nr-dashboard-cardcontainer");
                controller.init(root);
				
				scope.collapseCard = function () {
				var slideDuration = parseInt(attrs.slideToggleDuration, 10) || 500;
				root.slideToggle(slideDuration);
				setTimeout(function() {$(window).trigger('resize');}, 600);
				}
            }
        };
    }
]);
