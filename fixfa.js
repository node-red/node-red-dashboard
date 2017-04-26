
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
