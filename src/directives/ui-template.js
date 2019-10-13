/* global angular */
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
                var oldMsg;
                if (innerScope) {
                    oldMsg = innerScope.msg; // save msg.payload to inject good values if template has changed
                    innerScope.$destroy();
                }
                innerScope = createInnerScope(id);
                innerScope.theme = scope.$eval('me.item.theme');
                window.scope = innerScope;
                element.html(value);
                delete window.scope;
                if (oldMsg !== undefined) {
                    innerScope.msg = oldMsg;
                }

                var ic = scope.$eval("me.item.initController");
                if (ic) {
                    var func = eval("("+ic+")"); // jshint ignore:line
                    func(innerScope, events);
                }
                innerScope.width = scope.$eval("me.item.width");
                innerScope.height = scope.$eval("me.item.height");
                innerScope.label = scope.$eval("me.item.label");

                $compile(element.contents())(innerScope);
            });

            scope.$watch('me.item.msg', function (value) {
                if (innerScope) {
                    innerScope.msg = value;

                    // update template
                    if (value !== undefined && value.template !== undefined) {
                        scope.$parent.me.setFormat(value.template);
                    }
                }
            });

            scope.$on('$destroy', function() {
                if (innerScope) { innerScope.$destroy(); }
            });
        };
    }]);
