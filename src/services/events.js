angular.module('ui').service('UiEvents', ['$timeout',
    function ($timeout) {
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
                    $timeout(function() { handler(data); }, 0);
                };

                socket.on(event, socketHandler);

                return function() { socket.removeListener(event, socketHandler); };
            };

            socket.on('ui-controls', function (data) {
                $timeout( onuiloaded(data, function() {
                    socket.emit('ui-replay-state');
                }), 0);
            });

            socket.on('ui-replay-done', function() {
                $timeout(replaydone, 0);
            });

            socket.on('connect', function() {
                that.id = socket.id;
            })
        };
    }]);
