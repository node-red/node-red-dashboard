var app = angular.module('ui', ['ngMaterial', 'ngMdIcons', 'ngSanitize', 'nvd3ChartDirectives', 'sprintf']);

app.config(['$mdThemingProvider', '$compileProvider', 
    function($mdThemingProvider, $compileProvider) {
        /*$mdThemingProvider.theme('default')
            .primaryPalette('light-green')
            .accentPalette('red');*/
            
        //white-list all protocolos
        $compileProvider.aHrefSanitizationWhitelist(/.*/);
    }]);

app.controller('MainController', ['$mdSidenav', '$window', 'UiEvents', '$location', '$document', '$mdToast', '$rootScope',
    function($mdSidenav, $window, events, $location, $document, $mdToast, $rootScope) {
        var main = this;
    
        this.tabs = [];
        this.links = [];
        this.selectedTab = null;
        this.loaded = false;
    
        this.toggleSidenav = function() {
            $mdSidenav('left').toggle();
        };
    
        this.select = function(index) {
            main.selectedTab = main.tabs[index];
            $mdSidenav('left').close();
            $location.path(index);
        };
    
        this.open = function(link) {
             $window.open(link, '_blank');
             $mdSidenav('left').close();
        };
        
        events.connect(function (ui, done) {
            main.tabs = ui.tabs;
            main.links = ui.links;
            $document[0].title = ui.title;
            
            var prevTabIndex = parseInt($location.path().substr(1));
            if (!isNaN(prevTabIndex) && prevTabIndex < main.tabs.length)
                main.selectedTab = main.tabs[prevTabIndex];
            else
                main.select(0);
            
            done();
        }, function() {
            main.loaded = true;
        });
        
        function findControl(id, items) {
            for (var i=0; i<items.length; i++) {
                var item = items[i];
                if (item.id === id) return item;
                if (item.items) {
                    var found = findControl(id, item.items);
                    if (found) return found;
                } 
            }
        }
        
        events.on(function (msg) {
            var found = findControl(msg.id, main.tabs);
            for (var key in msg) {
                if (key === 'id') continue;
                found[key] = msg[key];
            }
        });
        
        events.on('show-toast', function (msg) {
            var toastScope = $rootScope.$new();
            toastScope.toast = msg;
            $mdToast.show({
                scope: toastScope,
                templateUrl: 'partials/toast.html',
                hideDelay: 3000,
                position: 'top right'
            });
        });
    }]);
