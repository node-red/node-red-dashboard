module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function ButtonRowNode(config) {
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
                type: 'button-row',
                order: config.order,
                value: {},
                toggle: config.toggle,
                buttons: config.buttons
            },
            beforeSend: function (msg) {
                msg.topic = config.topic;
            }, 
            convert: function(value, oldValue) {
                if (!oldValue) oldValue = {};
                
                switch (typeof value) {
                    case 'object':
                        for (var key in value)
                            oldValue[key] = value[key];
                        break;
                    case 'string':
                        oldValue[value] = !oldValue[value];
                        break;
                }
                
                return oldValue;
            }
        });
        
        node.on("close", done);
    }

    RED.nodes.registerType("ui_button_row", ButtonRowNode);
};