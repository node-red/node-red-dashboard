module.exports = function(RED) {
    var ui = require('../ui')(RED);
    var path= require('path');
    var node;

    function BaseNode(config) {
        RED.nodes.createNode(this, config);
        node = this;
        var baseFontName = "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif";

        var defaultLightTheme = {
            baseColor: '#0094CE',
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
            defaultThemeState["base-color"] = {value: "#0094CE"};
            defaultThemeState["page-backgroundColor"] = {value: "#fafafa"};
            defaultThemeState["page-titlebar-backgroundColor"] = {value: "#0094CE"};
            defaultThemeState["page-sidebar-backgroundColor"] = {value: "#ffffff"};
            defaultThemeState["group-backgroundColor"] = {value: "#ffffff"};
            defaultThemeState["group-textColor"] = {value: "#000000"};
            defaultThemeState["group-borderColor"] = {value: "#ffffff"};
            defaultThemeState["widget-textColor"] = {value: "#111111"};
            defaultThemeState["widget-backgroundColor"] = {value: "#0094CE"};
        }
        else {
            defaultThemeState["base-font"] = {value: baseFontName};
            defaultThemeState["base-color"] = {value: "#097479"};
            defaultThemeState["page-backgroundColor"] = {value: "#111111"};
            defaultThemeState["page-titlebar-backgroundColor"] = {value: "#097479"};
            defaultThemeState["page-sidebar-backgroundColor"] = {value: "#000000"};
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
        var ret = RED.settings.ui || "{}";
        res.json(ret);
    });

    RED.httpAdmin.get('/ui_base/js/*', function(req, res) {
        var filename = path.join(__dirname , '../dist/js', req.params[0]);
        res.sendFile(filename, function (err) {
            if (err) { node.warn(filename + " not found. Maybe running in dev mode."); }
        });
    });
};
