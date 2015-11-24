angular.module('ui').controller('uiComponentController', ['UiEvents', '$interpolate',
    function (events, $interpolate) {
        this.init = function() {
            switch (this.item.type) {
                case 'numeric':
                    this.item.getText = $interpolate(this.item.format || '{{value}}').bind(null, this.item);
                    break;
                case 'text': 
                    this.item.getText = $interpolate(this.item.format || '{{payload}}').bind(null, this.item);
                    break;
            }
        }
    
        this.buttonClick = function (payload) {
            if (payload) this.item.value = payload;
            this.valueChanged(0);
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
    }]);