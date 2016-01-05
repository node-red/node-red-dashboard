angular.module('ui').directive('uiComponent', ['$http', '$compile', '$templateCache', '$q', 
    function ($http, $compile, $templateCache, $q) {
        var templateCache = {};
    
        return {
            restrict: 'E',
            bindToController: {
                item: '='
            },
            controller: "uiComponentController",
            controllerAs: "me",
            scope: true,
            link: function (scope, element, attributes, ctrl) {
                var template = templateCache[ctrl.item.type];
                if (!template) {
                    var link = 'components/ui-component/templates/' + ctrl.item.type +'.html';
                    var templateFromCache = $templateCache.get(link);
                    if (templateFromCache) {
                        template = $q.when(templateFromCache);
                    } else { 
                        template =
                            $http.get(link)
                                .then(function(resp) {return resp.data;});
                    }
                    templateCache[ctrl.item.type] = template;
                }
    
                template.then(function (html) {
                    var control = angular.element(html);
                    if (ctrl.item.width) control.attr('flex', ctrl.item.width);
                    element.replaceWith($compile(control)(scope));
                });
                
                ctrl.init();
            }
        };
    }]);
