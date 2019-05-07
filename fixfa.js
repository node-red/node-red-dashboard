#!/usr/bin/env node

var fs = require("fs");
fs.readFile("node_modules/font-awesome/css/font-awesome.css", 'utf8', function (err, file) {
    if (err) { return; }
    else {
        console.log("Fixing up Font-Awesome css");
        var res1 = file.replace(/\?v=4\.7\../g, '');
        var res2 = res1.replace(/\&v=4\.7\../g, '');
        fs.writeFile("node_modules/font-awesome/css/font-awesome.css", res2, 'utf8', function (err) {
            if (err) { console.log("Failed to re-write file."); }
            else {
                console.log("Fixed  up Font-Awesome css");
            }
        });
    }
});

// Monkeypatch for justgage negative numbers...
fs.readFile("node_modules/justgage/justgage.js", 'utf8', function (err, file) {
    if (err) { return; }
    else {
        console.log("Fixing up JustGage.js");
        var res1 = file.replace(/var alpha, Ro, Ri, Cx, Cy, Xo, Yo, Xi, Yi, path;\n\n/, 'var alpha, Ro, Ri, Cx, Cy, Xo, Yo, Xi, Yi, path;\n\tif (min < 0) {max -= min; value -= min; min = 0; }\n\n');
        fs.writeFile("node_modules/justgage/justgage.js", res1, 'utf8', function (err) {
            if (err) { console.log("Failed to re-write file."); }
            else {
                console.log("Fixed  up JustGage.js");
            }
        });
    }
});

// Monkeypatch for colour picker ...
fs.readFile("node_modules/angularjs-color-picker/dist/angularjs-color-picker.js", 'utf8', function (err, file) {
    if (err) { return; }
    else {
        console.log("Fixing up angularjs-color-picker.js");
        var res1 = file.replace(/this\.saturation = tmpSaturation \* 100;/,'this.lightness = 100 - (tmpSaturation * 100)/2;\n            this.saturation = 100;');
        fs.writeFile("node_modules/angularjs-color-picker/dist/angularjs-color-picker.js", res1, 'utf8', function (err) {
            if (err) { console.log("Failed to re-write file."); }
            else {
                console.log("Fixed  up angularjs-color-picker.js");
            }
        });
    }
});
