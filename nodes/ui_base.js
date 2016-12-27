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
        this.config = {
            name: config.name || 'Node-RED Dashboard',
            theme: config.theme || 'theme-light',
            lightTheme: config.lightTheme || defaultLightTheme,
            darkTheme: config.darkTheme || defaultDarkTheme,
            customTheme: config.customTheme || defaultCustomTheme,
            themeState: config.themeState || defaultThemeState
        };
        ui.addBaseConfig(this.config.name, this.config.theme, this.config.lightTheme, this.config.darkTheme, this.config.customTheme, this.config.themeState);
    }
    RED.nodes.registerType("ui_base", BaseNode);
    RED.library.register("themes");
};
