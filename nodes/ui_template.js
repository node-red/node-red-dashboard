module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function TemplateNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        //Needed for settings.js ui : disableFeedbackToAllSessions is true then create new Map
        const socketIdVsHeaders = new Map();
        var disableFeedbackToAllSessions = false;
        if (RED.settings.hasOwnProperty("ui") && RED.settings.ui.hasOwnProperty("disableFeedbackToAllSessions") && RED.settings.ui.disableFeedbackToAllSessions == true) {
            disableFeedbackToAllSessions = true;
        }
        var group = RED.nodes.getNode(config.group);
        if (!group && config.templateScope !== 'global') { return; }
        var tab = null;
        if (config.templateScope !== 'global') {
            tab = RED.nodes.getNode(group.config.tab);
            if (!tab) { return; }
            if (!config.width) {
                config.width = group.config.width;
            }
        }
        var hei = Number(config.height|| 0);
        var previousTemplate = null
        var theme = ui.getTheme();
        var colortheme = {};
        for (var i in theme) {
            if (theme.hasOwnProperty(i)) {
                colortheme[i.replace(/-/g, "_")] = theme[i].value;
            }
        }

        var done = ui.add({
            forwardInputMessages: config.fwdInMessages,
            storeFrontEndInputAsState: config.storeOutMessages,
            persistantFrontEndValue: config.resendOnRefresh,
            emitOnlyNewValues: false,
            node: node,
            tab: tab,
            group: group,
            control: {
                type: 'template',
                order: config.order,
                width: config.width || 6,
                height: hei,
                format: config.format,
                templateScope: config.templateScope,
                theme: colortheme,
                className: config.className || '',
            },
            beforeEmit: function(msg) {
                var properties = Object.getOwnPropertyNames(msg).filter(function (p) { return p[0] != '_'; });
                var clonedMsg = {
                    templateScope: config.templateScope
                };
                for (var i=0; i<properties.length; i++) {
                    var property = properties[i];
                    clonedMsg[property] = msg[property];
                }

                // transform to string if msg.template is buffer
                if (clonedMsg.template !== undefined && Buffer.isBuffer(clonedMsg.template)) {
                    clonedMsg.template = clonedMsg.template.toString();
                }

                if (clonedMsg.template === undefined && previousTemplate !== null) {
                    clonedMsg.template = previousTemplate;
                }

                //This updates the whole page if the template input changes and
                //height set to auto - performance killer, but here just in case
                // if ((config.height == "0") && (value !== node.oldvalue)) {
                //     node.oldvalue = value;
                //     setImmediate(function() { ui.updateUi(); });
                // }

                if (clonedMsg.template) {
                    previousTemplate = clonedMsg.template
                }

                return { msg:clonedMsg };
            },

            beforeSend: function (msg, original) {
                if (disableFeedbackToAllSessions === false) {
                    if (original && original.hasOwnProperty("msg") && original.msg !== null) {
                        var om = original.msg;
                        om.socketid = original.socketid;
                        return om;
                    }
                }
                if (disableFeedbackToAllSessions === true) {
                    if (original && original.hasOwnProperty("msg") && original.msg !== null) {
                        const headers = socketIdVsHeaders.get(original.socketid);
                        //clean up map, the max size is over 16million entires (16,777,216 1GB of ram) but a user might have a pi with 256MB
                        // so shoot for 0.5million(32MB) If they have more than 0.5million users on at the same time IT SHOULD NOT BE ON DASHBOARD
                        const mapSize = socketIdVsHeaders.size;
                        if (mapSize > 500000) {
                            var i = 0;
                            for (var key of socketIdVsHeaders.keys()) {
                                if (i++ > 100000) { //delete the first(oldest) 100,000 socketid's. Why so many at a time .... expensive to get the 500,000 keys just to delete a few.
                                    break;
                                }
                                socketIdVsHeaders.delete(key);
                            }
                        }
                        var om = original.msg;
                        if (om.socketid) {
                            om.socketid = original.socketid;
                        }
                        if (headers) {
                            om.headers = headers;
                        }
                        return om;
                    }
                }
            }
        });
        node.on("close", done);

        if (disableFeedbackToAllSessions === true) {
            var sendconnect = function(socketid, socketip, headers, queryParams) {
                if (socketid && headers) {
                    socketIdVsHeaders.set(socketid, headers);
                }
                node.send({
                    session:{
                        state: "connect"
                    },
                    socketid,
                    socketip,
                    headers
                });
            };
            ui.ev.on('newsocket', sendconnect);
            var sendlost = function(socketid, socketip, headers, queryParams) {
                if (socketid) {
                    socketIdVsHeaders.delete(socketid);
                }
                node.send({
                    session:{
                        state: "disconnect"
                    },
                    socketid,
                    socketip,
                    headers
                });
            };
            ui.ev.on('endsocket', sendlost);
            this.on('close', function() {
                ui.ev.removeListener('newsocket', sendconnect);
                ui.ev.removeListener('endsocket', sendlost);
            })
        }
    }
    RED.nodes.registerType("ui_template", TemplateNode);
    RED.library.register("uitemplates");
};
