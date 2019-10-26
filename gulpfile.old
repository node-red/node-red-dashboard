
var
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    eol = require('gulp-eol'),
    exec = require('child_process').exec,
    fs = require('fs'),
    ghtmlSrc = require('gulp-html-src'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    header = require("gulp-header"),
    htmlreplace = require('gulp-html-replace'),
    jscs = require('gulp-jscs'),
    jshint = require('gulp-jshint'),
    manifest = require('gulp-manifest'),
    minifyCss = require('gulp-clean-css'),
    minifyHTML = require('gulp-htmlmin'),
    path = require('path'),
    replace = require('gulp-replace'),
    streamqueue = require('streamqueue'),
    templateCache = require('gulp-angular-templatecache'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename');

//gulp.task('default', ['manifest']);
gulp.task('default', ['lint','jscs'], function() {
    gulp.start('manifest');
    //gulp.start('build');
});

gulp.task('build', ['icon', 'js', 'css', 'less', 'index', 'fonts', 'gridstack']);

gulp.task('manifest', ['build'], function() {
    gulp.src(['dist/*','dist/css/*','dist/js/*','dist/fonts/*'], { base: 'dist/' })
    .pipe(manifest({
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
});

gulp.task('lint', function() {
    return gulp.src('**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jscs', function() {
    return gulp.src(['*.js','nodes/*.js','src/*.js','src/*/*.js','src/*/*/*.js'])
        .pipe(jscs())
        //.pipe(jscs({fix: true}))
        .pipe(jscs.reporter("inline"))
});

gulp.task('index', function() {
    return gulp.src('src/index.html')
    .pipe(htmlreplace({
        'css': 'css/app.min.css',
        'js': 'js/app.min.js',
        'less': '<link rel="stylesheet/less" href="css/app.min.less" />'
    }))
    .pipe(minifyHTML({collapseWhitespace:true, conservativeCollapse:true}))
    .pipe(eol('\n'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('icon', function() {
    // gulp.src('src/wheel.png').pipe(gulp.dest('dist/css/'));
    gulp.src('src/icon192x192.png').pipe(gulp.dest('dist/'));
    gulp.src('src/icon120x120.png').pipe(gulp.dest('dist/'));
    return gulp.src('src/icon64x64.png').pipe(gulp.dest('dist/'));
});

gulp.task('fonts', function() {
    //return gulp.src('node_modules/font-awesome/fonts/*').pipe(gulp.dest('dist/fonts/'));
    gulp.src('node_modules/font-awesome/fonts/fontawesome-webfont.woff').pipe(gulp.dest('dist/fonts/'));
    gulp.src('node_modules/weather-icons-lite/fonts/weather-icons-lite.woff').pipe(gulp.dest('dist/fonts/'));
    gulp.src('node_modules/font-awesome/fonts/fontawesome-webfont.woff2').pipe(gulp.dest('dist/fonts/'));
    gulp.src('node_modules/weather-icons-lite/fonts/weather-icons-lite.woff2').pipe(gulp.dest('dist/fonts/'));
    return;
});

gulp.task('js', function () {
    var scripts = gulp.src('src/index.html')
    .pipe(ghtmlSrc({getFileName:getFileName.bind(this, 'src')}));

    var templates = gulp.src(['src/**/*.html', '!src/index.html'])
    .pipe(minifyHTML({collapseWhitespace:true, conservativeCollapse:true}))
    .pipe(templateCache('templates.js', {root:'', module:'ui'}));

    var tiny = gulp.src('node_modules/tinycolor2/dist/tinycolor-min.js')
    .pipe(eol('\n'))
    .pipe(gulp.dest('./dist/js'));

    var i18n = gulp.src('src/i18n.js')
    .pipe(eol('\n'))
    .pipe(gulp.dest('dist/'));

    return streamqueue({ objectMode:true }, scripts, templates)
    .pipe(gulpif(/[.]min[.]js$/, gutil.noop(), uglify()))
    .pipe(concat('app.min.js'))
    .pipe(header(fs.readFileSync('license.js')))
    .pipe(eol('\n'))
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('css', function () {
    exec('node fixfa.js', function (err, stdout, stderr) {
        if (err) {
            console.log(stdout);
            console.log(stderr);
        }
    });

    return gulp.src('src/index.html')
    .pipe(ghtmlSrc({getFileName:getFileName.bind(this, 'href'), presets:'css'}))
    .pipe(minifyCss({compatibility:'ie8'}))
    .pipe(concat('app.min.css'))
    .pipe(header(fs.readFileSync('license.js')))
    .pipe(eol('\n'))
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('less', function() {
    return gulp.src(['src/*.less'])
    .pipe(concat('app.min.less'))
    .pipe(header(fs.readFileSync('license.js')))
    .pipe(eol('\n'))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('gridstack', function() {
    gulp.src('node_modules/gridstack/dist/gridstack.min.css').pipe(gulp.dest('dist/css/'));
    gulp.src('node_modules/gridstack/dist/gridstack.jQueryUI.min.js').pipe(gulp.dest('dist/js/'));
    gulp.src('node_modules/gridstack/dist/gridstack.min.js').pipe(gulp.dest('dist/js/'));
    gulp.src('node_modules/gridstack/dist/gridstack.min.map').pipe(gulp.dest('dist/js/'));
    gulp.src('node_modules/lodash/lodash.min.js').pipe(gulp.dest('dist/js/'));
    gulp.src('node_modules/gridstack/src/gridstack-extra.scss')
    .pipe(replace('$gridstack-columns: 12 !default;','$gridstack-columns: 30;'))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest('dist/css'))
    return;
});

var vendorPrefix = "vendor/";
function getFileName(attr, node) {
    var file = node.attr(attr);
    if (file.indexOf(vendorPrefix) === 0) {
        file = path.join("..", "node_modules", file.substr(vendorPrefix.length));
    }
    return file;
}
