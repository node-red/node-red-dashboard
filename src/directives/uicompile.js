angular.module('ui')
    .directive('uiCompile', UiCompile);

UiCompile.$inject = ['$compile', '$rootScope'];
function UiCompile ($compile, $rootScope) {
    return function(scope, element, attrs) {
        var paragraphScope = $rootScope.$new();
        scope.$watch('me.item.msg', function (value) {
            paragraphScope.msg = value;
        });
        scope.$watch(
            function(scope) {
                return scope.$eval(attrs.uiCompile);
            },
            function(value) {
                element.html(value);
                $compile(element.contents())(paragraphScope);
            }
        );
    };
}