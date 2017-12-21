module.exports = function (RED) {
    var ui = require('../ui')(RED);
    var formidable = require('formidable');
    var fs = require('fs');
    var path = require('path');
    var mkdirp = require('mkdirp');

    function ImageNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var pathDir = path.join(process.cwd(), "public", "uiimage", "upload");

        ///------> Upload Files
        RED.httpAdmin.post('/uiimage', (req, res) => {

            var form = new formidable.IncomingForm();

            form.parse(req, function (err, fields, files) {

                var category = fields['category'];
                var extensao = path.extname(files[0].name);

                if (extensao != '.jpg' && extensao != '.png' && extensao != '.jpeg') {
                    res.status(400).send("Incompatible file").end();
                    return;
                }

                let pathBase = pathDir;

                var oldpath = files[0].path;

                var newpath = path.join(pathBase, files[0].name);

                var pathCategory = false;

                if(category != 'Uncategorized' && category != null && category != ''){

                    pathBase = path.join(pathBase, category);

                    newpath = path.join(pathBase, files[0].name);
                    pathCategory = true;
                }

                mkdirp(pathBase, (err) => {
                    if(err){
                        console.log("ERROR - mk: ", err);
                        res.status(500).end();
                        return;
                    }

                    fs.rename(oldpath, newpath, function (err) {
                        if (err) {
                            console.log("ERROR: ", err);
                            res.status(500).end();
                            return;
                        }
    
                        var pathExtern = path.join("/", "uiimage", "upload", files[0].name);
    
                        if(pathCategory){
                            pathExtern = path.join("/", "uiimage", "upload", category, files[0].name);
                        }
    
                        res.status(201).send(pathExtern).end();
                    });
                });
            });
        });


        RED.httpAdmin.get("/uiimage", (req, res) => {

            fs.readdir(pathDir, 'utf-8', (err, files) => {
                if (err) {
                    res.status(500).end();
                    return;
                }

                var response = [];
                var listUncategorized = [];

                var numFiles = files.length;

                files.forEach(file => {

                    var dirFile = path.join(pathDir, file);

                    fs.stat(dirFile, (err, stat) => {
                        if (err) {
                            return;
                        }

                        if (stat.isDirectory()) {

                            var category = file;

                            fs.readdir(dirFile, 'utf-8', (err, itens) => {

                                if (err) {
                                    res.status(500).end();
                                    return;
                                }

                                var listItens = [];

                                var numFilesSub = itens.length;

                                itens.forEach(item => {

                                    listItens.push(item);

                                    numFilesSub--;

                                    if (numFilesSub === 0) {
                                        let obj = {
                                            name: category,
                                            list: listItens
                                        };
                                        response.push(obj);

                                        numFiles--;

                                        if (numFiles === 0) {
                                            let obj = {
                                                name: "Uncategorized",
                                                list: listUncategorized
                                            };
                                            response.push(obj);

                                            res.status(200).send(response).end();
                                        }
                                    }
                                });
                            });

                            return;
                        }

                        listUncategorized.push(file);

                        numFiles--;

                        if (numFiles === 0) {
                            let obj = {
                                name: "Uncategorized",
                                list: listUncategorized
                            };
                            response.push(obj);

                            res.status(200).send(response).end();
                        }

                    });
                });

            });

        });


        RED.httpAdmin.get("/uiimage/:category/:id", (req, res) => {

            let pathBase = path.join('uiimage', 'upload');
            let id = req.params.id;
            let category = req.params.category;

            let pathFile = path.join(pathDir, id);

            if (category == 'Uncategorized') {

                fs.access(pathFile, (err) => {
                    if (err) {
                        res.status(404).end();
                        return;
                    }

                    res.status(200).send(path.join(pathBase, id)).end();
                });

                return;
            }

            pathFile = path.join(pathDir, category, id);

            fs.access(pathFile, (err) => {
                if (err) {
                    res.status(404).end();
                    return;
                }

                res.status(200).send(path.join(pathBase, category, id)).end();
            });

        });
        ///------> Upload Files





        var group = RED.nodes.getNode(config.group);
        if (!group && config.templateScope !== 'global') {
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

        var image = "<div style=\"width: 100%; height: 100%; background-image: url('" + config.path + "');";

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
            forwardInputMessages: config.fwdInMessages,
            storeFrontEndInputAsState: config.storeOutMessages,
            emitOnlyNewValues: false,
            node: node,
            tab: tab,
            group: group,
            control: {
                type: 'template',
                order: config.order,
                width: config.width || 6,
                height: hei,
                format: image, //config.format,
                templateScope: config.templateScope,
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
    RED.library.register("uiimage");
};