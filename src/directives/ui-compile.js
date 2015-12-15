angular.module('ui').directive('uiCompile', ['$compile', '$rootScope', 'UiEvents',
    function ($compile, $rootScope, events) {
        return function(scope, element, attrs) {
            var paragraphScope = $rootScope.$new();
            
            paragraphScope.send = function(msg) {
                events.emit({
                    id: scope.$eval('me.item.id'),
                    value: msg
                });
            };
            
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
    }]);
