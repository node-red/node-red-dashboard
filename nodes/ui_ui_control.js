module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function UiControlNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.on('input', function(msg) {
            if (typeof msg.payload !== "object") { msg.payload = {tab:msg.payload}; }
            // switch to tab name (or number)
            if (msg.payload.hasOwnProperty("tab")) {
                ui.emit('ui-control', {tab:msg.payload.tab, socketid:msg.socketid});
            }
        });

        ui.ev.on('newsocket', function(id, ip) {
            node.send({payload:"connect", socketid:id, socketip:ip});
        });

        ui.ev.on('endsocket', function(id, ip) {
            node.send({payload:"lost", socketid:id, socketip:ip});
        });

        ui.ev.on('changetab', function(index, name, id, ip) {
            node.send({payload:"change", tab:index, name:name, socketid:id, socketip:ip});
        });

        this.on('close', function() {
            ui.ev.removeAllListeners();
        })
    }
    RED.nodes.registerType("ui_ui_control", UiControlNode);
};
