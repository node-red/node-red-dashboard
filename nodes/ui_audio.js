module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function uiAudioNode(config) {
        RED.nodes.createNode(this,config);
        this.voice = config.voice;
        var node = this;
        this.on('input', function(msg) {
            if (Buffer.isBuffer(msg.payload)) {
                ui.emit('ui-audio', { audio:msg.payload });
            }
            else if (typeof msg.payload === "string") {
                ui.emit('ui-audio', { tts:msg.payload, voice:(node.voice || msg.voice || 0) });
            }
        });
    }
    RED.nodes.registerType("ui_audio", uiAudioNode);
}
