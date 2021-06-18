module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function ToastNode(config) {
        RED.nodes.createNode(this, config);
        if (config.hasOwnProperty("displayTime") && (config.displayTime.length > 0)) {
            try { this.displayTime = parseFloat(config.displayTime) * 1000; }
            catch(e) { this.displayTime = 3000; }
        }
        this.position = config.position || "top right";
        this.highlight = config.highlight;
        this.ok = config.ok;
        this.cancel = config.cancel;
        this.className = config.className;
        this.topic = config.topic;
        if (config.sendall === undefined) { this.sendall = true; }
        else { this.sendall = config.sendall; }
        this.raw = config.raw || false;
        var node = this;

        // var noscript = function (content) {
        //     if (typeof content === "object") { return null; }
        //     content = '' + content;
        //     content = content.replace(/<.*cript.*/ig, '');
        //     content = content.replace(/.on\w+=.*".*"/g, '');
        //     content = content.replace(/.on\w+=.*\'.*\'/g, '');
        //     return content;
        // }

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
            if (node.sendall === true) { delete msg.socketid; }
            var dt = node.displayTime || msg.timeout * 1000 || 3000;
            if (dt <= 0) { dt = 1; }
            //msg.payload = noscript(msg.payload);
            ui.emitSocket('show-toast', {
                title: node.topic || msg.topic,
                toastClass: node.className || msg.className,
                message: msg.payload,
                highlight: node.highlight || msg.highlight,
                displayTime: dt,
                position: node.position,
                id: node.id,
                dialog: (node.position === "dialog" || node.position === "prompt") || false,
                prompt: (node.position === "prompt") || false,
                ok: node.ok,
                cancel: node.cancel,
                socketid: msg.socketid,
                raw: node.raw,
                msg: msg
            });
        });

        node.on("close", done);
    }
    RED.nodes.registerType("ui_toast", ToastNode);
};
