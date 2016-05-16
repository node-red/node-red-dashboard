module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function TemplateNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        var tab = RED.nodes.getNode(config.tab);
        var group = RED.nodes.getNode(config.group);
        if (!tab || !group) return;
        
        var done = ui.add({
            forwardInputMessages: config.fwdInMessages,
            storeFrontEndInputAsState: config.storeOutMessages,
            emitOnlyNewValues: false,
            node: node, 
            tab: tab, 
            group: group,
            control: {
                type: 'template',
                order: config.order,
                format: config.format,
		width: config.width || 3,
		height: config.height || 1
            },
            beforeEmit: function(msg, value) {
                var properties = Object.getOwnPropertyNames(msg).filter(function (p) {return p[0] != '_';});
                var clonedMsg = { };
                
                for (var i=0; i<properties.length; i++) {
                    var property = properties[i];
                    clonedMsg[property] = msg[property];
                }
                
                return { msg: clonedMsg };
            },
            beforeSend: function (msg, original) {
                if (original)
                    return original.msg;
            }
        });
       
         node.on("close", done);
    }

    RED.nodes.registerType("ui_template", TemplateNode);
    RED.library.register("uitemplates");
};
