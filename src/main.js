var app = angular.module('ui', ['ngMaterial', 'ngMdIcons', 'ngSanitize', 'nvd3ChartDirectives', 'sprintf']);

app.config(['$mdThemingProvider', '$compileProvider',
    function ($mdThemingProvider, $compileProvider) {
        /*$mdThemingProvider.theme('default')
            .primaryPalette('light-green')
            .accentPalette('red');*/
        //white-list all protocols
        $compileProvider.aHrefSanitizationWhitelist(/.*/);
    }]);

app.controller('MainController', ['$mdSidenav', '$window', 'UiEvents', '$location', '$document', '$mdToast', '$rootScope', '$sce', '$timeout', '$scope',
    function ($mdSidenav, $window, events, $location, $document, $mdToast, $rootScope, $sce, $timeout, $scope) {
        var main = this;

        this.tabs = [];
        this.links = [];
        this.selectedTab = null;
        this.loaded = false;

        this.toggleSidenav = function () {
            $mdSidenav('left').toggle();
        };

        this.select = function (index) {
            main.selectedTab = main.tabs[index];
            $mdSidenav('left').close();
            $location.path(index);
        };

        this.open = function (link, index) {
            // console.log("LINK",link,index);
            // open in new tab
            if (link.target === 'newtab') {
                $window.open(link.link, link.name);
            }
            // open in iframe // TODO : check iframe options (see Google)
            else {
                main.links[index].link = $sce.trustAsResourceUrl(main.links[index].link);
                main.selectedTab = main.links[index];
                // $timeout(function() {
                //     console.log(angular.element('.iframe'));
                //     console.log(angular.element('.iframe').find('body'));
                //     console.log(angular.element('.iframe').find('body').children());
                // }, 2000);
            }
            $mdSidenav('left').close();
        };

        events.connect(function (ui, done) {
            main.tabs = ui.tabs;
            main.links = ui.links;
            $document[0].title = ui.title;

            var prevTabIndex = parseInt($location.path().substr(1));
            if (!isNaN(prevTabIndex) && prevTabIndex < main.tabs.length) {
                main.selectedTab = main.tabs[prevTabIndex];
            }
            else {
                main.select(0);
            }
            done();
        }, function () {
            main.loaded = true;
        });

        function findControl(id, items) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.id === id) { return item; }
                if (item.items) {
                    var found = findControl(id, item.items);
                    if (found) { return found; }
                }
            }
        }

        events.on(function (msg) {
            var found = findControl(msg.id, main.tabs);
            for (var key in msg) {
                if (msg.hasOwnProperty(key)) {
                    if (key === 'id') { continue; }
                    found[key] = msg[key];
                }
            }
            if (found.hasOwnProperty("me") && found.me.hasOwnProperty("processInput")) {
                found.me.processInput(msg);
            }
        });

        events.on('show-toast', function (msg) {
            var toastScope = $rootScope.$new();
            toastScope.toast = msg;
            var opts = {
                scope: toastScope,
                templateUrl: 'partials/toast.html',
                hideDelay: msg.displayTime,
                position: msg.position
            };
            $mdToast.show(opts);
        });

        $scope.onSwipeLeft = function(ev) { moveTab(-1); }
        $scope.onSwipeRight = function(ev) { moveTab(1); }

        function moveTab(d) {
            var len = main.tabs.length;
            if (len > 1) {
                var i = (main.selectedTab.order - 1 + d) % len;
                if (i < 0) { i += len; }
                main.select(i);
            }
        }

        events.on('ui-control', function(msg) {
            if (msg.hasOwnProperty("tab")) { // if it's a request to change tabs
                if (typeof msg.tab === 'string') {
                    // is it the name of a tab ?
                    for (var i in main.tabs) {
                        if (msg.tab == main.tabs[i].header) {
                            main.select(i);
                            return;
                        }
                    }
                    // or the name of a link ?
                    for (var j in main.links) {
                        if (msg.tab == main.links[j].name) {
                            main.open(main.links[j], j);
                            return;
                        }
                    }
                }
                // or is it a valid index number ?
                var index = parseInt(msg.tab);
                if (Number.isNaN(index) || index < 0) { return; }
                if (index < main.tabs.length) { main.select(index); }
                else if ((index - main.tabs.length) < main.links.length) {
                    index -= main.tabs.length;
                    main.open(main.links[index], index);
                }
            }
        });
    }]);
