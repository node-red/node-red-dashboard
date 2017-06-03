
var app = angular.module('ui',['ngMaterial', 'ngMdIcons', 'ngSanitize', 'ngTouch', 'sprintf', 'chart.js', 'color.picker']);

var dateFormat = "DD/MM/YYYY";  /// my choice - because I said so.

app.config(['$mdThemingProvider', '$compileProvider', '$mdDateLocaleProvider',
    function ($mdThemingProvider, $compileProvider, $mdDateLocaleProvider) {
        // $mdThemingProvider.theme('default')
        //     .primaryPalette('light-green')
        //     .accentPalette('red');

        //white-list all protocols
        $compileProvider.aHrefSanitizationWhitelist(/.*/);

        $mdDateLocaleProvider.formatDate = function(date) {
            return date ? moment(date).format(dateFormat) : null;
        };
        $mdDateLocaleProvider.parseDate = function(dateString) {
            var m = moment(dateString, dateFormat, true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        };
    }
]);

app.controller('MainController', ['$mdSidenav', '$window', 'UiEvents', '$location', '$document', '$mdToast', '$mdDialog', '$rootScope', '$sce', '$timeout', '$scope',
    function ($mdSidenav, $window, events, $location, $document, $mdToast, $mdDialog, $rootScope, $sce, $timeout, $scope) {
        this.menu = [];
        this.len = 0;
        this.selectedTab = null;
        this.loaded = false;
        this.hideToolbar = false;
        this.allowSwipe = false;
        var main = this;
        var audiocontext;
        var tabId = 0;

        function moveTab(d) {
            var len = main.menu.length;
            if (len > 1) {
                //var i = parseInt($location.path().substr(1));
                var i = tabId;
                i = (i + d) % len;
                if (i < 0) { i += len; }
                main.open(main.menu[i], i);
                tabId = i;
            }
        }

        $scope.onSwipeLeft = function() { if (main.allowSwipe) { moveTab(-1); } }
        $scope.onSwipeRight = function() { if (main.allowSwipe) { moveTab(1); } }

        this.toggleSidenav = function () { $mdSidenav('left').toggle(); }

        this.select = function (index) {
            main.selectedTab = main.menu[index];
            if (main.menu.length > 0) { $mdSidenav('left').close(); }
            tabId = index;
            events.emit('ui-change', tabId);
            $location.path(index);
        }

        this.open = function (menu, index) {
            if (menu.link === undefined) {
                this.select(index) // select tab
            }
            else {
                // open in new tab
                if (menu.target === 'newtab') {
                    $window.open(menu.link, menu.name);
                }
                // open in iframe  (if allowed by remote site)
                else {
                    if (typeof main.menu[index].link === "string") {
                        main.menu[index].link = $sce.trustAsResourceUrl(main.menu[index].link);
                    }
                    main.selectedTab = main.menu[index];
                    tabId = index;
                    events.emit('ui-change', tabId);
                    $location.path(index);
                }
                $mdSidenav('left').close();
            }
        }

        this.getMenuName = function (menu) {
            if (menu.link !== undefined) {
                return menu.name;
            }
            return menu.header;
        }

        function applyStyle(theme) {
            // less needs a corresponding css variable for each style
            // in camel case. e.g. 'page-backgroundColor' -> '@pageBackgroundColor'
            var configurableStyles = Object.keys(theme.themeState);
            var lessObj = {};

            for (var i=0; i<configurableStyles.length; i++) {
                //remove dash and camel case
                var arr = configurableStyles[i].split('-');
                for (var j=1; j<arr.length; j++) {
                    arr[j] = arr[j].charAt(0).toUpperCase() + arr[j].slice(1);
                }
                var lessVariable = arr.join("");
                var colour = theme.themeState[configurableStyles[i]].value;
                lessObj["@"+lessVariable] = colour;
            }
            less.modifyVars(lessObj);
        }

        events.connect(function (ui, done) {
            main.menu = ui.menu;
            var name;
            if (ui.site) {
                name = ui.site.name;
                main.hideToolbar = (ui.site.hideToolbar == "true");
                main.allowSwipe = (ui.site.allowSwipe == "true");
                dateFormat = ui.site.dateFormat || dateFormat;
                if (ui.site.hasOwnProperty("sizes")) {
                    sizes.setSizes(ui.site.sizes);
                    main.sizes = ui.site.sizes;
                }
            }
            $document[0].theme = ui.theme;
            if (ui.title) { name = ui.title }
            $document[0].title = name || "Node-RED Dashboard";
            $('meta[name=apple-mobile-web-app-title]').attr('content', name || "Node-RED");

            var prevTabIndex = parseInt($location.path().substr(1));
            var finishLoading = function() {
                if (main.selectedTab && typeof(main.selectedTab.theme) === 'object') {
                    main.selectedTab.theme.themeState["widget-borderColor"] = main.selectedTab.theme.themeState["widget-borderColor"] || main.selectedTab.theme.themeState["group-backgroundColor"];
                    applyStyle(main.selectedTab.theme);
                    $mdToast.hide();
                }
                else if (typeof(ui.theme) === 'object' && ui.theme.themeState['base-color'].value) {
                    applyStyle(ui.theme);
                }
                if ((main.selectedTab !== null) && (main.selectedTab.link !== undefined)) {
                    main.selectedTab.link = $sce.trustAsResourceUrl(main.selectedTab.link);
                }
                done();
            }
            if (!isNaN(prevTabIndex) && prevTabIndex < main.menu.length) {
                main.selectedTab = main.menu[prevTabIndex];
                finishLoading();
            }
            else {
                $timeout( function() {
                    // open first menu, which is not new tab link
                    var indexToOpen = null;
                    main.menu.some(function (menu, i) {
                        if (menu.target === undefined || menu.target === 'iframe') {
                            indexToOpen = i;
                            return true;
                        }
                    })
                    if (indexToOpen !== null) {
                        main.open(main.menu[indexToOpen], indexToOpen);
                    }
                    finishLoading();
                }, 50);
            }
            main.len = main.menu.length;
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
            var found = findControl(msg.id, main.menu);
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
                template: '<md-toast><div class="md-toast-error">&#x2718; &nbsp; Connection lost</div></md-toast>',
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
                    if (msg.tab === "") { events.emit('ui-refresh', {}); }
                    if (msg.tab === "+1") { moveTab(1); return; }
                    if (msg.tab === "-1") { moveTab(-1); return; }
                    for (var i in main.menu) {
                        // is it the name of a tab ?
                        if (msg.tab == main.menu[i].header) {
                            main.select(i);
                            return;
                        }
                        // or the name of a link ?
                        else if (msg.tab == main.menu[i].name) {
                            main.open(main.menu[i], i);
                            return;
                        }
                    }
                }
                // or is it a valid index number ?
                var index = parseInt(msg.tab);
                if (Number.isNaN(index) || index < 0) { return; }
                if (index < main.menu.length) { main.open(main.menu[index], index); }
            }
        });

        events.on('ui-audio', function(msg) {
            if (!msg.always) {
                var totab;
                for (var i in main.menu) {
                    if (msg.tabname === main.menu[i].header) { totab = i; }
                }
                // only play sound/tts to tab if in focus
                if (totab != parseInt($location.path().substr(1))) { return; }
            }
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
                if (!window.hasOwnProperty("AudioContext")) {
                    window.AudioContext = window.AudioContext||window.webkitAudioContext||window.mozAudioContext;
                }
                try {
                    audiocontext = audiocontext || new AudioContext();
                    var source = audiocontext.createBufferSource();
                    var buffer = new Uint8Array(msg.audio);
                    audiocontext.decodeAudioData(buffer.buffer, function(buffer) {
                        source.buffer = buffer;
                        source.connect(audiocontext.destination);
                        source.start(0);
                    })
                }
                catch(e) { alert("Error playing audio: "+e); }
            }
        });
    }]);
