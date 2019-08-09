/* global angular */
angular.module('ui').directive('uiTouchend',
    function uiTouchend () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('touchend', doTouchend);
                function doTouchend (event) {
                    event.preventDefault();
                    scope.$event = event;
                    scope.$apply(attrs["ui-touchend"]);
                }
            }
        };
    }
)
