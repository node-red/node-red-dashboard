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

// GridStack layout css patches for sass
fs.readFile('src/gridstack-extra.scss', 'utf8', function (err, file) {
    if (err) { return; }
    else {
        console.log('Fixing up GridStack scss');
        const res1 = file
            .replace(/ \(100% \/ \$columns\)/g, ' calc(100% \/ \$columns)')
        fs.writeFile('src/gridstack-extra.scss', res1, 'utf8', function (err) {
            if (err) {
                console.log('Failed to re-write file.');
            } else {
                console.log('Fixed  up GridStack scss');
            }
        });
    }
});
