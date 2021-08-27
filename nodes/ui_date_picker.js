module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function DatePickerNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        //if the settings.js ui : disableFeedbackToAllSessions is true then set storeFrontEndInputAsStateValue as false
        var storeFrontEndInputAsStateBoolean = true;
        if (RED.settings.hasOwnProperty("ui") && RED.settings.ui.hasOwnProperty("disableFeedbackToAllSessions") && RED.settings.ui.disableFeedbackToAllSessions == true) {
            storeFrontEndInputAsStateBoolean = false;
        }
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
            storeFrontEndInputAsState: storeFrontEndInputAsStateBoolean,
            control: {
                type: 'date-picker',
                label: config.label,
                order: config.order,
                ddd : new Date().setUTCHours(0,0,0,0),
                width: config.width || group.config.width || 6,
                height: config.height || 1,
                className: config.className || '',
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
                var t = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg) || node.topi;
                if (t) { msg.topic = t; }
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_date_picker", DatePickerNode);
};
