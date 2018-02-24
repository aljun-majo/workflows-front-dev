var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jsValidate = require('gulp-jsvalidate'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    concat = require('gulp-concat'),
    webserver = require('gulp-webserver');

var outputBuilds,
    sassOutputStyle, 
    sassSources,
    jsSrc;

// status 
//env = 'production';
env = 'development';

if (env==='development') {
   outputBuilds = 'builds/development/';
  sassOutputStyle = 'expanded';

} else {
  outputBuilds = 'builds/production/';
  sassOutputStyle = 'compressed';
}

// javasctipt files
jsSrc = [
  'components/scripts/jquery.slim.min.js',
  'components/scripts/popper.js',
  'components/scripts/bootstrap.js',
  'components/scripts/script.js'
];

// main sass file
sassSources = ['components/sass/style.scss'];

// concat all js in one file - script.js
gulp.task('js', function() {
  gulp.src(jsSrc)

    .pipe(concat('script.js'))
    //.pipe(browserify())
    .on('error', gutil.log)
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputBuilds + 'js'))
    .pipe(connect.reload())
});

//checking javascript error
gulp.task('javascript', function () {
  console.log("Validate JavaScript");
  return gulp.src("components/scripts/**.js")
    .pipe(jsValidate());
});

//sass compiler. convert scss to css
gulp.task('compass', function() {
  gulp.src(sassSources)
    .pipe(compass({
      sass: 'components/sass',
      css: outputBuilds + 'css',
      style: sassOutputStyle
    })
    .on('error', gutil.log))
    .pipe(gulp.dest( outputBuilds + 'css'))
    .pipe(connect.reload())
});

// watcher
gulp.task('watch', function() {
    gulp.watch(['components/sass/*.scss', 'components/sass/*/*.scss'], ['compass']);    
    gulp.watch(jsSrc, ['js']);
    gulp.watch( ['components/scripts/**.js'], ['javascript']);
    gulp.watch([outputBuilds + '/**/*.html'], ['html']);
});

// http://localhost:3000/ 
gulp.task('webserver', function() {
    gulp.src(outputBuilds + '/')
        .pipe(webserver({
            port: 3000,
            livereload: true,
            livereloadport: 8283,
            open: true
        }));
});

gulp.task('html', function() {
    //gulp.src('builds/development/*.html')
    gulp.src(outputBuilds + '/**/*.html') 
    .pipe(gulpif(env === 'production', minifyHTML()))
    .pipe(gulpif(env === 'production', gulp.dest(outputBuilds)))
    .pipe(connect.reload())
});

gulp.task('default', ['watch', 'html', 'js', 'javascript', 'compass', 'webserver']);