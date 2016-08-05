/* global angular */
/* global d3 */
angular.module('ui').controller('uiComponentController', ['$scope', 'UiEvents', '$interpolate', '$interval',
    function ($scope, events, $interpolate, $interval) {
        var me = this;

        if (typeof me.item.format === "string") {
            me.item.getText = $interpolate(me.item.format).bind(null, me.item);
        }

        if (typeof me.item.label === "string") {
            me.item.getLabel = $interpolate(me.item.label).bind(null, me.item);
        }

        me.init = function () {
            switch (me.item.type) {
                case 'button': {
                    me.buttonClick = function () {
                        me.valueChanged(0);
                    };
                    break;
                }

                case 'dropdown': {
                    if (me.item.value !== me.item.id) {
                        // push through any already selected value
                        me.valueChanged(0);
                    }
                    me.itemChanged = function () {
                        me.valueChanged(0);
                    };

                    // any control may add this function and dispatch to 
                    // it's individual implementation
                    // processInput will be called from main.js
                    // need to pass 'me' so that main may call 'me'
                    me.item.me = me;
                    me.processInput = function (msg) {
                        processDropDownInput(msg);
                    }
                    break;
                }

                case 'numeric': {
                    var changeValue = function (delta) {
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
                    me.periodicChange = function (delta) {
                        changeValue(delta);
                        var i = 0;
                        promise = $interval(function () {
                            i++;
                            if (i > 35) {
                                changeValue(Math.sign(delta) * Math.floor(range / 10));
                            } else if (i > 25) {
                                changeValue(delta * 2);
                            } else if (i > 15) {
                                changeValue(delta);
                            } else if (i > 5 && i % 2) {
                                changeValue(delta);
                            }
                        }, 100);
                    };
                    me.stopPeriodic = function () {
                        $interval.cancel(promise);
                        me.valueChanged(0);
                    };
                    break;
                }

                case 'chart': {
                    if (!me.item.value) {
                        me.item.value = [];
                    }

                    var lineColors = {
                        'theme-dark': ['#0FBBC3', 'orange', '#00AF25', '#FF738C', '#E1E41D', '#C273FF', '#738BFF', '#FF7373', '#4D7B47', '#887D47']
                    };
                    me.item.value.forEach(function (line, index) {
                        if (lineColors[$scope.main.selectedTab.theme]) {
                            line.color = lineColors[$scope.main.selectedTab.theme][index];
                        }
                    })
                    me.formatTime = function (d) {
                        return d3.time.format('%H:%M:%S')(new Date(d));
                    };
                }
            }
        }

        me.valueChanged = function (throttleTime) {
            throttle({
                id: me.item.id,
                value: me.item.value
            }, typeof throttleTime === "number" ? throttleTime : 10);
        };

        // PL code: 
        // will emit me.item.value when enter is pressed
        me.keyPressed = function (event) {
             if (event.charCode === 13) {
                events.emit({ id: me.item.id, value: me.item.value });
            }
        }

        var timer;
        var throttle = function (data, timeout) {
            if (timeout === 0) {
                events.emit(data);
                return;
            }

            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(function () {
                timer = undefined;
                events.emit(data);
            }, timeout);
        };

        // may add additional input processing for other controls
        var processDropDownInput = function (msg) {
            // assuming to get:
            // msg.value, which is:
            // - any array of values: in this case all options are replaced
            // - a value: the value is added to options
            // I am using the value property as it could get inputs direcly from a text input control

            if (!msg || !msg.value) return;
            if (!me.item.options) retrun; // should never happen
            if (!Array.isArray(me.item.options)) me.item.options = []; // when empty and not initialised

            var selection;
            if (Array.isArray(msg.value)) {
                var newOptions = [];
                for (var i = 0; i < msg.value.length; i++) pushOption(newOptions, msg.value[i]);
                // me.item.options = new Array(newOptions);
                me.item.options = newOptions;
            } else pushOption(me.item.options, msg.value);
            // this dropdown now has the value which has been passed in via payload, which may be an object or array
            // in cas of object/array nothing is selected... a receiving node would have to check for valid values
            // the below line will set the dropdown to a valid value
            // set the dropdown value >> this behaviuor should be documented!
            if (selection && (selection != me.item.value) ) me.item.value = selection; 

            function pushOption (options, opt) {
                // assuming simple value, or label value object
                if (opt instanceof Object) {
                    if (opt.label && opt.value) {
                        pushPair(opt.label, opt.value);
                    }
                } else  pushPair(opt, opt);

                function pushPair(label, value) {
                    // make sure we are not pushing an existing value
                    // that would always happen when 'me' changes it's selection and emits that message
                    var i;
                    if (!selection) selection = value;  // take first option we get
                    for (i = 0; i < options.length; i++) {
                        if (options[i].value === value) break;
                    }
                    if (i === options.length) options.push({ label: label, value: value });
                }
            }
 
        };
       
    }]);
