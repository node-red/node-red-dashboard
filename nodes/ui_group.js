module.exports = function(RED) {

    function GroupNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            name: config.name,
			width: config.width,
			order: config.order
        };
    }

    RED.nodes.registerType("ui_group", GroupNode);
};
