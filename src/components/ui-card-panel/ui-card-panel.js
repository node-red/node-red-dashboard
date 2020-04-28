/* global angular $ */

angular.module('ui').directive('uiCardPanel', ['$timeout', '$rootScope',
    function($timeout, $rootScope) {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'components/ui-card-panel/ui-card-panel.html',
            controller: 'uiCardPanelController',
            controllerAs: 'ctrl',
            link: function (scope, element, attrs, controller) {
                scope.collapsed = ((((typeof localStorage !== 'undefined') && localStorage.getItem(attrs.id)) || false) == 'true');
                var root = element.find(".nr-dashboard-cardcontainer");
                var slideDuration = 0;
                controller.init(root);
                scope.collapseCard = function() {
                    scope.collapsed = !scope.collapsed;
                    if (typeof localStorage !== 'undefined') { localStorage.setItem(attrs.id,scope.collapsed); }
                    root.slideToggle(slideDuration);
                    $timeout(function() { $(window).trigger('resize'); }, slideDuration);
                    slideDuration = parseInt(attrs.slideToggleDuration, 10) || 150;
                    $rootScope.$emit("collapse", attrs.id, !scope.collapsed);
                }
                if (scope.collapsed === true) {
                    scope.collapsed = false;
                    $timeout(function() {
                        element.find(".nr-dashboard-cardcarat").trigger('click');
                    },20);
                }
            }
        };
    }
]);
