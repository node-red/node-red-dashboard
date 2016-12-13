module.exports = function(RED) {
    var ui = require('../ui')(RED);
    var tc = require('../dist/js/tinycolor');

    function ColourPickerNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            forwardInputMessages: config.passthru,
            control: {
                type: 'colour-picker',
                label: config.label,
                format: config.format,
                inline: config.inline,
                textValue: config.textValue,
                pickerOnly: config.pickerOnly,
                order: config.order,
                value: '',
                width: config.width || group.config.width || 6,
                height: config.height || 1
            },
            beforeSend: function (msg) {
                msg.topic = config.topic || msg.topic;
            },
            convert: function(payload) {
                colour = tc(payload);
                return colour.toString(config.format);
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_colour_picker", ColourPickerNode);
};
