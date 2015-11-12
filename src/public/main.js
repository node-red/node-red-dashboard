var app = angular.module('ui', ['ngMaterial', 'ngMdIcons']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('light-green')
        .accentPalette('red');
});

app.controller('MainController', MainController);

MainController.$inject = ['$mdSidenav', '$window', 'WebEvents', '$location', '$document'];
function MainController($mdSidenav, $window, events, $location, $document) {
    var main = this;

    this.tabs = [];
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

    this.openEditor = function() {
        $window.open('/', '_blank');
        $mdSidenav('left').close();
    };

    events.connect(function (ui, done) {
        main.tabs = ui.tabs;
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
        found.value = msg.value;
    });
}
