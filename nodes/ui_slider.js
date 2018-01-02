module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function SliderNode(config) {
        RED.nodes.createNode(this, config);
        this.pt = config.passthru;
        this.state = [" "," "];
        var node = this;
        node.status({});

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
                type: 'slider',
                label: config.label,
                order: config.order,
                value: config.min,
                min: config.min,
                max: config.max,
                step: config.step || 1,
                width: config.width || group.config.width || 6,
                height: config.height || 1
            },
            beforeSend: function (msg) {
                msg.topic = config.topic || msg.topic;
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
    RED.nodes.registerType("ui_slider", SliderNode);
};
