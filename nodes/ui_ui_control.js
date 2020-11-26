module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function UiControlNode(config) {
        RED.nodes.createNode(this, config);
        this.events = config.events || "all";
        var node = this;

        this.on('input', function(msg) {
            if (typeof msg.payload !== "object") { msg.payload = {tab:msg.payload}; }
            // show/hide or enable/disable tabs
            if (msg.payload.hasOwnProperty("tabs")) {
                ui.emit('ui-control', {tabs:msg.payload.tabs, socketid:msg.socketid});
            }
            // switch to tab name (or number)
            if (msg.payload.hasOwnProperty("tab")) {
                ui.emit('ui-control', {tab:msg.payload.tab, socketid:msg.socketid});
            }
            // show or hide ui groups
            if (msg.payload.hasOwnProperty("group")) {
                ui.emit('ui-control', {group:msg.payload.group, socketid:msg.socketid});
            }
        });

        var sendconnect = function(id, ip) {
            node.send({payload:"connect", socketid:id, socketip:ip});
        };

        var sendlost = function(id, ip) {
            node.send({payload:"lost", socketid:id, socketip:ip});
        };

        var sendchange = function(index, name, id, ip, p) {
            node.send({payload:"change", tab:index, name:name, socketid:id, socketip:ip, params:p});
        }

        var sendcollapse = function(group, state, id, ip) {
            node.send({payload:"group", group:group, open:state, socketid:id, socketip:ip,});
        }

        if (node.events === "connect") {
            ui.ev.on('newsocket', sendconnect);
        }
        else if (node.events === "change") {
            ui.ev.on('changetab', sendchange);
            ui.ev.on('collapse', sendcollapse);
        }
        else {
            ui.ev.on('newsocket', sendconnect);
            ui.ev.on('changetab', sendchange);
            ui.ev.on('collapse', sendcollapse);
            ui.ev.on('endsocket', sendlost);
        }

        this.on('close', function() {
            if (node.events === "connect") {
                ui.ev.removeListener('newsocket', sendconnect);
            }
            else if (node.events === "change") {
                ui.ev.removeListener('changetab', sendchange);
                ui.ev.removeListener('collapse', sendcollapse);
            }
            else {
                ui.ev.removeListener('newsocket', sendconnect);
                ui.ev.removeListener('changetab', sendchange);
                ui.ev.removeListener('collapse', sendcollapse);
                ui.ev.removeListener('endsocket', sendlost);
            }
        })
    }
    RED.nodes.registerType("ui_ui_control", UiControlNode);
};
