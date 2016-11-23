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
                    me.itemChanged = function () {
                        me.valueChanged(0);
                    };

                    // PL dropdown
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
                    me.item.theme = $scope.main.selectedTab.theme;
                    break;
                }

                case 'form': {
                    me.stop=function(event) {
                        if (13 == event.which) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                    me.submit = function () {
                        me.item.value = JSON.parse(JSON.stringify(me.item.formValue));
                        me.valueChanged(0);
                        me.reset();
                    };
                    me.reset = function () {
                        for (var x in me.item.formValue) {
                            if (typeof (me.item.formValue[x]) === "boolean") {
                                me.item.formValue[x] = false;
                            }
                            else {
                                me.item.formValue[x] = "";
                            }
                        }
                        $scope.$$childTail.form.$setUntouched();
                        $scope.$$childTail.form.$setPristine();
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

        // will emit me.item.value when enter is pressed
        me.keyPressed = function (event) {
            if ((event.charCode === 13) || (event.which === 13)) {
                events.emit({ id:me.item.id, value:me.item.value });
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
            // options should have the correct format see beforeEmit in ui-dropdown.js
            if (msg && msg.isOptionsValid) {
                me.item.options = msg.newOptions;
                // delete items passed to me (may as well just keep them)
                delete me.item.isOptionsValid;
                delete me.item.newOptions;
            }
        };

    }]);
