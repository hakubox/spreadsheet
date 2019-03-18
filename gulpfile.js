let gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    gulpIf = require('gulp-if'),
    minifyCSS = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps  = require('gulp-sourcemaps');

//sass生成css文件
gulp.task('sass', function(){
    return gulp.src('src/scss/**/*.+(scss|sass)')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值
            remove: true //是否去掉不必要的前缀
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

//清空dist
gulp.task('clean', function() {
    del(['dist/**/*', '!dist/images', '!dist/images/**/*'], callback)
});

//压缩图片
gulp.task('imgmin', function() {
  return gulp.src('src/images/**/*.+(png|jpg|gif|svg)')
  .pipe(imagemin())
  .pipe(gulp.dest('dist/images'))
});

gulp.task('useref', function() {
    return gulp.src('src/*.html')
        .pipe(gulpIf('*.css', minifyCSS()))
        .pipe(gulpIf('*.js', uglify()))
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

//刷新浏览器
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: "./src"
        },
        files:['**'],
    })
})

//生成发布文件并监听
gulp.task('watch', gulp.series('sass', 'browserSync', function(){
    gulp.watch('src/*.html').on('change', browserSync.reload);
    gulp.watch('src/scss/*.+(scss|sass)').on('change', ['sass']);
    gulp.watch('src/components/*.js').on('change', browserSync.reload);
    gulp.watch('src/js/*.js').on('change', browserSync.reload);
}));

//生成最终发布文件
gulp.task('build', gulp.series(`clean`, gulp.parallel(`sass`, `useref`, `imgmin`, function (){
    console.log('Building files');
})));
