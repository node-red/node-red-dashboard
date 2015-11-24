angular.module('ui').service('WebEvents', WebEvents);

WebEvents.$inject = ['$timeout', '$mdToast'];
function WebEvents($timeout, $mdToast) {
    var updateValueEventName = 'update-value';
    
    this.connect = function(onuiloaded, replaydone) {
        var socket = io({path: location.pathname + 'socket.io'});
        this.emit = socket.emit.bind(socket, updateValueEventName);
        this.on = function(handler) {
            socket.on(updateValueEventName, function(data) {
                $timeout(function() {
                    handler(data);
                }, 0);
            });
        }
        
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
}