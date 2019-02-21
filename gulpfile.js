"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./dist"
        },
        port: 3000
    });
    done();
}

// Clean vendor
function clean() {
    return del(["./dist/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
    // Bootstrap JS
    var bootstrap = gulp.src('./node_modules/bootstrap/dist/js/**/*')
        .pipe(gulp.dest('./dist/bootstrap/js'));
    // Font Awesome
    var fontAwesome = gulp.src('./node_modules/@fortawesome/**/*')
        .pipe(gulp.dest('./dist'));
    // jQuery Easing
    var jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
        .pipe(gulp.dest('./dist/jquery-easing'));
    // Magnific Popup
    var magnificPopup = gulp.src('./node_modules/magnific-popup/dist/*')
        .pipe(gulp.dest('./dist/magnific-popup'));
    // jQuery
    var jquery = gulp.src([
            './node_modules/jquery/dist/*',
            '!./node_modules/jquery/dist/core.js'
        ])
        .pipe(gulp.dest('./dist/jquery'));
    return merge(bootstrap, fontAwesome, jquery, jqueryEasing, magnificPopup);
}

// CSS task
function css() {
    return gulp
        .src("./scss/**/*.scss")
        .pipe(plumber())
        .pipe(sass({
            outputStyle: "expanded"
        }))
        .on("error", sass.logError)
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest("./dist"))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest("./dist"))
        .pipe(browsersync.stream());
}

// JS task
function js() {
    return gulp
        .src([
            './js/*.js',
            '!./js/*.min.js'
        ])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist'))
        .pipe(browsersync.stream());
}

function html() {
    return gulp
        .src([
            'index.html'
        ]).pipe(gulp.dest('./dist'))
        .pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
    gulp.watch("./scss/**/*", css);
    gulp.watch("./js/**/*", js);
    gulp.watch("./**/*.html", html);
}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js, html));
const watch = gulp.parallel(watchFiles, browserSync);

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;