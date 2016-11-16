module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function BaseNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            name: config.name || 'Node-RED Dashboard',
            theme: config.theme || 'theme-light',
            lightThemeColor: config.lightThemeColor || '#0094CE',
            darkThemeColor: config.darkThemeColor || '#097479'
        };
        ui.addBaseConfig(this.config.name, this.config.theme, this.config.lightThemeColor, this.config.darkThemeColor);
    }
    RED.nodes.registerType("ui_base", BaseNode);
};
