module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function BaseNode(config) {
        RED.nodes.createNode(this, config);
        var defaultLightTheme = {
            baseColor: '#0094CE',
            baseFont: 'Helvetica Neue'
        }
        var defaultDarkTheme = {
            baseColor: '#097479',
            baseFont: 'Helvetica Neue'
        }
        var defaultCustomTheme = {
            name: 'Untitled Theme 1',
            baseColor: defaultLightTheme.baseColor,
            baseFont: defaultLightTheme.baseFont
        }
        var defaultThemeState = {};
        defaultThemeState['base-color'] = defaultThemeState['base-font'] = { default: null, value: null, edited: false };
        defaultThemeState['page-backgroundColor'] = defaultThemeState['page-sidebar-backgroundColor'] = defaultThemeState['page-titlebar-backgroundColor'] =
        defaultThemeState['group-backgroundColor'] = defaultThemeState['group-textColor'] = defaultThemeState['group-borderColor'] =
        defaultThemeState['widget-textColor'] = defaultThemeState['widget-backgroundColor'] = { value: null, edited: false };

        var defaultThemeObject = {
            name: config.theme.name || "theme-light",
            lightTheme: config.theme.lightTheme || defaultLightTheme,
            darkTheme: config.theme.darkTheme || defaultDarkTheme,
            customTheme: config.theme.customTheme || defaultCustomTheme,
            themeState: config.theme.themeState || defaultThemeState
        }
        var siteName = "Node-RED Dashboard";
        if (config.site) {
            siteName = config.site.name
        }
        var defaultSiteObject = {
            name: siteName
        }
        this.config = {
            theme: defaultThemeObject,
            site: defaultSiteObject
        }
        ui.addBaseConfig(this.config);
    }
    RED.nodes.registerType("ui_base", BaseNode);
    RED.library.register("themes");
};