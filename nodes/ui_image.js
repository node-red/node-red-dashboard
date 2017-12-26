module.exports = function (RED) {
    var ui = require('../ui')(RED);
    var formidable = require('formidable');
    var fs = require('fs');
    var path = require('path');
    var mkdirp = require('mkdirp');
    var FileInterface = require('../src/images/FileInterface');

    function ImageNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var fileInterface = new FileInterface();

        var pathDir = path.join(process.cwd(), "public", "uiimage", "upload");

        ///------> API

        RED.httpAdmin.post('/uiimage', (req, res) => {

            var form = new formidable.IncomingForm();

            form.parse(req, function (err, fields, files) {

                var params = {
                    category: fields['category'],
                    name: files[0].name,
                    path: files[0].path
                };

                fileInterface.saveFile(params, (err, result) => {
                    if (err) {
                        res.status(err.cod).send(err).end();
                        return;
                    }
                    res.status(result.cod).send(result.object).end();
                });

            });
        }); //--> POST /uiimage

        RED.httpAdmin.get("/uiimage", (req, res) => {
            fileInterface.getFiles((err, result) => {
                if (err) {
                    res.status(err.cod).send(err).end();
                    return;
                }
                res.status(result.cod).send(result).end();
            });
        }); //--> GET /uiimage

        RED.httpAdmin.get("/uiimage/:category/:id", (req, res) => {

            let params = {
                id: req.params.id,
                category: req.params.category
            };

            fileInterface.getFile(params, (err, result) => {
                if (err) {
                    res.status(err.cod).send(err).end();
                    return;
                }
                res.status(result.cod).send(result.object).end();
            });
        }); //--> GET /uiimage/'category'/'id'

        RED.httpAdmin.delete("/uiimage/:category/:id", (req, res) => {

            let params = {
                id: req.params.id,
                category: req.params.category
            };

            fileInterface.deleteFile(params, (err, result) => {
                if (err) {
                    res.status(err.cod).send(err).end();
                    return;
                }

                res.status(result.cod).end();

            });

        }); //--> DELETE /uiimage/'category'/'id'

        ///------> API

        // console.log("----->> CONFIG: ", config);

        var group = RED.nodes.getNode(config.group);

        if (!group) {
            return;
        }

        var tab = null;

        if (config.templateScope !== 'global') {
            tab = RED.nodes.getNode(group.config.tab);
            if (!tab) {
                return;
            }
            if (!config.width) {
                config.width = group.config.width;
            }
        }

        var hei = Number(config.height || 0);
        var previousTemplate = null

        //--> Lado a Lado - background-repeat: repeat
        //--> Ajustar (Centralizar imagem Inteira) - background-position: center
        //--> Centralizar (centro da imagem) - background-size: 100%; + background-position: center;
        //--> Ampliar (estica a imagem) - size = cover

        var image = "<div style=\"width: 100%; height: 100%; background-image: url('" + config.path.path + "');";

        if (config.layout === 'adjust') {
            image += "background-size: contain; background-position: center; background-repeat: no-repeat\" > </div>"
        }

        if (config.layout === 'center') {
            image += "background-size: 100%; background-position: center; background-repeat: no-repeat\" > </div>"
        }

        if (config.layout === 'expand') {
            image += "background-size: cover; background-position: center; background-repeat: no-repeat\" > </div>"
        }

        if (config.layout === 'side') {
            image += "background-repeat: repeat\" > </div>"
        }

        var done = ui.add({
            emitOnlyNewValues: false,
            node: node,
            tab: tab,
            group: group,
            control: {
                type: 'template',
                width: config.width || 6,
                height: hei,
                format: image, //config.format,
            },
            beforeEmit: function (msg, value) {
                var properties = Object.getOwnPropertyNames(msg).filter(function (p) {
                    return p[0] != '_';
                });
                var clonedMsg = {
                    templateScope: config.templateScope
                };
                for (var i = 0; i < properties.length; i++) {
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

                if (clonedMsg.template) {
                    previousTemplate = clonedMsg.template
                }

                return {
                    msg: clonedMsg
                };
            },
            beforeSend: function (msg, original) {
                if (original) {
                    return original.msg;
                }
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_image", ImageNode);
};