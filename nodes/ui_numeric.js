module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function NumericNode(config) {
        RED.nodes.createNode(this, config);
        this.pt = config.passthru;
        this.state = [" "," "];
        var node = this;
        node.status({});

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
                type: 'numeric',
                label: config.label,
                tooltip: config.tooltip,
                order: config.order,
                format: config.format,
                pre: config.format.split('{{')[0] || "",
                post: config.format.split('}}')[1] || "",
                value: Number(config.min),
                min: Number(config.min),
                max: Number(config.max),
                step: Number(config.step || 1),
                wrap: config.wrap || false,
                width: config.width || group.config.width || 6,
                height: config.height || 1,
                ed: (config.format.includes("value") ? false : true),
                className: config.className || '',
            },
            beforeSend: function (msg) {
                msg.payload = parseFloat(msg.payload);
                var t = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg) || node.topi;
                if (t !== undefined) { msg.topic = t; }
                if (node.pt) {
                    node.status({shape:"dot",fill:"grey",text:msg.payload});
                }
                else {
                    node.state[1] = msg.payload;
                    node.status({shape:"dot",fill:"grey",text:node.state[1] + " | " + node.state[1]});
                }
            },
            convert: ui.toFloat.bind(this, config)
        });
        if (!node.pt) {
            node.on("input", function(msg) {
                node.state[0] = msg.payload;
                node.status({shape:"dot",fill:"grey",text:node.state[0] + " | " + node.state[1]});
            });
        }
        node.on("close", done);
    }
    RED.nodes.registerType("ui_numeric", NumericNode);
};
