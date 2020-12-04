/* global angular */
var iconFontOddEven = false;
angular.module('ui').directive('uiIcon',
    function () {
        var url = /^https?:\/\//i;
        var fa = /^fa-/i;
        var wi = /^wi-/i;
        var mi = /^mi-/i;
        var ic = /^icofont-/i;
        var icf = /^iconify-/i;

        return {
            restrict: 'E',
            templateUrl: 'components/ui-icon/ui-icon.html',
            scope: {
                icon: '@'
            },
            //replace: true,
            link: function (scope) {
                scope.$watch('icon', function (newValue) {
                    if (newValue === "") { return; }
                    else if (fa.test(newValue)) { scope.iconType = 'fa'; }
                    else if (wi.test(newValue)) { scope.iconType = 'wi'; }
                    else if (mi.test(newValue)) { scope.iconType = 'mi'; }
                    else if (ic.test(newValue)) { scope.iconType = 'icofont'; }
                    else if (icf.test(newValue)) {
                        if (iconFontOddEven) { scope.iconType = 'iconify'; }
                        else { scope.iconType = 'iconify1'; }
                        iconFontOddEven = !iconFontOddEven;
                    }
                    else if (url.test(newValue)) {
                        scope.iconType = 'image';
                        scope.url = newValue;
                    }
                    else { scope.iconType = 'angular-material'; }
                });
            }
        };
    });
