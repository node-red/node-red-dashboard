#!/usr/bin/env node

// Patch to fix Font-Awesome urls for loading font
// and to add in fa-sm(all) and fa-xs(extra small) modifiers
var fs = require("fs");
fs.readFile("node_modules/font-awesome/css/font-awesome.css", 'utf8', function (err, file) {
    if (err) { return; }
    else {
        console.log("Fixing up Font-Awesome css");
        var res1 = file.replace(/\?v=4\.7\../g, '');
        var res2 = res1.replace(/\&v=4\.7\../g, '');
        var res3;
        if (res2.indexOf("fa-sm ") === -1) {
            res3 = res2.replace(/fa-lg/, 'fa-sm {font-size:0.875em;}\n.fa-xs {font-size:0.75em;}\n.fa-lg');
        }
        else { res3 = res2; }
        fs.writeFile("node_modules/font-awesome/css/font-awesome.css", res3, 'utf8', function (err) {
            if (err) { console.log("Failed to re-write file."); }
            else {
                console.log("Fixed  up Font-Awesome css");
            }
        });
    }
});

// Google-Material-Font
// Fix relative path of fonts from `./fonts/` to `../fonts/` in css file.
fs.readFile('node_modules/material-design-icons-iconfont/dist/material-design-icons.css', 'utf8', function (err, file) {
    if (err) { return; }
    else {
        console.log('Fixing up Google-Material-Font css');
        const res1 = file
            .replace(/"\.\/fonts\//g, '"../fonts/')
            .replace(/'\.\/fonts\//g, '\'../fonts/');
        fs.writeFile('node_modules/material-design-icons-iconfont/dist/material-design-icons.css', res1, 'utf8', function (err) {
            if (err) {
                console.log('Failed to re-write file.');
            } else {
                console.log('Fixed  up Google-Material-Font css');
            }
        });
    }
});

// Monkeypatch for justgage negative numbers...
// fs.readFile("node_modules/justgage/justgage.js", 'utf8', function (err, file) {
//     if (err) { return; }
//     else {
//         console.log("Fixing up JustGage.js");
//         var res1 = file.replace(/var alpha, Ro, Ri, Cx, Cy, Xo, Yo, Xi, Yi, path;\n\n/, 'var alpha, Ro, Ri, Cx, Cy, Xo, Yo, Xi, Yi, path;\n\tif (min < 0) {max -= min; value -= min; min = 0; }\n\n');
//         var res2 = res1.replace(/value > \(\(max - min\)/g,'value - min > ((max - min)');
//         fs.writeFile("node_modules/justgage/justgage.js", res2, 'utf8', function (err) {
//             if (err) { console.log("Failed to re-write file."); }
//             else {
//                 console.log("Fixed  up JustGage.js");
//             }
//         });
//     }
// });

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
