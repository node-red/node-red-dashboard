angular.module('ui').service('UiEvents', ['$timeout', '$mdToast', '$rootScope',
    function ($timeout, $mdToast, $rootScope) {
        var updateValueEventName = 'update-value';
        
        this.connect = function(onuiloaded, replaydone) {
            var socket = io({path: location.pathname + 'socket.io'});
            
            this.emit = function (msg) {
                socket.emit(updateValueEventName, msg);
            };
            
            this.on = function(handler) {
                var socketHandler = function(data) {
                    $timeout(function() {
                        handler(data);
                    }, 0);
                };
                socket.on(updateValueEventName, socketHandler);
                return function() {
                    socket.removeListener(updateValueEventName, socketHandler);
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
                var toastScope = $rootScope.$new();
                toastScope.toast = msg;
                $mdToast.show({
                    scope: toastScope,
                    templateUrl: 'templates/controls/toast.html',
                    hideDelay: 3000,
                    position: 'top right'
                });
            });
        };
    }]);