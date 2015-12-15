angular.module('ui').directive('uiCompile', ['$compile', '$rootScope', 'UiEvents',
    function ($compile, $rootScope, events) {
        return function(scope, element, attrs) {
            var innerScope = $rootScope.$new();
            
            innerScope.send = function(msg) {
                events.emit({
                    id: scope.$eval('me.item.id'),
                    value: msg
                });
            };
            
            scope.$watch('me.item.msg', function (value) {
                innerScope.msg = value;
            });
            
            scope.$watch(attrs.uiCompile,
                function(value) {
                    window.scope = innerScope;
                    element.html(value);
                    delete window.scope;
                    $compile(element.contents())(innerScope);
                }
            );
        };
    }]);