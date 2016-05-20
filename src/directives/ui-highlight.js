/* global angular */
angular.module('ui').directive('uiHighlight',
    function () {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                attrs.$observe('uiHighlight', function (color) {
                    if (color) {
                        element.css('border-bottom', '5px solid ' + color);
                    }
                    else {
                        element.css('border-bottom', undefined);
                    }
                });
            }
        }
    });
