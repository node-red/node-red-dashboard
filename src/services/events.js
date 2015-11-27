angular.module('ui').service('UiEvents', ['$timeout', '$mdToast',
    function ($timeout, $mdToast) {
        var updateValueEventName = 'update-value';
        
        this.connect = function(onuiloaded, replaydone) {
            var socket = io({path: location.pathname + 'socket.io'});
            
            this.emit = function (msg, filter) {
                filter = filter ? '-' + filter : '';
                socket.emit(updateValueEventName + filter, msg);
            };
            
            this.on = function(handler, filter) {
                filter = filter ? '-' + filter : '';
                var socketHandler = function(data) {
                    $timeout(function() {
                        handler(data);
                    }, 0);
                };
                socket.on(updateValueEventName + filter, socketHandler);
                return function() {
                    socket.removeListener(updateValueEventName + filter, socketHandler);
                };
            };
            
            socket.on('ui-controls', function (data) {
                $timeout(onuiloaded(data, function() {
                    socket.emit('ui-replay-state');
                }), 0);
            });
            
            socket.on('ui-replay-done', function() {
                $timeout(replaydone, 0);
            });
            
            socket.on('show-toast', function (msg) {
                var toast = $mdToast.simple()
                    .content(msg.message)
                    .position('top right')
                    .hideDelay(3000);
        
                $mdToast.show(toast);
            });
        };
    }]);