module.exports = function(RED) {
    var ui = require('../ui')(RED);
    var tc = require('../dist/js/tinycolor-min');

    function ColourPickerNode(config) {
        RED.nodes.createNode(this, config);
        this.format = config.format;
        this.outformat = config.outformat;
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        node.on("input", function(msg) {
            node.topi = msg.topic;
        });

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            forwardInputMessages: config.passthru,
            control: {
                type: 'colour-picker',
                label: config.label,
                format: config.format,
                showPicker: config.showPicker,
                showSwatch: config.showSwatch,
                showValue: config.showValue,
                showHue: config.showHue,
                showAlpha: config.showAlpha,
                showLightness: config.showLightness,
                square: (config.square == 'true') || false,
                dynOutput: config.dynOutput,
                allowEmpty: true,
                order: config.order,
                value: '',
                width: config.width || group.config.width || 6,
                height: config.height || 1,
                className: config.className || '',
            },
            beforeSend: function (msg) {
                if (node.outformat === 'object') {
                    var pay = tc(msg.payload);
                    if (node.format === 'rgb') { msg.payload = pay.toRgb(); }
                    if (node.format === 'hsl') { msg.payload = pay.toHsl(); }
                    if (node.format === 'hsv') { msg.payload = pay.toHsv(); }
                }
                var t = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg) || node.topi;
                if (t !== undefined) { msg.topic = t; }
            },
            convert: function(p,o,m) {
                if (m.payload === undefined || m.payload === null) { return; }
                var colour = tc(m.payload);
                return colour.toString(config.format);
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_colour_picker", ColourPickerNode);
};
