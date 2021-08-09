module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function TextInputNode(config) {
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
                type: (config.delay <= 0 ? 'text-input-CR' : 'text-input'),
                label: config.label,
                tooltip: config.tooltip,
                mode: config.mode,
                delay: config.delay,
                order: config.order,
                value: '',
                width: config.width || group.config.width || 6,
                height: config.height || 1
            },
            beforeSend: function (msg) {
                if (config.mode === "time") {
                    if (typeof msg.payload === "string") {
                        msg.payload = Date.parse(msg.payload);
                    }
                }
                // if (config.mode === "week") { msg.payload = Date.parse(msg.payload); }
                // if (config.mode === "month") { msg.payload = Date.parse(msg.payload); }
                var t = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg) || node.topi;
                if (t) { msg.topic = t; }
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_text_input", TextInputNode);
};
