/* global angular */
/* global d3 */
angular.module('ui').controller('uiComponentController', ['UiEvents', '$interpolate', '$interval',
    function (events, $interpolate, $interval) {
        var me = this;
        if (typeof me.item.format === "string")
            me.item.getText = $interpolate(me.item.format).bind(null, me.item);
        
        me.init = function() {
            switch (me.item.type) {
                case 'button':
                    me.buttonClick = function () {
                        me.valueChanged(0);
                    };
                    
                case 'numeric':
                    var changeValue = function(delta) {
                        if (delta > 0) {
                            if (me.item.value < me.item.max) {
                                me.item.value = Math.min(me.item.value + delta, me.item.max);
                            }
                        } else if (delta < 0) {
                            if (me.item.value > me.item.min) {
                                me.item.value = Math.max(me.item.value + delta, me.item.min);
                            }
                        }
                    };
                    
                    var range = me.item.max - me.item.min;
                    var promise;
                    me.periodicChange = function(delta) {
                        changeValue(delta);
                        var i=0;
                        promise = $interval(function() {
                            i++;
                            if (i>35) changeValue(Math.sign(delta) * Math.floor(range / 10));
                            else if (i>25) changeValue(delta*2);
                            else if (i>15) changeValue(delta);
                            else if (i>5 && i%2) changeValue(delta);
                        }, 100);
                    };
                    me.stopPeriodic = function() {
                        $interval.cancel(promise);
                        me.valueChanged(0);
                    };
                    break;
                    
                case 'chart':
                    if (!me.item.value) me.item.value = [];
                
                    me.formatTime = function(d) {  
                        return d3.time.format('%H:%M:%S')(new Date(d));  
                    };
            }
        }
    
        me.valueChanged = function(throttleTime) {
            throttle({
                id: me.item.id,
                value: me.item.value
            }, typeof throttleTime === "number" ? throttleTime : 10);
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
