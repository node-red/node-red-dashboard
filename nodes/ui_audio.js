module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function uiAudioNode(config) {
        RED.nodes.createNode(this,config);
        this.voice = config.voice;
        this.group = config.group;
        this.always = config.always || false;
        if (this.group && RED.nodes.getNode(this.group).hasOwnProperty("config")) {
            this.tabname = RED.nodes.getNode(RED.nodes.getNode(this.group).config.tab).name;
        }
        var node = this;
        node.status({});

        this.on('input', function(msg) {
            if (msg.hasOwnProperty("level") && (isNaN(msg.level) || msg.level > 300 || msg.level < 0)) {
                delete msg.level;
            }
            if (msg.reset == true) {
                ui.emit('ui-audio', { reset:true, tabname:node.tabname, always:node.always });
            }
            else if (Buffer.isBuffer(msg.payload)) {
                ui.emit('ui-audio', { audio:msg.payload, tabname:node.tabname, always:node.always, vol:msg.level });
            }
            else if (typeof msg.payload === "string") {
                ui.emit('ui-audio', { tts:msg.payload, voice:(node.voice || msg.voice || 0), tabname:node.tabname, always:node.always, vol:msg.level });
            }
        });

        var updateStatus = function(audioStatus) {
            if (audioStatus === "complete") {
                // When the audio or speech has played completely, clear the node status
                node.status({});
            }
            else if (audioStatus.indexOf("error") === 0) {
                node.status({shape:"ring",fill:"red",text:audioStatus});
            }
            else {
                node.status({shape:"dot",fill:"blue",text:audioStatus});
            }
        };
        ui.ev.on('audiostatus', updateStatus);

        this.on('close', function() {
            ui.ev.removeListener('audiostatus', updateStatus);
        })
    }
    RED.nodes.registerType("ui_audio", uiAudioNode);
}
