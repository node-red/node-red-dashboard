
var app = angular.module('ui', ['ngMaterial', 'ngMdIcons', 'ngSanitize', 'sprintf', 'chart.js', 'color.picker']);

app.config(['$mdThemingProvider', '$compileProvider',
    function ($mdThemingProvider, $compileProvider) {
        /*$mdThemingProvider.theme('default')
            .primaryPalette('light-green')
            .accentPalette('red');*/
        //white-list all protocols
        $compileProvider.aHrefSanitizationWhitelist(/.*/);
    }]);

app.controller('MainController', ['$mdSidenav', '$window', 'UiEvents', '$location', '$document', '$mdToast', '$mdDialog', '$rootScope', '$sce', '$timeout', '$scope',
    function ($mdSidenav, $window, events, $location, $document, $mdToast, $mdDialog, $rootScope, $sce, $timeout, $scope) {
        var main = this;

        this.tabs = [];
        this.links = [];
        this.len = 0;
        this.selectedTab = null;
        this.loaded = false;

        function moveTab(d) {
            var len = main.tabs.length;
            var i = parseInt($location.path().substr(1));
            if (len > 1) {
                i = (i + d) % len;
                if (i < 0) { i += len; }
                main.select(i);
            }
        }

        //TODO Disabled until we make it an option - too sensitive for some
        //$scope.onSwipeLeft = function(ev) { moveTab(-1); }
        //$scope.onSwipeRight = function(ev) { moveTab(1); }

        this.toggleSidenav = function () {
            $mdSidenav('left').toggle();
        };

        this.select = function (index) {
            main.selectedTab = main.tabs[index];
            if (main.tabs.length > 0) { $mdSidenav('left').close(); }
            events.emit('ui-replay-state', {});
            $location.path(index);

        };

        this.open = function (link, index) {
            // console.log("LINK",link,index);
            // open in new tab
            if (link.target === 'newtab') {
                $window.open(link.link, link.name);
            }
            // open in iframe  (if allowed by remote site)
            else {
                if (typeof main.links[index].link === "string") {
                    main.links[index].link = $sce.trustAsResourceUrl(main.links[index].link);
                }
                main.selectedTab = main.links[index];
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
                $timeout( function() { main.select(0); }, 50 );
            }
            $mdToast.hide();
            done();
        }, function () {
            main.loaded = true;
            main.len = main.tabs.length + main.links.length;
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

            if (found === undefined) { return; }
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

        events.on('disconnect', function(m) {
            $mdToast.show({
                template: '<md-toast><div class="md-toast-error"><i class="fa fa-plug"></i>&nbsp; Connection lost</div></md-toast>',
                position: 'top right',
                hideDelay: 6000000
            });
        });

        events.on('show-toast', function (msg) {
            if (msg.dialog === true) {
                var confirm;
                if (msg.cancel) {
                    confirm = $mdDialog.confirm()
                        .title(msg.title)
                        .textContent(msg.message)
                        .ariaLabel(msg.ok + " or " + msg.cancel)
                        .ok(msg.ok)
                        .cancel(msg.cancel);
                }
                else {
                    confirm = $mdDialog.alert()
                        .title(msg.title)
                        .textContent(msg.message)
                        .ariaLabel(msg.ok)
                        .ok(msg.ok)
                        .clickOutsideToClose(false)
                }
                $mdDialog.show(confirm).then(
                    function() {
                        msg.msg.payload = msg.ok;
                        events.emit({ id:msg.id, value:msg });
                    },
                    function() {
                        msg.msg.payload = msg.cancel;
                        events.emit({ id:msg.id, value:msg });
                    }
                );
            }
            else {
                var toastScope = $rootScope.$new();
                toastScope.toast = msg;
                var opts = {
                    scope: toastScope,
                    templateUrl: 'partials/toast.html',
                    hideDelay: msg.displayTime,
                    position: msg.position
                };
                $mdToast.show(opts);
            }
        });

        events.on('ui-control', function(msg) {
            if (msg.hasOwnProperty("socketid") && (msg.socketid !== events.id) ) { return; }
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

        events.on('ui-audio', function(msg) {
            var totab;
            for (var i in main.tabs) {
                if (msg.tabname === main.tabs[i].header) { totab = i; }
            }
            // only play sound/tts to tab if in focus
            if (totab != parseInt($location.path().substr(1))) { return; }

            if (msg.hasOwnProperty("tts")) {
                if ('speechSynthesis' in window) {
                    var voices = window.speechSynthesis.getVoices();
                    var words = new SpeechSynthesisUtterance(msg.tts);
                    words.voice = voices[msg.voice];
                    window.speechSynthesis.speak(words);
                }
                else { console.log("Your Browser does not support Text-to-Speech"); }
            }
            if (msg.hasOwnProperty("audio")) {
                window.AudioContext = window.AudioContext||window.webkitAudioContext||window.mozAudioContext;
                try {
                    var context = new AudioContext();
                    var source = context.createBufferSource();
                    var buffer = new Uint8Array(msg.audio);
                    context.decodeAudioData(buffer.buffer, function(buffer) {
                        source.buffer = buffer;
                        source.connect(context.destination);
                        source.start(0);
                    })
                }
                catch(e) { alert("Error playing audio: "+e); }
            }
        });
    }]);
