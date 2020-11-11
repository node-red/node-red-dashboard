module.exports = function(RED) {
    function SubGroupNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            name: config.name,
            widgetOrder: config.order,
            width: config.width,
            height: config.height,
            subflow: config.subflow
        };
    }

    RED.nodes.registerType("ui_subgroup_t", SubGroupNode);
};
