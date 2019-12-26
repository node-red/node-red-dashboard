
// Object.assign polyfill for IE11...
if (typeof Object.assign != 'function') {
    (function() {
        Object.assign = function(target) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            var output = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
                if (source !== undefined && source !== null) {
                    for (var nextKey in source) {
                        if (source.hasOwnProperty(nextKey)) {
                            output[nextKey] = source[nextKey];
                        }
                    }
                }
            }
            return output;
        };
    })()
}

// String startsWith polyfill for IE11...
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

var doVisualUpdates = true;
document.addEventListener('visibilitychange', function() {
    setTimeout(function() { doVisualUpdates = !document.hidden; }, 1000);
});

var app = angular.module('ui',['ngMaterial', 'ngMdIcons', 'ngSanitize', 'ngTouch', 'sprintf', 'chart.js', 'color.picker']);

var locale = (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;
moment.locale(locale);

var dateFormat;
app.config(['$mdThemingProvider', '$compileProvider', '$mdDateLocaleProvider', '$provide',
    function ($mdThemingProvider, $compileProvider, $mdDateLocaleProvider, $provide) {
        // base theme can be default, dark, light or none
        // allowed colours for palettes
        // red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime, yellow, amber, orange, deep-orange, brown, grey, blue-grey
        $mdThemingProvider.generateThemesOnDemand(true);
        $provide.value('themeProvider', $mdThemingProvider);

        //white-list all protocols
        $compileProvider.aHrefSanitizationWhitelist(/.*/);

        //set the locale provider
        $mdDateLocaleProvider.months = moment.localeData().months();
        $mdDateLocaleProvider.shortMonths = moment.localeData().monthsShort();
        $mdDateLocaleProvider.days = moment.localeData().weekdays();
        $mdDateLocaleProvider.shortDays = moment.localeData().weekdaysMin();

        $mdDateLocaleProvider.formatDate = function(date) {
            return date ? moment(date).format(dateFormat || "DD MMM YYYY") : null;
        };

        $mdDateLocaleProvider.parseDate = function(dateString) {
            var m = moment(dateString, dateFormat || "DD MMM YYYY", true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        };

        $mdDateLocaleProvider.monthHeaderFormatter = function(date) {
            return moment(date).format("MMM YYYY");
        };
    }
]);

app.controller('MainController', ['$mdSidenav', '$window', 'UiEvents', '$location', '$document', '$mdToast', '$mdDialog', '$rootScope', '$sce', '$timeout', '$scope', 'themeProvider', '$mdTheming',
    function ($mdSidenav, $window, events, $location, $document, $mdToast, $mdDialog, $rootScope, $sce, $timeout, $scope, themeProvider, $mdTheming) {
        this.menu = [];
        this.headElementsAppended = [];
        this.headOriginalElements = [];
        this.len = 0;
        this.selectedTab = null;
        this.loaded = false;
        this.hideToolbar = false;
        this.allowSwipe = false;
        this.lockMenu = false;
        this.allowTempTheme = true;
        var main = this;
        var audioContext;
        var audioSource;
        var voices = [];
        var tabId = 0;
        var disc = true;

        function moveTab(d) {
            var len = main.menu.length;
            if (len > 1) {
                //var i = parseInt($location.path().substr(1));
                for (var i = +tabId + d; i != tabId; i += d) {
                    i = i % len;
                    if (i < 0) { i += len; }
                    if (!main.menu[i].disabled && !main.menu[i].hidden) {
                        main.select(i);
                        tabId = i;
                        return;
                    }
                }
            }
        }

        $scope.onSwipeLeft = function() { if (main.allowSwipe) { moveTab(-1); } }
        $scope.onSwipeRight = function() { if (main.allowSwipe) { moveTab(1); } }

        this.toggleSidenav = function () { $mdSidenav('left').toggle(); }

        this.select = function (index) {
            main.selectedTab = main.menu[index];
            if (main.menu.length > 0) { if ($mdSidenav('left')) { $mdSidenav('left').close(); } }
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
                // open in existing tab (closes dashboard)
                else if (menu.target === 'thistab') {
                    $window.open(menu.link, "_self");
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

        $scope.location = $location;

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
            lessObj["@nrTheme"] = !main.allowAngularTheme;
            lessObj["@nrUnitHeight"] = (main.sizes.sy / 2)+"px";
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

        function hideTabsAndGroups() {
            var flag = false;
            for (var t in main.menu) {
                if (main.menu.hasOwnProperty(t)) {
                    if (typeof localStorage !== 'undefined') {
                        if (localStorage.getItem("th"+t+main.menu[t].header) == "true") {
                            if (main.menu[t].hidden === true) { localStorage.removeItem("th"+t+main.menu[t].header) }
                            else { main.menu[t].hidden = true; }
                            flag = true;
                        }
                        if (localStorage.getItem("th"+t+main.menu[t].header) == "false") {
                            if (main.menu[t].hidden === false) { localStorage.removeItem("th"+t+main.menu[t].header) }
                            else { main.menu[t].hidden = false; }
                            flag = true;
                        }
                        if (localStorage.getItem("td"+t+main.menu[t].header) == "true") {
                            if (main.menu[t].disabled === true) { localStorage.removeItem("td"+t+main.menu[t].header) }
                            else { main.menu[t].disabled = true; }
                            flag = true;
                        }
                        if (localStorage.getItem("td"+t+main.menu[t].header) == "false") {
                            if (main.menu[t].disabled === false) { localStorage.removeItem("td"+t+main.menu[t].header) }
                            else { main.menu[t].disabled = false; }
                            flag = true;
                        }
                    }
                    for (var g in main.menu[t].items) {
                        if (main.menu[t].items.hasOwnProperty(g)) {
                            var c = (main.menu[t].header+" "+main.menu[t].items[g].header.name).replace(/ /g,"_");
                            if ((typeof localStorage !== 'undefined') && (localStorage.getItem("g"+c) == "true")) {
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
            disc = false;
            events.emit('ui-params', $location.search());
            main.menu = ui.menu;
            main.globals = ui.globals;
            main.nothing = false;
            var name;
            if (ui.site) {
                name = main.name = ui.site.name;
                main.hideToolbar = (ui.site.hideToolbar == "true");
                main.allowSwipe = (ui.site.allowSwipe == "true");
                main.lockMenu = (ui.site.lockMenu == "true");
                if (typeof ui.site.allowTempTheme === 'undefined') { main.allowTempTheme = true; }
                else {
                    main.allowTempTheme = (ui.site.allowTempTheme == "true");
                    main.allowAngularTheme = (ui.site.allowTempTheme == "none");
                }
                dateFormat = ui.site.dateFormat || "DD/MM/YYYY";
                if (ui.site.hasOwnProperty("sizes")) {
                    sizes.setSizes(ui.site.sizes);
                    main.sizes = ui.site.sizes;
                }
            }
            if (ui.theme && ui.theme.angularTheme) {
                themeProvider.theme('default')
                    .primaryPalette(ui.theme.angularTheme.primary || 'indigo')
                    .accentPalette(ui.theme.angularTheme.accents || 'blue')
                    .warnPalette(ui.theme.angularTheme.warn || 'red')
                    .backgroundPalette(ui.theme.angularTheme.background || 'grey');
                if (ui.theme.angularTheme.palette === "dark") { themeProvider.theme('default').dark(); }
                $mdTheming.generateTheme('default');
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
                hideTabsAndGroups();
                done();
            }
            if (!isNaN(prevTabIndex) && prevTabIndex < main.menu.length && !main.menu[prevTabIndex].disabled) {
                main.selectedTab = main.menu[prevTabIndex];
                finishLoading();
            }
            else {
                $timeout( function() {
                    // open first menu, which is not new tab link, and is not disabled
                    var indexToOpen = null;
                    main.menu.some(function (menu, i) {
                        if (menu.target === undefined || menu.target === 'iframe') {
                            if (!menu.disabled) {
                                indexToOpen = i;
                                return true;
                            }
                            else {
                                return false;
                            }
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
            $scope.$apply();
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

        function arrayIncludesName(strArray, strName) {
            // if an array of names is input, use it -- else build an array of one name
            var arrNames = strArray && Array.isArray(strArray) ? strArray : [strArray];
            // convert all names to lower-case, and replace any spaces with '_'
            arrNames = arrNames.map(function (n) {
                return n.toLowerCase().replace(/\s+/g, '_');
            });
            return arrNames.includes(strName.toLowerCase().replace(/\s+/g, '_'));
        }

        events.on(function (msg) {
            var found;
            if (msg.hasOwnProperty('msg') && msg.msg.templateScope === 'global') {
                found = findHeadOriginalEl(msg.id);
                if (found) {
                    replaceHeadOriginalEl(found, msg.msg.template)
                }
                else {
                    found = findHeadElAppended(msg.id);
                    if (found) {
                        replaceHeadEl(found, msg.msg.template)
                    }
                    else {
                        return;
                    }
                }
            }
            else {
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
            $scope.$apply();
        });

        events.on('disconnect', function(m) {
            if (!disc && doVisualUpdates) {
                $mdToast.show({
                    template: '<md-toast><div class="md-toast-error">&#x2718; &nbsp; Connection lost</div></md-toast>',
                    position: 'top right',
                    hideDelay: 6000000
                });
                disc = true;
            }
        });

        events.on('show-toast', function (msg) {
            if (msg.raw !== true) {
                var temp = document.createElement('div');
                temp.textContent = msg.message;
                msg.message = temp.innerHTML;
            }
            if (msg.dialog === true) {
                var confirm;
                if (msg.message == "") { $mdDialog.cancel(); return; }
                if (msg.cancel && msg.prompt) {
                    confirm = $mdDialog.prompt()
                        .title(msg.title)
                        .htmlContent(msg.message)
                        .initialValue("")
                        .ariaLabel(msg.ok + " or " + msg.cancel)
                        .ok(msg.ok)
                        .cancel(msg.cancel);
                    confirm._options.focusOnOpen = false;
                }
                else if (msg.cancel) {
                    confirm = $mdDialog.confirm()
                        .title(msg.title)
                        .htmlContent(msg.message)
                        .ariaLabel(msg.ok + " or " + msg.cancel)
                        .ok(msg.ok)
                        .cancel(msg.cancel);
                    confirm._options.focusOnOpen = false;
                }
                else {
                    confirm = $mdDialog.alert()
                        .title(msg.title)
                        .htmlContent(msg.message)
                        .ariaLabel(msg.ok)
                        .ok(msg.ok)
                }
                confirm._options.template = '<md-dialog md-theme="{{ dialog.theme || dialog.defaultTheme }}" aria-label="{{ dialog.ariaLabel }}" >' +
                    '<md-dialog-content class="md-dialog-content" role="document" tabIndex="-1">' +
                        '<h2 class="md-title">{{ dialog.title }}</h2>' +
                        '<div ng-if="::dialog.mdHtmlContent" class="md-dialog-content-body"ng-bind-html="::dialog.mdHtmlContent | trusted"></div>' +
                        '<div ng-if="::!dialog.mdHtmlContent" class="md-dialog-content-body"><p>{{::dialog.mdTextContent}}</p></div>' +
                        '<md-input-container md-no-float ng-if="::dialog.$type == \'prompt\'" class="md-prompt-input-container"><input ng-keypress="dialog.keypress($event)" md-autofocus ng-model="dialog.result"placeholder="{{::dialog.placeholder}}" ng-required="dialog.required">' +
                        '</md-input-container>' +
                    '</md-dialog-content>' +
                    '<md-dialog-actions>' +
                        '<md-button ng-if="dialog.$type === \'confirm\' || dialog.$type === \'prompt\'"ng-click="dialog.abort()" class="md-primary md-cancel-button">{{ dialog.cancel }}</md-button>' +
                        '<md-button ng-click="dialog.hide()" class="md-primary md-confirm-button" md-autofocus="dialog.$type===\'alert\'" ng-disabled="dialog.required && !dialog.result">{{ dialog.ok }}</md-button>' +
                    '</md-dialog-actions>' +
                '</md-dialog>';
                $mdDialog.show(confirm, { panelClass:'nr-dashboard-dialog' }).then(
                    function(res) {
                        console.log("RES",typeof res,res,"::",msg.ok,"::");
                        msg.msg.payload = msg.ok;
                        if (res != true) { msg.msg.payload = res; }
                        if (res == undefined) { msg.msg.payload = ""; }
                        console.log("MSG",msg);
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
                    if (msg.hasOwnProperty("message") && msg.message == "") { msg.displayTime = 1; }
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
            if (msg.hasOwnProperty("control")) { // if it's a request to modify a control
                var found = findControl(msg.id, main.menu);
                for (var property in msg.control) {
                    if (msg.control.hasOwnProperty(property) && found.hasOwnProperty(property)) {
                        found[property] = msg.control[property];
                    }
                }
                //Object.assign(found,msg.control);
            }
            if (msg.hasOwnProperty("tabs")) { // ui_control request to show/hide/enable/disable tabs
                if (typeof msg.tabs === 'object') {
                    for (var ta in main.menu) {
                        if (main.menu.hasOwnProperty(ta)) {
                            if (msg.tabs.hasOwnProperty("show")) {
                                if (arrayIncludesName(msg.tabs.show, main.menu[ta].header)) {
                                    main.menu[ta].hidden = false;
                                    localStorage.setItem("th"+ta+main.menu[ta].header,false);
                                }
                            }
                            if (msg.tabs.hasOwnProperty("hide")) {
                                if (arrayIncludesName(msg.tabs.hide, main.menu[ta].header)) {
                                    main.menu[ta].hidden = true;
                                    localStorage.setItem("th"+ta+main.menu[ta].header,true);
                                }
                            }
                            if (msg.tabs.hasOwnProperty("enable")) {
                                if (arrayIncludesName(msg.tabs.enable, main.menu[ta].header)) {
                                    main.menu[ta].disabled = false;
                                    localStorage.setItem("td"+ta+main.menu[ta].header,false);
                                }
                            }
                            if (msg.tabs.hasOwnProperty("disable")) {
                                if (arrayIncludesName(msg.tabs.disable, main.menu[ta].header)) {
                                    main.menu[ta].disabled = true;
                                    localStorage.setItem("td"+ta+main.menu[ta].header,true);
                                }
                            }
                        }
                    }
                }
            }
            if (msg.hasOwnProperty("tab")) { // if it's a request to change tabs
                // is it a tab name or relative number?
                if (typeof msg.tab === 'string') {
                    if (msg.tab === "") { events.emit('ui-refresh', {}); }
                    if (msg.tab === "+1") { moveTab(1); $scope.$apply(); return; }
                    if (msg.tab === "-1") { moveTab(-1); $scope.$apply(); return; }
                    for (var i in main.menu) {
                        // is it the name of a tab ?
                        if (msg.tab == main.menu[i].header) {
                            if (!main.menu[i].disabled) { main.select(i); }
                            $scope.$apply();
                            return;
                        }
                        // or the name of a link ?
                        else if (msg.tab == main.menu[i].name) {
                            if (!main.menu[i].disabled) { main.open(main.menu[i], i); }
                            $scope.$apply();
                            return;
                        }
                    }
                }
                // or is it a valid index number ?
                var index = parseInt(msg.tab);
                if (Number.isNaN(index) || index < 0) { return; }
                if (index < main.menu.length) {
                    if (!main.menu[index].disabled) { main.open(main.menu[index], index); }
                    $scope.$apply();
                    return;
                }
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
                                            localStorage.removeItem("g"+c);
                                            eldiv = c;
                                        }
                                    }
                                    if (msg.group.hasOwnProperty("hide")) {
                                        if (msg.group.hide.indexOf(c) > -1) {
                                            main.menu[t].items[g].header.config.hidden = true;
                                            localStorage.setItem("g"+c,true);
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
            $scope.$apply();
        });

        events.on('ui-audio', function(msg) {
            if (msg.reset) {
                if (audioSource) {
                    // Stop the current audio source immediately
                    audioSource.disconnect();
                    audioSource.stop(0);
                    audioSource = null;
                    events.emit('ui-audio', 'reset');
                }
                else if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                    events.emit('ui-audio', 'reset');
                }
                return;
            }
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
                    words.onerror = function(err) { events.emit('ui-audio', 'error: '+err.error); }
                    words.onend = function() { events.emit('ui-audio', 'complete'); }
                    for (var v=0; v<voices.length; v++) {
                        if (voices[v].lang === msg.voice) {
                            words.voice = voices[v];
                            break;
                        }
                    }
                    events.emit('ui-audio', 'playing');
                    window.speechSynthesis.speak(words);
                }
                else {
                    console.log("This Browser does not support Text-to-Speech");
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
                    audioContext = audioContext || new AudioContext();
                    audioSource = audioContext.createBufferSource();
                    audioSource.onended = function() {
                        events.emit('ui-audio', 'complete');
                    }
                    var buffer = new Uint8Array(msg.audio);
                    audioContext.decodeAudioData(
                        buffer.buffer,
                        function(buffer) {
                            audioSource.buffer = buffer;
                            audioSource.connect(audioContext.destination);
                            audioSource.start(0);
                            events.emit('ui-audio', 'playing');
                        },
                        function() { events.emit('ui-audio', 'error'); }
                    )
                }
                catch(e) { events.emit('ui-audio', 'error'); }
            }
        });
    }]);
