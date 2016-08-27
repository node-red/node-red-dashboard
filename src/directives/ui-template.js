angular.module('ui').directive('uiTemplate', ['$compile', '$rootScope', 'UiEvents',
    function ($compile, $rootScope, events) {
        function createInnerScope(id) {
            var innerScope = $rootScope.$new();
            innerScope.send = function(msg) {
                events.emit({id:id, msg:msg});
            };
            return innerScope;
        }

        return function(scope, element, attrs) {
            var id = scope.$eval('me.item.id');
            var innerScope;

            scope.$watch(attrs.uiTemplate, function(value) {
                if (innerScope) { innerScope.$destroy(); }
                innerScope = createInnerScope(id);
                window.scope = innerScope;
                element.html(value);
                delete window.scope;
                $compile(element.contents())(innerScope);
            });

            scope.$watch('me.item.msg', function (value) {
                if (innerScope) { innerScope.msg = value; }
            });

            scope.$on('$destroy', function() {
                if (innerScope) { innerScope.$destroy(); }
            });
        };
    }]);
