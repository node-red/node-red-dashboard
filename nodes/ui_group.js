module.exports = function(RED) {

    function GroupNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            order: config.order || 0,
            name: config.name,
            width: config.width
        };
    }

    RED.nodes.registerType("ui_group", GroupNode);
};
