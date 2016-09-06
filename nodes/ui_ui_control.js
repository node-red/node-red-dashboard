module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function UiControlNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.on('input', function(msg) {
            if (typeof msg.payload !== "object") { msg.payload = {tab:msg.payload}; }
            // switch to tab name (or number)
            if (msg.payload.hasOwnProperty("tab")) {
                ui.emit('ui-control', { tab: msg.payload.tab });
            }
        });
    }
    RED.nodes.registerType("ui_ui_control", UiControlNode);
};
