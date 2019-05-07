module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function DatePickerNode(config) {
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
                type: 'date-picker',
                label: config.label,
                order: config.order,
                ddd : new Date(),
                width: config.width || group.config.width || 6,
                height: config.height || 1
            },
            convert: function (p,o,m) {
                var d = new Date(m.payload);
                this.control.ddd = d;
                return m.payload;
            },
            beforeEmit: function (msg, value) {
                if (value === undefined) { return; }
                value = new Date(value);
                return { msg:msg, value:value };
            },
            convertBack: function (value) {
                var d = new Date(value).valueOf();
                return d;
            },
            beforeSend: function (msg) {
                msg.topic = config.topic || msg.topic;
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_date_picker", DatePickerNode);
};
