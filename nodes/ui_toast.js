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
        this.topic = config.topic;
        var node = this;

        var noscript = function (content) {
            if (typeof content === "object") { return null; }
            content = '' + content;
            content = content.replace(/<.*cript.*\/scrip.*>/ig, '');
            content = content.replace(/ on\w+=".*"/g, '');
            content = content.replace(/ on\w+=\'.*\'/g, '');
            return content;
        }

        var done = ui.add({
            node: node,
            control: {},
            storeFrontEndInputAsState: false,
            forwardInputMessages: false,
            beforeSend: function (msg) {
                var m = msg.payload.msg;
                m.topic = node.topic || m.topic;
                return m;
            }
        });

        node.on('input', function(msg) {
            if (node.position !== "dialog") { delete msg.socketid; }
            msg.payload = noscript(msg.payload);
            ui.emitSocket('show-toast', {
                title: node.topic || msg.topic,
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
