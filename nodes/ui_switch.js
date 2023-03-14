module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function validateSwitchValue(node,property,type,payload) {
        if (payloadType === 'flow' || payloadType === 'global') {
            try {
                var parts = RED.util.normalisePropertyExpression(payload);
                if (parts.length === '') {
                    throw new Error();
                }
            } catch(err) {
                node.warn("Invalid payload property expression - defaulting to node id")
                payload = node.id;
                payloadType = 'str';
            }
        }
        else {
            payload = payload || node.id;
        }
    }
    function SwitchNode(config) {
        RED.nodes.createNode(this, config);
        this.pt = config.passthru;
        this.state = ["off"," "];
        this.decouple = (config.decouple === "true") ? false : true;
        var node = this;
        node.status({});

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        var parts;
        var onvalue = config.onvalue;
        var onvalueType = config.onvalueType;
        if (onvalueType === 'flow' || onvalueType === 'global') {
            try {
                parts = RED.util.normalisePropertyExpression(onvalue);
                if (parts.length === 0) {
                    throw new Error();
                }
            } catch(err) {
                node.warn("Invalid onvalue property expression - defaulting to true")
                onvalue = true;
                onvalueType = 'bool';
            }
        }
        var offvalue = config.offvalue;
        var offvalueType = config.offvalueType;
        if (offvalueType === 'flow' || offvalueType === 'global') {
            try {
                parts = RED.util.normalisePropertyExpression(offvalue);
                if (parts.length === 0) {
                    throw new Error();
                }
            } catch(err) {
                node.warn("Invalid offvalue property expression - defaulting to false")
                offvalue = false;
                offvalueType = 'bool';
            }
        }

        node.on("input", function(msg) {
            node.topi = msg.topic;
        });

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            emitOnlyNewValues: false,
            forwardInputMessages: config.passthru,
            storeFrontEndInputAsState: (config.decouple === "true") ? false : true, //config.passthru,
            state: false,
            control: {
                type: 'switch' + (config.style ? '-' + config.style : ''),
                label: config.label,
                tooltip: config.tooltip,
                order: config.order,
                value: false,
                onicon: config.onicon,
                officon: config.officon,
                oncolor: config.oncolor,
                offcolor: config.offcolor,
                animate: config.animate?"flip-icon":"",
                width: config.width || group.config.width || 6,
                height: config.height || 1,
                className: config.className || '',
            },
            convert: function (payload, oldval, msg) {
                var myOnValue,myOffValue;

                if (onvalueType === "date") { myOnValue = Date.now(); }
                else { myOnValue = RED.util.evaluateNodeProperty(onvalue,onvalueType,node); }

                if (offvalueType === "date") { myOffValue = Date.now(); }
                else { myOffValue = RED.util.evaluateNodeProperty(offvalue,offvalueType,node); }

                if (!this.forwardInputMessages && this.storeFrontEndInputAsState) {
                    if (myOnValue === oldval) { return true; }
                    if (oldval === true) { return true; }
                    else { return false; }
                }

                if (RED.util.compareObjects(myOnValue,msg.payload)) { node.state[0] = "on"; return true; }
                else if (RED.util.compareObjects(myOffValue,msg.payload)) { node.state[0] = "off"; return false; }
                else { return oldval; }
            },
            convertBack: function (value) {
                node.state[1] = value?"on":"off";
                if (node.pt) {
                    node.status({fill:(value?"green":"red"),shape:(value?"dot":"ring"),text:value?"on":"off"});
                }
                else {
                    var col = (node.decouple) ? ((node.state[1]=="on")?"green":"red") : ((node.state[0]=="on")?"green":"red");
                    var shp = (node.decouple) ? ((node.state[1]=="on")?"dot":"ring") : ((node.state[0]=="on")?"dot":"ring");
                    var txt = (node.decouple) ? (node.state[0] +" | "+node.state[1].toUpperCase()) : (node.state[0].toUpperCase() +" | "+node.state[1])
                    node.status({fill:col, shape:shp, text:txt});
                }
                var payload = value ? onvalue : offvalue;
                var payloadType = value ? onvalueType : offvalueType;

                if (payloadType === "date") { value = Date.now(); }
                else {
                    try {
                        value = RED.util.evaluateNodeProperty(payload,payloadType,node);
                    }
                    catch(e) {
                        if (payloadType === "bin") { node.error("Badly formatted buffer"); }
                        else { node.error(e,payload); }
                    }
                }
                return value;
            },
            beforeSend: function (msg) {
                var t = undefined;
                try {
                    t = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg) || node.topi;
                }
                catch(e) { }
                if (t !== undefined) { msg.topic = t; }
            }
        });

        if (!node.pt) {
            node.on("input", function() {
                var col = (node.state[0]=="on") ? "green" : "red";
                var shp = (node.state[0]=="on") ? "dot" : "ring";
                var txt = (node.decouple) ? (node.state[0] +" | "+node.state[1].toUpperCase()) : (node.state[0].toUpperCase() +" | "+node.state[1])
                node.status({fill:col, shape:shp, text:txt});
            });
        }

        node.on("close", done);
    }
    RED.nodes.registerType("ui_switch", SwitchNode);
};
