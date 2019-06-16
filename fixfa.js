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
        var res2 = res1.replace(/value > \(\(max - min\)/g,'value - min > ((max - min)');
        fs.writeFile("node_modules/justgage/justgage.js", res2, 'utf8', function (err) {
            if (err) { console.log("Failed to re-write file."); }
            else {
                console.log("Fixed  up JustGage.js");
            }
        });
    }
});

// Monkeypatch for colour picker ...
// fs.readFile("node_modules/angularjs-color-picker/dist/angularjs-color-picker.js", 'utf8', function (err, file) {
//     if (err) { return; }
//     else {
//         console.log("Fixing up angularjs-color-picker.js");
//         var res1 = file.replace(/this\.saturation = tmpSaturation \* 100;/,'this.sat = tmpSaturation * 100;\n            this.lightness = 100 - (tmpSaturation * 100);\n            this.saturation = 100;');
//         var res2 = res1.replace(/var px = Math\.cos(angle) \* this\.saturation;/,'var px = Math.cos(angle) * this.sat;');
//         var res3 = res2.replace(/var py = -Math\.sin(angle) \* this\.saturation;/,'var py = -Math.sin(angle) * this.sat;');
//         var res4 = res3.replace(/background\.s = '0%';/,'background = "#ffffff";');
//
//         fs.writeFile("node_modules/angularjs-color-picker/dist/angularjs-color-picker.js", res4, 'utf8', function (err) {
//             if (err) { console.log("Failed to re-write file."); }
//             else {
//                 console.log("Fixed  up angularjs-color-picker.js");
//             }
//         });
//     }
// });
