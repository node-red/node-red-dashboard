/* global angular */
angular.module('ui').directive('uiIcon',
    function () {
        var url = /^https?:\/\//i;
        var fa = /^fa-/i;
        var wi = /^wi-/i;
        var mi = /^mi-/i;
        var ic = /^icofont-/i;
        return {
            restrict: 'E',
            templateUrl: 'components/ui-icon/ui-icon.html',
            scope: {
                icon: '@'
            },
            //replace: true,
            link: function (scope) {
                scope.$watch('icon', function (newValue) {
                    if (url.test(newValue)) {
                        scope.iconType = 'image';
                        scope.url = newValue;
                    }
                    else if (fa.test(newValue)) { scope.iconType = 'fa'; }
                    else if (wi.test(newValue)) { scope.iconType = 'wi'; }
                    else if (mi.test(newValue)) { scope.iconType = 'mi'; }
                    else if (ic.test(newValue)) { scope.iconType = 'icofont'; }
                    else { scope.iconType = 'angular-material'; }
                });
            }
        };
    });
