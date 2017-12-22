const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

function listFilesDir(pathDir, cb) {

    let callbackDone = false;

    function doCallback(err, data) {
        if (callbackDone) return;
        callbackDone = true;
        cb(err, data);
    }

    let image = [];

    fs.readdir(pathDir, 'utf-8', (err, files) => {

        if (err) {
            doCallback(err, null);
            return;
        }

        let countFiles = files.length;

        files.forEach(file => {

            fs.stat(path.join(pathDir, file), (err, stat) => {

                if (err) {
                    doCallback(err, null);
                    return;
                }

                if (stat.isDirectory()) {
                    countFiles--;

                    if (countFiles === 0) {
                        doCallback(null, image);
                    }

                    return;
                }

                image.push(file);

                countFiles--;

                if (countFiles === 0) {
                    doCallback(null, image);
                }

            });
        });
    });
}

class FileInterface {

    constructor() {
        this.pathDir = path.join(process.cwd(), "public", "uiimage", "upload");
    }

    saveFile(params, cb) {

        let callbackDone = false;

        function doCallback(err, data) {
            if (callbackDone) return;
            callbackDone = true;
            cb(err, data);
        }

        let category = params.category;
        let extension = path.extname(params.name);

        if (extension != '.jpg' && extension != '.png' && extension != '.jpeg') {
            var obj = {
                message: 'incompatible file',
                cod: 400
            };
            doCallback(obj, null);
            return;
        }

        let pathBase = this.pathDir;
        let oldpath = params.path;
        let newpath = path.join(pathBase, params.name);
        let pathCategory = false;

        if (category != 'Uncategorized' && category != null && category != '') {
            pathBase = path.join(pathBase, category);
            newpath = path.join(pathBase, params.name);
            pathCategory = true;
        }

        mkdirp(pathBase, (err) => {
            if (err) {
                var obj = {
                    message: err,
                    cod: 500
                };
                doCallback(obj, null);
                return;
            }

            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    var obj = {
                        message: err,
                        cod: 500
                    };
                    doCallback(obj, null);
                    return;
                }

                let pathExtern = path.join("/", "uiimage", "upload", params.name);
                let reference = "Uncategorized/" + params.name;

                if (pathCategory) {
                    pathExtern = path.join("/", "uiimage", "upload", category, params.name);
                    reference = category + "/" + params.name;
                }

                var obj = {
                    path: pathExtern,
                    ref: reference
                };

                doCallback(null, {
                    object: obj,
                    cod: 201
                });
            });
        });
    } //--> SaveFile

    getFiles(cb) {

        let callbackDone = false;

        function doCallback(err, data) {
            if (callbackDone) return;
            callbackDone = true;
            cb(err, data);
        }

        fs.readdir(this.pathDir, 'utf-8', (err, files) => {

            if (err) {
                let obj = {
                    message: err,
                    cod: 500
                };
                doCallback(obj, null);
                return;
            }

            var response = [];
            var listCategory = [];
            var listUncategorized = [];

            var numFiles = files.length;

            listCategory.push("Uncategorized");

            files.forEach(file => {

                var dirFile = path.join(this.pathDir, file);

                fs.stat(dirFile, (err, stat) => {
                    if (err) {
                        return;
                    }

                    if (stat.isDirectory()) {

                        var category = file;
                        listCategory.push(category);

                        listFilesDir(dirFile, (err, files) => {
                            if (err) {
                                let obj = {
                                    message: err,
                                    cod: 500
                                };
                                doCallback(obj, null);
                                return;
                            }

                            let obj = {
                                name: category,
                                list: files
                            };
                            response.push(obj);

                            numFiles--;

                            if (numFiles === 0) {
                                let obj = {
                                    name: "Uncategorized",
                                    list: listUncategorized
                                };
                                response.push(obj);

                                doCallback(null, {
                                    object: response,
                                    listCat: listCategory,
                                    cod: 200
                                });
                            }

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

                        doCallback(null, {
                            object: response,
                            listCat: listCategory,
                            cod: 200
                        });
                    }
                });
            });
        });
    } //--> getFiles

    getFile(params, cb) {

        let callbackDone = false;

        function doCallback(err, data) {
            if (callbackDone) return;
            callbackDone = true;
            cb(err, data);
        }

        let pathBase = path.join('/', 'uiimage', 'upload');
        let id = params.id;
        let category = params.category;
        let pathFile = path.join(this.pathDir, id);

        if (category == 'Uncategorized') {

            fs.access(pathFile, (err) => {
                if (err) {
                    let obj = {
                        message: err,
                        cod: 404
                    };
                    doCallback(obj, null);
                    return;
                }

                let obj = {
                    path: path.join(pathBase, id),
                    ref: "Uncategorized/" + id
                };

                doCallback(null, {
                    object: obj,
                    cod: 200
                });
            });

            return;
        }

        pathFile = path.join(this.pathDir, category, id);

        fs.access(pathFile, (err) => {
            if (err) {
                let obj = {
                    message: err,
                    cod: 404
                };
                doCallback(obj, null);
                return;
            }

            let obj = {
                path: path.join(pathBase, category, id),
                ref: category + "/" + id
            };

            doCallback(null, {
                object: obj,
                cod: 200
            });
        });
    } //--> getFile
}
module.exports = FileInterface;