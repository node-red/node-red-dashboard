/** 
Copyright 2016,2020 JS Foundation and other contributors, https://js.foundation/
Copyright 2016 IBM Corp.
Copyright 2015 Andrei Tatar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.-->
*/

/**
NOTICE: This file was modified within the bounds of the Apache 2.0 licence for distribution by Maya Labs
*/

module.exports = function(RED) {
    var ui = require('../ui')(RED);
    var path= require('path');
    var gsp = require.resolve('gridstack');
    var node;
    var uiset = RED.settings.ui || "{}";

    function BaseNode(config) {
        RED.nodes.createNode(this, config);
        node = this;
        var baseFontName = "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif";

        var defaultLightTheme = {
            baseColor: '#4A304B',
            baseFont: baseFontName
        }
        var defaultDarkTheme = {
            baseColor: '#097479',
            baseFont: baseFontName
        }
        var defaultCustomTheme = {
            name: 'Untitled Theme 1',
            baseColor: defaultLightTheme.baseColor,
            baseFont: baseFontName
        }
        var defaultAngularTheme = {
            primary:'indigo',
            accents:'teal',
            warn: "red",
            background:'grey',
            palette:'light'
        };

        // Setup theme name
        // First try old format (for upgrading with old flow file)
        // Then try new format
        // Else fallback to theme-light
        var themeName;
        if (typeof(config.theme) === 'string') { themeName = config.theme; }
        else { themeName = config.theme.name || "theme-light"; }

        // Setup other styles
        var defaultThemeState = {}
        if (themeName === 'theme-light') {
            defaultThemeState["base-font"] = {value: baseFontName};
            defaultThemeState["base-color"] = {value: "#4A304B"};
            defaultThemeState["page-backgroundColor"] = {value: "#fafafa"};
            defaultThemeState["page-titlebar-backgroundColor"] = {value: "#4A304B"};
            defaultThemeState["page-sidebar-backgroundColor"] = {value: "#ffffff"};
            defaultThemeState["group-backgroundColor"] = {value: "#ffffff"};
            defaultThemeState["group-textColor"] = {value: "#000000"};
            defaultThemeState["group-borderColor"] = {value: "#ffffff"};
            defaultThemeState["widget-textColor"] = {value: "#111111"};
            defaultThemeState["widget-backgroundColor"] = {value: "#4A304B"};
        }
        else {
            defaultThemeState["base-font"] = {value: baseFontName};
            defaultThemeState["base-color"] = {value: "#097479"};
            defaultThemeState["page-backgroundColor"] = {value: "#111111"};
            defaultThemeState["page-titlebar-backgroundColor"] = {value: "#097479"};
            defaultThemeState["page-sidebar-backgroundColor"] = {value: "#333333"};
            defaultThemeState["group-backgroundColor"] = {value: "#333333"};
            defaultThemeState["group-textColor"] = {value: "#10cfd8"};
            defaultThemeState["group-borderColor"] = {value: "#555555"};
            defaultThemeState["widget-textColor"] = {value: "#eeeeee"};
            defaultThemeState["widget-backgroundColor"] = {value: "#097479"};
        }

        var defaultThemeObject = {
            name: themeName,
            lightTheme: config.theme.lightTheme || defaultLightTheme,
            darkTheme: config.theme.darkTheme || defaultDarkTheme,
            customTheme: config.theme.customTheme || defaultCustomTheme,
            angularTheme: config.theme.angularTheme || defaultAngularTheme,
            themeState: config.theme.themeState || defaultThemeState
        }

        this.config = {
            theme: defaultThemeObject,
            site: config.site
        }
        ui.addBaseConfig(this.config);
    }
    RED.nodes.registerType("ui_base", BaseNode);

    RED.library.register("themes");

    RED.httpAdmin.get('/uisettings', function(req, res) {
        res.json(uiset);
    });

    const optsjs = { root: path.join(__dirname , '../dist/js'), dotfiles: 'deny' };
    const optscss = { root: path.join(__dirname , '../dist/css'), dotfiles: 'deny' };
    const optsgs = { root: path.dirname(gsp), dotfiles: 'deny' };

    RED.httpAdmin.get('/ui_base/js/*', function(req, res) {
        res.sendFile(req.params[0], optsjs, function (err) {
            if (err) {
                res.sendStatus(404);
                if (node) { node.warn("JS File not found."); }
                else { console.log("ui_base - error:",err); }
            }
        });
    });

    RED.httpAdmin.get('/ui_base/css/*', function(req, res) {
        res.sendFile(req.params[0], optscss, function (err) {
            if (err) {
                res.sendStatus(404);
                if (node) { node.warn("CSS File not found."); }
                else { console.log("ui_base - error:",err); }
            }
        });
    });

    RED.httpAdmin.get('/ui_base/gs/*', function(req, res) {
        res.sendFile(req.params[0], optsgs, function (err) {
            if (err) {
                res.sendStatus(404);
                if (node) { node.warn("Gridstack file not found."); }
                else { console.log("ui_base - error:",err); }
            }
        });
    });
};
