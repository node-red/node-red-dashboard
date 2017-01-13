/* global angular */
angular.module('ui').directive('uiCardSize', ['uiSizes',
    function(sizes) {
        return {
            restrict: 'A',
            require: ['^uiCardPanel', '^?uiMasonry'],
            link: function(scope, element, attrs, ctrls) {
                attrs.$observe('uiCardSize', function () {
                    ctrls[0].refreshLayout(function() {
                        if (ctrls[1]) { ctrls[1].refreshLayout(); }
                    });
                });
            }
        }
    }
]);
