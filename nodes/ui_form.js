module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function FormNode(config) {
        RED.nodes.createNode(this, config);
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
            forwardInputMessages: false,
            storeFrontEndInputAsState: false,
            control: {
                type: 'form',
                label: config.label,
                order: config.order,
                value: config.payload || node.id,
                width: config.width || group.config.width || 6,
                height: config.height || config.splitLayout == true ? Math.ceil(config.options.length/2) : config.options.length,
                options: config.options,
                formValue: config.formValue,
                submit: config.submit,
                cancel: config.cancel,
                splitLayout: config.splitLayout || false,
                sy: ui.getSizes().sy,
                cy: ui.getSizes().cy,
                className: config.className || '',
            },
            beforeSend: function (msg) {
                var t = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg) || node.topi;
                if (t !== undefined) { msg.topic = t; }
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_form", FormNode);
};
