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
                //ddd : me.item.ddd,
                width: config.width || group.config.width || 6,
                height: config.height || 1
            },
            convert: function (payload) {
                var d = new Date(payload);
                //console.log("THIS", this.control.ddd, typeof(this.control.ddd));
                //console.log("CONV", typeof(d), d );
                this.control.ddd = d;
                return payload;
            },
            beforeEmit: function (msg, value) {
                //console.log("BE",typeof msg.payload, msg.payload, typeof value, value);
                value = new Date(value);
                return { msg:msg, value:value };
            },
            convertBack: function (value) {
                var d = new Date(value).valueOf();
                //console.log("BACK", typeof(value), value, typeof(d), d );
                return d;
            },
            beforeSend: function (msg) {
                //console.log("BS",typeof msg, msg);
                msg.topic = config.topic || msg.topic;
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_date_picker", DatePickerNode);
};
