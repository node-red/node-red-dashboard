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
        this.highlight = config.highlight;
        this.ok = config.ok;
        this.cancel = config.cancel;
        var node = this;

        var done = ui.add({
            node: node,
            control: {},
            storeFrontEndInputAsState: false,
            forwardInputMessages: false,
            beforeSend: function (toSend,msg) {
                var m = msg.value.msg;
                m.topic = config.topic || m.topic;
                return m;
            }
        });

        node.on('input', function(msg) {
            if (node.position !== "dialog") { delete msg.socketid; }
            ui.emitSocket('show-toast', {
                title: msg.topic,
                message: msg.payload,
                highlight: node.highlight || msg.highlight,
                displayTime: node.displayTime,
                position: node.position,
                id: node.id,
                dialog: (node.position === "dialog") || false,
                ok: node.ok,
                cancel: node.cancel,
                socketid: msg.socketid,
                msg: msg
            });
        });

        node.on("close", done);
    }
    RED.nodes.registerType("ui_toast", ToastNode);
};
