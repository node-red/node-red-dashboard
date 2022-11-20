module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function TextInputNode(config) {
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
            forwardInputMessages: config.passthru,
            control: {
                type: (config.delay <= 0 ? 'text-input-CR' : 'text-input'),
                label: config.label,
                tooltip: config.tooltip,
                mode: config.mode,
                delay: config.delay,
                order: config.order,
                className: config.className || '',
                value: '',
                width: config.width || group.config.width || 6,
                height: config.height || 1,
                sendOnBlur: config.sendOnBlur
            },
            beforeSend: function (msg) {
                if (config.mode.indexOf("time") != -1) {
                    if (typeof msg.payload === "string") {
                        msg.payload = Date.parse(msg.payload);
                    }
                }
                // if (config.mode === "week") { msg.payload = Date.parse(msg.payload); }
                // if (config.mode === "month") { msg.payload = Date.parse(msg.payload); }
                var t = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg) || node.topi;
                if (t !== undefined) { msg.topic = t; }
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_text_input", TextInputNode);
};
