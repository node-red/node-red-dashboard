angular.module('ui').controller('uiComponentController', ['UiEvents', '$interpolate', '$interval', '$scope',
    function (events, $interpolate, $interval, $scope) {
        this.init = function() {
            switch (this.item.type) {
                case 'numeric':
                    this.item.getText = $interpolate(this.item.format || '{{value}}').bind(null, this.item);
                    break;
                case 'text': 
                    this.item.getText = $interpolate(this.item.format || '{{payload}}').bind(null, this.item);
                    break;
                case 'chart':
                    this.formatTime = function(d){  
                        return d3.time.format('%H:%M:%S')(new Date(d));  
                    };
                     
                    this.getRange = function() {
                        var min = d3.min(this.item.value, function (a) { return d3.min(a.values, function(b){return b[1];}); });
                        var max = d3.max(this.item.value, function (a) { return d3.max(a.values, function(b){return b[1];}); });
                        return [Math.floor(min), Math.ceil(max)];
                    };
                     
                    /*$scope.$watch('me.item.value', function (val) {
                        this.exampleData[0].values.push([new Date().getTime(), val]);
                    }.bind(this))*/
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