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
        this.config = {
            name: config.name || 'Node-RED Dashboard',
            theme: config.theme || 'theme-light',
            lightTheme: config.lightTheme || defaultLightTheme,
            darkTheme: config.darkTheme || defaultDarkTheme,
            customTheme: config.customTheme || defaultCustomTheme
        };
        ui.addBaseConfig(this.config.name, this.config.theme, this.config.lightTheme, this.config.darkTheme, this.config.customTheme);
    }
    RED.nodes.registerType("ui_base", BaseNode);
    RED.library.register("themes");
};
