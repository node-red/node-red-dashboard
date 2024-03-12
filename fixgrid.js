#!/usr/bin/env node

var fs = require("fs");

// Remove jquery old versions from gridstack dist
try { fs.unlinkSync('node_modules/gridstack/dist/jquery-ui.js'); }
catch(e) { console.log("unable to delete jquery-ui.js") };
try { fs.unlinkSync('node_modules/gridstack/dist/jquery-ui.min.js');}
catch(e) { console.log("unable to delete jquery-ui.min.js") };
try { fs.unlinkSync('node_modules/gridstack/dist/jquery.js'); }
catch(e) { console.log("unable to delete jquery.js") };
try { fs.unlinkSync('node_modules/gridstack/dist/jquery.min.js'); }
catch(e) { console.log("unable to delete jquery.min.js") };