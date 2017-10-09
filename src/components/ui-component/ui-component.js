angular.module('ui').directive('uiComponent', ['$http', '$compile', '$templateCache', '$q',
    function ($http, $compile, $templateCache, $q) {
        return {
            restrict: 'E',
            bindToController: {
                item: '='
            },
            replace: true,
            controller: "uiComponentController",
            controllerAs: "me",
            template: "<div flex ng-include='::templateUrl' include-replace></div>",
            scope: true,
            link: function (scope, element, attributes, ctrl) {
                scope.templateUrl = 'components/ui-component/templates/'+ ctrl.item.type +'.html';
                ctrl.init();
            }
        };
    }
]);

angular.module('ui').directive('includeReplace', function () {
    return {
        require: 'ngInclude',
        restrict: 'A', /* optional */
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
});
