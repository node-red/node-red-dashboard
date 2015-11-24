module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function TextNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;
        
        var done = ui.add({
            emitOnlyNewValues: false,
            node: node, 
            tab: tab, 
            group: config.group, 
            control: {
                type: 'text',
                label: config.name,
                order: config.order,
                format: config.format
            },
            beforeEmit: function(msg, value) {
                var properties = Object.getOwnPropertyNames(msg).filter(function (p) {return p[0] != '_';});
                var clonedMsg = { };
                
                for (var i=0; i<properties.length; i++) {
                    var property = properties[i];
                    clonedMsg[property] = msg[property];
                }
                
                return { msg: clonedMsg };
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_text", TextNode);
};