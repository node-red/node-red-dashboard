
var app = angular.module('ui',['ngMaterial', 'ngMdIcons', 'ngSanitize', 'ngTouch', 'sprintf', 'chart.js', 'color.picker']);

var locale = (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;
moment.locale(locale);

app.config(['$mdThemingProvider', '$compileProvider', '$mdDateLocaleProvider',
    function ($mdThemingProvider, $compileProvider, $mdDateLocaleProvider) {
        // $mdThemingProvider.theme('default')
        //     .primaryPalette('light-blue')
        //     .accentPalette('red');

        //white-list all protocols
        $compileProvider.aHrefSanitizationWhitelist(/.*/);

        $mdDateLocaleProvider.months = moment.localeData().months();
        $mdDateLocaleProvider.shortMonths = moment.localeData().monthsShort();
        $mdDateLocaleProvider.days = moment.localeData().weekdays();
        $mdDateLocaleProvider.shortDays = moment.localeData().weekdaysMin();

        $mdDateLocaleProvider.formatDate = function(date) {
            return date ? moment(date).format("DD MMM YYYY") : null;
        };

        $mdDateLocaleProvider.parseDate = function(dateString) {
            var m = moment(dateString, "DD MMM YYYY", true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        };

        $mdDateLocaleProvider.monthHeaderFormatter = function(date) {
            return moment(date).format("MMM YYYY");
        };
    }
]);

app.controller('MainController', ['$mdSidenav', '$window', 'UiEvents', '$location', '$document', '$mdToast', '$mdDialog', '$rootScope', '$sce', '$timeout', '$scope',
    function ($mdSidenav, $window, events, $location, $document, $mdToast, $mdDialog, $rootScope, $sce, $timeout, $scope) {
        this.menu = [];
        this.headElementsAppended = [];
        this.headOriginalElements = [];
        this.len = 0;
        this.selectedTab = null;
        this.loaded = false;
        this.hideToolbar = false;
        this.allowSwipe = false;
        this.allowTempTheme = true;
        var main = this;
        var audiocontext;
        var voices = [];
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
            if (typeof main.allowTempTheme === 'undefined') { main.allowTempTheme = true; }
            lessObj["@nrTemplateTheme"] = main.allowTempTheme;
            less.modifyVars(lessObj);
        }

        function processGlobals() {
            // remove previous elements appended
            main.headElementsAppended.forEach(function(headEl) {
                removeHeadElAppended(headEl)
            });
            main.headElementsAppended = [];

            // reset original elements
            main.headOriginalElements.forEach(function(headOriginalEl) {
                resetHeadOriginalEl(headOriginalEl);
            })

            // add elements
            if (main.globals.length > 0) {
                main.globals.forEach(function(control) {
                    if (control.format !== undefined && control.format !== '') {
                        addHeadEl(control.id, control.format);
                    }
                })
            }
        }

        function hideGroups() {
            var flag = false;
            for (var t in main.menu) {
                if (main.menu.hasOwnProperty(t)) {
                    for (var g in main.menu[t].items) {
                        if (main.menu[t].items.hasOwnProperty(g)) {
                            var c = (main.menu[t].header+" "+main.menu[t].items[g].header.name).replace(/ /g,"_");
                            if (localStorage && localStorage.getItem(c) == "true") {
                                main.menu[t].items[g].header.config.hidden = true;
                                flag = true;
                            }
                        }
                    }
                }
            }
            if (flag === true) { $(window).trigger('resize'); }
        }

        function replaceHeadOriginalEl (headOriginalEl, format) {
            resetHeadOriginalEl(headOriginalEl);
            addHeadEl(headOriginalEl.id, format);
        }

        function replaceHeadEl (headEl, format) {
            removeHeadElAppended(headEl);
            var index = main.headElementsAppended.indexOf(headEl);
            if (index >= 0) {
                main.headElementsAppended.splice(index, 1);
            }
            addHeadEl(headEl.id, format);
        }

        function resetHeadOriginalEl (headOriginalEl) {
            var head = $document.find('head');
            var currentEl = head.find(headOriginalEl.expression)[0];
            angular.element(currentEl).replaceWith(headOriginalEl.html);
        }

        function removeHeadElAppended (headEl) {
            var head = $document.find('head');
            var headChildren = head.children();
            headEl.childrenIndex.forEach(function(index) {
                if (headChildren.hasOwnProperty(index) ) {
                    headChildren[index].parentNode.removeChild(headChildren[index]);
                }
            })
        }

        function addHeadEl (id, format) {
            var head = $document.find('head');
            var headChildrenLength = head.children().length;

            var simulateHead = angular.element('<head></head>');
            simulateHead.append(format);

            // check if need to replace
            var headToReplace = [
                'meta[charset]',
                'meta[name="viewport"]',
                'meta[name="apple-mobile-web-app-capable"]',
                'meta[name="apple-mobile-web-app-status-bar-style"]',
                'meta[name="apple-mobile-web-app-title"]',
                'meta[name="mobile-web-app-capable"]',
                'link[rel="icon"]',
                'link[rel="shortcut icon"]',
                'link[rel="apple-touch-icon"]'
            ];
            headToReplace.forEach(function(expression) {
                var el = simulateHead.find(expression);
                if (el.length > 0) {
                    var originalEl = head.find(expression)[0];
                    main.headOriginalElements.push({
                        id: id,
                        expression: expression,
                        html: originalEl
                    });
                    angular.element(originalEl).replaceWith(el[0]);
                    // prevent to append
                    format = simulateHead.html();
                    format.trim();
                }
            })

            // if still stuff
            if (format !== '') {
                head.append(format);

                // store index appended to remove later
                var childrenIndex = []
                for (var i=headChildrenLength; i<head.children().length; i++) {
                    childrenIndex.push(i);
                }
                headChildrenLength = head.children().length;
                main.headElementsAppended.push({
                    id: id,
                    childrenIndex: childrenIndex
                })
            }
        }

        events.connect(function (ui, done) {
            main.menu = ui.menu;
            main.globals = ui.globals;
            main.nothing = false;
            var name;
            if (ui.site) {
                name = ui.site.name;
                main.hideToolbar = (ui.site.hideToolbar == "true");
                main.allowSwipe = (ui.site.allowSwipe == "true");
                if (typeof ui.site.allowTempTheme === 'undefined') { main.allowTempTheme = true; }
                else { main.allowTempTheme = (ui.site.allowTempTheme == "true"); }
                dateFormat = ui.site.dateFormat || "DD/MM/YYYY";
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
            if ('speechSynthesis' in window) {
                voices = window.speechSynthesis.getVoices();
                window.speechSynthesis.onvoiceschanged = function() {
                    voices = window.speechSynthesis.getVoices();
                }
            }
            var finishLoading = function() {
                if (main.selectedTab && typeof(main.selectedTab.theme) === 'object') {
                    main.selectedTab.theme.themeState["widget-borderColor"] = main.selectedTab.theme.themeState["widget-borderColor"] || main.selectedTab.theme.themeState["group-backgroundColor"];
                    applyStyle(main.selectedTab.theme);
                }
                else if (typeof(ui.theme) === 'object' && ui.theme.themeState['base-color'].value) {
                    applyStyle(ui.theme);
                }
                if ((main.selectedTab !== null) && (main.selectedTab.link !== undefined)) {
                    main.selectedTab.link = $sce.trustAsResourceUrl(main.selectedTab.link);
                }
                $mdToast.hide();
                processGlobals();
                events.emit('ui-change', prevTabIndex);
                hideGroups();
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
                        finishLoading();
                    }
                    else {
                        main.nothing = true;
                    }
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

        function findHeadElAppended(id) {
            var elFound = false;
            main.headElementsAppended.some(function(el) {
                if (el.id === id) {
                    elFound = el;
                    return true;
                }
            })
            return elFound;
        }

        function findHeadOriginalEl(id) {
            var elFound = false;
            main.headOriginalElements.some(function(el) {
                if (el.id === id) {
                    elFound = el;
                    return true;
                }
            })
            return elFound;
        }

        events.on(function (msg) {
            var found;
            if (msg.hasOwnProperty('msg') && msg.msg.templateScope === 'global') {
                found = findHeadOriginalEl(msg.id);
                if (found) {
                    replaceHeadOriginalEl(found, msg.msg.template)
                } else {
                    found = findHeadElAppended(msg.id);
                    if (found) {
                        replaceHeadEl(found, msg.msg.template)
                    } else {
                        return;
                    }
                }
            } else {
                found = findControl(msg.id, main.menu);
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
                        .htmlContent(msg.message)
                        .ariaLabel(msg.ok + " or " + msg.cancel)
                        .ok(msg.ok)
                        .cancel(msg.cancel);
                }
                else {
                    confirm = $mdDialog.alert()
                        .title(msg.title)
                        .htmlContent(msg.message)
                        .ariaLabel(msg.ok)
                        .ok(msg.ok)
                        .clickOutsideToClose(false)
                }
                $mdDialog.show(confirm, { panelClass:'nt-dashboard-dialog' }).then(
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
                if (msg.hasOwnProperty("message") || msg.hasOwnProperty("title")) {
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
            }
        });

        events.on('ui-control', function(msg) {
            if (msg.hasOwnProperty("socketid") && (msg.socketid !== events.id) ) { return; }
            if (msg.hasOwnProperty("control")) {
                //console.log("MSG",msg);
                found = findControl(msg.id, main.menu);
                //console.log("FOUND",found);
                for (var property in msg.control) {
                    if (msg.control.hasOwnProperty(property) && found.hasOwnProperty(property)) {
                        found[property] = msg.control[property];
                    }
                }
                //Object.assign(found,msg.control);
            }
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
            if (msg.hasOwnProperty("group")) {  // it's to control a group item
                if (typeof msg.group === 'object') {
                    for (var t in main.menu) {
                        if (main.menu.hasOwnProperty(t)) {
                            var eldiv;
                            for (var g in main.menu[t].items) {
                                if (main.menu[t].items.hasOwnProperty(g)) {
                                    var c = (main.menu[t].header+" "+main.menu[t].items[g].header.name).replace(/ /g,"_");
                                    if (msg.group.hasOwnProperty("show")) {
                                        if (msg.group.show.indexOf(c) > -1) {
                                            main.menu[t].items[g].header.config.hidden = undefined;
                                            localStorage.removeItem(c);
                                            eldiv = c;
                                        }
                                    }
                                    if (msg.group.hasOwnProperty("hide")) {
                                        if (msg.group.hide.indexOf(c) > -1) {
                                            main.menu[t].items[g].header.config.hidden = true;
                                            localStorage.setItem(c,true);
                                        }
                                    }
                                    $(window).trigger('resize');
                                }
                            }
                            if (msg.group.hasOwnProperty("focus") && eldiv) {
                                setTimeout(function() {
                                    eldiv = $(window)[0].document.getElementById(eldiv);
                                    if (eldiv) { eldiv.scrollIntoView(); }
                                }, 50);
                            }
                        }
                    }
                }
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
                if (voices.length > 0) {
                    var words = new SpeechSynthesisUtterance(msg.tts);
                    for (var v=0; v<voices.length; v++) {
                        if (voices[v].lang === msg.voice) {
                            words.voice = voices[v];
                            break;
                        }
                    }
                    window.speechSynthesis.speak(words);
                }
                else {
                    console.log("Your Browser does not support Text-to-Speech");
                    var toastScope = $rootScope.$new();
                    toastScope.toast = {message:msg.tts, title:"Computer says..."};
                    $mdToast.show({ scope:toastScope, position:'top right', templateUrl:'partials/toast.html' });
                }
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
