angular.module('ui').controller('uiComponentController', ['UiEvents', '$interpolate',
    function (events, $interpolate) {
        var me = this;
        if (typeof me.item.format === "string")
            me.item.getText = $interpolate(me.item.format).bind(null, me.item);
        
        me.init = function() {
            switch (me.item.type) {
                case 'button':
                case 'button-row':
                    me.buttonClick = function (payload) {
                        if (payload) me.item.value = payload;
                        me.valueChanged(0);
                    }
                    break;
                    
                case 'numeric':
                    me.valueDown = function() {
                        if (me.item.value > me.item.min) {
                            me.item.value --;
                            me.valueChanged(0);
                        }
                    };
                
                    me.valueUp = function() {
                        if (me.item.value < me.item.max) {
                            me.item.value++;
                            me.valueChanged(0);
                        }
                    };
                    break;
                    
                case 'chart':
                    if (!me.item.value) me.item.value = [];
                
                    me.formatTime = function(d){  
                        return d3.time.format('%H:%M:%S')(new Date(d));  
                    };
                     
                    me.getRange = function() {                   
                        var min = d3.min(me.item.value, function (a) { return d3.min(a.values, function(b){return b[1];}); });
                        var max = d3.max(me.item.value, function (a) { return d3.max(a.values, function(b){return b[1];}); });
                        return [Math.floor(min), Math.ceil(max)];
                    };
                    
                    me.item.addPoint = function (p) {
                        var series;
                        for (var i=0; i<me.item.value.length; i++) {
                            if (me.item.value[i].key === p.key) {
                                series = me.item.value[i];
                                break;
                            }
                        }
                        if (!series) {
                            series = {key: p.key, values: []};
                            me.item.value.push(series);
                        }
                        series.values.push(p.value);
                    };
                    break;
            }
        }
    
        me.valueChanged = function(throttleTime) {
            throttle({
                id: me.item.id,
                value: me.item.value
            }, typeof throttleTime === "number" ? throttleTime : 200);
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