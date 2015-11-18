angular.module('ui').directive('uiComponent', UiComponent);

UiComponent.$inject = ['$http', '$compile'];
function UiComponent($http, $compile) {
    var templateCache = {};

    return {
        restrict: 'E',
        bindToController: {
            item: '='
        },
        controller: ControlController,
        controllerAs: "me",
        scope: true,
        link: function (scope, element, attributes, ctrl) {
            var template = templateCache[ctrl.item.type];
            if (!template) {
                template =
                    $http.get('templates/controls/' + ctrl.item.type +'.html')
                        .then(function(resp) {return resp.data;});
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
}

ControlController.$inject = ['WebEvents', '$interpolate'];
function ControlController(events, $interpolate) {
    this.init = function() {
        switch (this.item.type) {
            case 'numeric':
                this.item.getText = $interpolate(this.item.format || '{{value}}').bind(null, this.item);
                break;
            case 'paragraph': 
            case 'text': 
                this.item.getText = $interpolate(this.item.format || '{{payload}}').bind(null, this.item);
                break;
        }
    }

    this.valueChanged = function(throttleTime) {
        throttle({
            id: this.item.id,
            value: this.item.value
        }, typeof throttleTime === "number" ? throttleTime : 200);
    };

    this.valueDown = function() {
        if (this.item.value > this.item.min) {
            this.item.value --;
            this.valueChanged(0);
        }
    };

    this.valueUp = function() {
        if (this.item.value < this.item.max) {
            this.item.value++;
            this.valueChanged(0);
        }
    };
    
    var timer;
    var throttle = function(data, timeout) {
        if (timeout === 0) {
            events.emit(data);
            return;
        }
        
        if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
            timer = undefined;
            events.emit(data);
        }, timeout);
    };
}