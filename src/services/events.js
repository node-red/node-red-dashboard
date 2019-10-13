/* global angular io */
angular.module('ui').service('UiEvents',
    function () {
        var updateValueEventName = 'update-value';
        var that = this;

        this.connect = function(onuiloaded, replaydone) {
            var socket = io({path:location.pathname + 'socket.io'});

            this.emit = function(event, msg) {
                if (typeof msg === 'undefined') {
                    msg = event;
                    event = updateValueEventName;
                }
                msg.socketid = socket.id;
                socket.emit(event, msg);
            };

            this.on = function(event, handler) {
                if (typeof handler === 'undefined') {
                    handler = event;
                    event = updateValueEventName;
                }

                var socketHandler = function(data) {
                    handler(data);
                };

                socket.on(event, socketHandler);

                return function() { socket.removeListener(event, socketHandler); };
            };

            socket.on('ui-controls', function (data) {
                onuiloaded(data, function() {
                    socket.emit('ui-replay-state');
                });
            });

            socket.on('ui-replay-done', function() {
                replaydone();
            });

            socket.on('connect', function() {
                that.id = socket.id;
            })
        };
    });
