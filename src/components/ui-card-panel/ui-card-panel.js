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
                scope.collapsed = ((localStorage.getItem(attrs.id) || false) == 'true');
                var root = element.find(".nr-dashboard-cardcontainer");
                controller.init(root);
                scope.collapseCard = function() {
                    scope.collapsed = !scope.collapsed;
                    localStorage.setItem(attrs.id,scope.collapsed);
                    var slideDuration = parseInt(attrs.slideToggleDuration, 10) || 100;
                    root.slideToggle(slideDuration);
                    setTimeout(function() { $(window).trigger('resize'); }, 100);
                }
                if (scope.collapsed === true) {
                    scope.collapsed = false;
                    setTimeout(function() {
                        element.find(".nr-dashboard-cardcarat").trigger('click');
                    }, 100);
                }
            }
        };
    }
]);
