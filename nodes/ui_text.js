module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function TextNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        var layout = config.layout||"row-spread";
        var angLayout = "row";
        var angLayoutAlign = "space-between center";
        if (layout === "row-spread") { angLayout = 'row'; angLayoutAlign = 'space-between center'}
        else if (layout === "row-left") { angLayout = 'row'; angLayoutAlign = 'start center'}
        else if (layout === "row-center") { angLayout = 'row'; angLayoutAlign = 'center center'}
        else if (layout === "row-right") { angLayout = 'row'; angLayoutAlign = 'end center'}
        else if (layout === "col-center") { angLayout = 'column'; angLayoutAlign = 'center center'}
        let style = "";
        if (config.style) {
            if (config.color) {
                style += `color: ${config.color};`
            }
            if (config.fontSize) {
                style += `font-size: ${config.fontSize}px;`
            }
            if (config.font) {
                style += `font-family: ${config.font};`
            }
        }
        var done = ui.add({
            emitOnlyNewValues: false,
            node: node,
            tab: tab,
            group: group,
            control: {
                type: 'text',
                label: config.label,
                order: config.order,
                format: config.format,
                width: config.width || group.config.width || 6,
                height: config.height || 1,
                layout: angLayout,
                layoutAlign: angLayoutAlign,
                className: config.className || '',
                style: style,
            },
            convert: function(value,oldValue,msg) {
                if (value !== undefined && value !== null) {
                    if (Buffer.isBuffer(value)) {
                        value = value.toString('binary');
                    }
                    else {
                        value = value.toString();
                    }
                }
                else {
                    msg.payload = oldValue;
                }
                return value;
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_text", TextNode);
};
