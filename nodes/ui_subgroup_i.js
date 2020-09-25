module.exports = function(RED) {
    function SubGroupInsNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            name: config.name,
            group: config.group,
            order: config.order,
            subflow: config.subflow,
            subgroup: config.subgroup
        };
    }

    RED.nodes.registerType("ui_subgroup_i", SubGroupInsNode);
};
