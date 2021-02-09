module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function FormNode(config) {
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
            forwardInputMessages: false,
            control: {
                type: 'form',
                label: config.label,
                order: config.order,
                value: config.payload || node.id,
                width: config.width || group.config.width || 6,
                height: config.height || config.options.length ,
                options: config.options,
                formValue: config.formValue,
                submit: config.submit,
                cancel: config.cancel,
                splitLayout: config.splitLayout || false,
                sy: ui.getSizes().sy,
                cy: ui.getSizes().cy
            },
            beforeSend: function (msg) {
                msg.topic = config.topic || undefined;
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_form", FormNode);
};
