module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function ToastNode(config) {
        RED.nodes.createNode(this, config);
        if (config.hasOwnProperty("displayTime") && (config.displayTime.length > 0)) {
            try { this.displayTime = parseFloat(config.displayTime) * 1000; } 
            catch(e) { this.displayTime = 3000; }
        }
        else { this.displayTime = 3000; }
        if (this.displayTime <= 0) { this.displayTime = 1; }
        this.position = config.position || "top right";

        this.on('input', function(msg) {
            ui.emit('show-toast', {
                title: msg.topic,
                message: msg.payload,
                displayTime: this.displayTime,
                position: this.position
            });
        });
    }

    RED.nodes.registerType("ui_toast", ToastNode);
};
