var 
  gulp = require('gulp'),

  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  templateCache = require('gulp-angular-templatecache'),
  ghtmlSrc = require('gulp-html-src'),
  gutil = require('gulp-util'),
  minifyCss = require('gulp-minify-css'),
  gulpif = require('gulp-if'),
  htmlreplace = require('gulp-html-replace'),
  
  path = require('path'),
  merge = require('merge-stream');

gulp.task('build', ['js', 'css', 'index']);
    
gulp.task('index', function() {
  return gulp.src('src/public/index.html')
    .pipe(htmlreplace({
        'css': 'app.min.css',
        'js': 'app.min.js'
    }))
    .pipe(gulp.dest('src/dist/'));
});
    
gulp.task('js', function () {
  var scripts = gulp.src('src/public/index.html')
    .pipe(ghtmlSrc({getFileName: getFileName.bind(this, 'src')}));
    
  var templates = gulp.src('src/public/templates/**/*.html')
    .pipe(templateCache('templates.js',  {root: 'templates/', module: 'ui'}));
    
  return merge(scripts, templates)
    .pipe(gulpif(/[.]min[.]js$/, gutil.noop(), uglify()))
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('src/dist/'));;
});

gulp.task('css', function () {
  return gulp.src('src/public/index.html')
    .pipe(ghtmlSrc({getFileName: getFileName.bind(this, 'href'), presets: 'css'}))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(concat('app.min.css'))
    .pipe(gulp.dest('src/dist/'));
});

var vendorPrefix = "vendor/";
function getFileName(attr, node) {
  var file = node.attr(attr);
  if (file.indexOf(vendorPrefix) === 0)
    file = path.join("..", "..", "node_modules", file.substr(vendorPrefix.length));
  return file;
}