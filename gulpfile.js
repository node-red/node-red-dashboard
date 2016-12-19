
var
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    fs = require('fs'),
    ghtmlSrc = require('gulp-html-src'),
    gutil = require('gulp-util'),
    gulpif = require('gulp-if'),
    header = require("gulp-header"),
    htmlreplace = require('gulp-html-replace'),
    manifest = require('gulp-manifest'),
    minifyCss = require('gulp-clean-css'),
    minifyHTML = require('gulp-htmlmin'),
    path = require('path'),
    spawn = require('child_process').spawn,
    streamqueue = require('streamqueue'),
    templateCache = require('gulp-angular-templatecache'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs');

gulp.task('default', ['manifest']);

gulp.task('build', ['icon', 'js', 'css', 'index', 'fonts']);

gulp.task('publish', ['build'], function (done) {
    spawn('npm', ['publish'], { stdio:'inherit' }).on('close', done);
});

gulp.task('manifest', ['build'], function() {
    gulp.src(['dist/*','dist/css/*','dist/js/*','dist/fonts/*'], { base: 'dist/' })
    .pipe(manifest({
        hash: true,
        //preferOnline: true,
        network: ['*'],
        filename: 'dashboard.appcache',
        exclude: 'dashboard.appcache'
    }))
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
        .pipe(jscs.reporter());
});

gulp.task('index', function() {
    return gulp.src('src/index.html')
    .pipe(htmlreplace({
        'css': 'css/app.min.css',
        'js': 'js/app.min.js'
    }))
    .pipe(minifyHTML({collapseWhitespace:true, conservativeCollapse:true}))
    .pipe(gulp.dest('dist/'));
});

gulp.task('icon', function() {
    return gulp.src('src/icon.png').pipe(gulp.dest('dist/'));
});

gulp.task('fonts', function() {
    return gulp.src('node_modules/font-awesome/fonts/*').pipe(gulp.dest('dist/fonts/'));
});

gulp.task('js', function () {
    var scripts = gulp.src('src/index.html')
    .pipe(ghtmlSrc({getFileName:getFileName.bind(this, 'src')}));

    var templates = gulp.src(['src/**/*.html', '!src/index.html'])
    .pipe(minifyHTML({collapseWhitespace:true, conservativeCollapse:true}))
    .pipe(templateCache('templates.js', {root:'', module:'ui'}));

    return streamqueue({ objectMode:true }, scripts, templates)
    .pipe(gulpif(/[.]min[.]js$/, gutil.noop(), uglify()))
    .pipe(concat('app.min.js'))
    .pipe(header(fs.readFileSync('license.js')))
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('css', function () {
    return gulp.src('src/index.html')
    .pipe(ghtmlSrc({getFileName: getFileName.bind(this, 'href'), presets: 'css'}))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(concat('app.min.css'))
    .pipe(header(fs.readFileSync('license.js')))
    .pipe(gulp.dest('dist/css/'));
});

var vendorPrefix = "vendor/";
function getFileName(attr, node) {
    var file = node.attr(attr);
    if (file.indexOf(vendorPrefix) === 0) {
        file = path.join("..", "node_modules", file.substr(vendorPrefix.length));
    }
    return file;
}
