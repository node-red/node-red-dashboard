module.exports = function(RED) {

    function GroupNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            name: config.name
        };
    }

    RED.nodes.registerType("ui_group", GroupNode);
};
