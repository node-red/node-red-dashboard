module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function LinkNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var done = ui.addLink(config.name, config.link, config.icon, config.order, config.target);
        node.on("close", done);
    }

    RED.nodes.registerType("ui_link", LinkNode);
};
