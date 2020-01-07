
var
    exec = require('child_process').exec,
    fs = require('fs'),
    gulp = require("gulp"),
    templateCache = require('gulp-angular-templatecache'),
    minifyCss = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    concatCss = require('gulp-concat-css'),
    debug = require('gulp-debug'),
    eol = require('gulp-eol'),
    header = require("gulp-header"),
    htmlreplace = require('gulp-html-replace'),
    ghtmlSrc = require('gulp-html-src'),
    minifyHTML = require('gulp-htmlmin'),
    gulpif = require('gulp-if'),
    gjscs = require('gulp-jscs'),
    jshint = require('gulp-jshint'),
    gmanifest = require('gulp-manifest3'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    gutil = require('gulp-util'),
    path = require('path'),
    streamqueue = require('streamqueue');

var vendorPrefix = "vendor/";
function getFileName(attr, node) {
    var file = node.attr(attr);
    if (file.indexOf(vendorPrefix) === 0) {
        file = path.join("..", "node_modules", file.substr(vendorPrefix.length));
    }
    return file;
}

function fixup() {
    return exec('node fixfa.js', function (err, stdout, stderr) {
        if (err) {
            console.log(stdout);
            console.log(stderr);
        }
    });
}

function lint() {
    return gulp.src('**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
}

function jscs() {
    return gulp.src(['*.js','nodes/*.js','src/*.js','src/*/*.js','src/*/*/*.js'])
        .pipe(gjscs())
        .pipe(gjscs.reporter("inline"))
}

function icon() {
    // gulp.src('src/wheel.png').pipe(gulp.dest('dist/css/'));
    gulp.src('src/icon192x192.png').pipe(gulp.dest('dist/'));
    gulp.src('src/icon120x120.png').pipe(gulp.dest('dist/'));
    return gulp.src('src/icon64x64.png').pipe(gulp.dest('dist/'));
}

function js() {
    var scripts = gulp.src('src/index.html')
        .pipe(ghtmlSrc({getFileName:getFileName.bind(this, 'src')}));

    var templates = gulp.src(['src/**/*.html', '!src/index.html'])
        .pipe(minifyHTML({collapseWhitespace:true, conservativeCollapse:true}))
        .pipe(templateCache('templates.js', {root:'', module:'ui'}))
        .pipe(replace('put(\'/', 'put(\''));

    gulp.src('node_modules/tinycolor2/dist/tinycolor-min.js')
        .pipe(eol('\n'))
        .pipe(gulp.dest('./dist/js'));

    gulp.src('src/i18n.js')
        .pipe(eol('\n'))
        .pipe(gulp.dest('dist/'));

    return streamqueue({ objectMode:true }, scripts, templates)
        .pipe(gulpif(/[.]min[.]js$/, gutil.noop(), uglify()))
        .pipe(concat('app.min.js'))
        .pipe(header(fs.readFileSync('license.js')))
        .pipe(eol('\n'))
        .pipe(gulp.dest('dist/js/'));
}

function css() {
    exec('node fixfa.js', function (err, stdout, stderr) {
        if (err) {
            console.log(stdout);
            console.log(stderr);
        }
    });
    return gulp.src('src/index.html')
        .pipe(ghtmlSrc({getFileName:getFileName.bind(this, 'href'), presets:'css'}))
        .pipe(concatCss('app.min.css',{rebaseUrls:false}))
        .pipe(header(fs.readFileSync('license.js')))
        .pipe(eol('\n'))
        .pipe(gulp.dest('dist/css/'));
}

function less() {
    return gulp.src(['src/*.less'])
        .pipe(concat('app.min.less'))
        .pipe(header(fs.readFileSync('license.js')))
        .pipe(eol('\n'))
        .pipe(gulp.dest('./dist/css'));
}

function index() {
    return gulp.src('src/index.html')
        .pipe(htmlreplace({
            'css': 'css/app.min.css',
            'js': 'js/app.min.js',
            'less': '<link rel="stylesheet/less" href="css/app.min.less" />'
        }))
        .pipe(minifyHTML({collapseWhitespace:true, conservativeCollapse:true}))
        .pipe(eol('\n'))
        .pipe(gulp.dest('dist/'));
}

function fonts() {
    //return gulp.src('node_modules/font-awesome/fonts/*').pipe(gulp.dest('dist/fonts/'));
    gulp.src('node_modules/font-awesome/fonts/fontawesome-webfont.woff').pipe(gulp.dest('dist/fonts/'));
    gulp.src('node_modules/material-design-icons-iconfont/dist/fonts/MaterialIcons-Regular.woff').pipe(gulp.dest('dist/fonts/'));
    gulp.src('node_modules/weather-icons-lite/fonts/weather-icons-lite.woff').pipe(gulp.dest('dist/fonts/'));
    gulp.src('node_modules/font-awesome/fonts/fontawesome-webfont.woff2').pipe(gulp.dest('dist/fonts/'));
    gulp.src('node_modules/material-design-icons-iconfont/dist/fonts/MaterialIcons-Regular.woff2').pipe(gulp.dest('dist/fonts/'));
    return gulp.src('node_modules/weather-icons-lite/fonts/weather-icons-lite.woff2').pipe(gulp.dest('dist/fonts/'));
}

function gridstack() {
    gulp.src('node_modules/gridstack/dist/gridstack.min.css').pipe(gulp.dest('dist/css/'));
    gulp.src('node_modules/gridstack/dist/gridstack.jQueryUI.min.js').pipe(gulp.dest('dist/js/'));
    gulp.src('node_modules/gridstack/dist/gridstack.min.js').pipe(gulp.dest('dist/js/'));
    gulp.src('node_modules/gridstack/dist/gridstack.min.map').pipe(gulp.dest('dist/js/'));
    gulp.src('node_modules/lodash/lodash.min.js').pipe(gulp.dest('dist/js/'));
    return gulp.src('node_modules/gridstack/src/gridstack-extra.scss')
        .pipe(replace('$gridstack-columns: 12 !default;','$gridstack-columns: 30;'))
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('dist/css'))
}

function manifest() {
    return gulp.src(['dist/*','dist/css/*','dist/js/*','dist/fonts/*'], { base:'dist/' })
        .pipe(gmanifest({
            hash: true,
            //preferOnline: true,
            network: ['*'],
            filename: 'dashboard.appcache',
            // exclude: 'dashboard.appcache'
            exclude: ['dashboard.appcache','index.html']
        }))
        .pipe(replace('tinycolor-min.js', 'tinycolor-min.js\nsocket.io/socket.io.js'))
        .pipe(eol('\n'))
        .pipe(gulp.dest('dist/'));
}


exports.lint = lint;
exports.default = gulp.series(fixup, jscs, icon, js, css, less, index, fonts, gridstack, manifest);
// need to add back in css.