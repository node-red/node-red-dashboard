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
        this.on('input', function(msg) {
            if (Buffer.isBuffer(msg.payload)) {
                ui.emit('ui-audio', { audio:msg.payload, tabname:node.tabname, always:node.always });
            }
            else if (typeof msg.payload === "string") {
                ui.emit('ui-audio', { tts:msg.payload, voice:(node.voice || msg.voice || 0), tabname:node.tabname, always:node.always });
            }
        });
    }
    RED.nodes.registerType("ui_audio", uiAudioNode);
}
