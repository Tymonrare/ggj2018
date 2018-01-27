var gulp = require('gulp');
var fs = require('fs');
//var mkdirp = require('mkdirp');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var del = require('del');
var refresh = require('gulp-livereload');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var rev = require('gulp-rev');
var webserver = require('gulp-webserver');
var lr = require('tiny-lr');
var server = lr();
var csso = require('gulp-csso');
var gulpif = require('gulp-if');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var javascriptObfuscator = require('gulp-javascript-obfuscator');
var cached = require('gulp-cached');
var remember = require('gulp-remember');

// create a handlebars helper to look up
// fingerprinted asset by non-fingerprinted name
var handlebarOpts = {
	helpers: {
		assetPath: function (path, context) {
			return context.data.root[path];
		}
	}
};

function endOnError(err){
	console.error(err);
	process.exit(1);
}

gulp.task('manifest', ['scripts', 'styles'], function() {
	return gulp.src(['build/tmp/*.css', 'build/tmp/*.js'], {base: 'build/tmp'})
	  .pipe(rev())
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest('build'))
		.pipe(rev.manifest())
		.pipe(gulp.dest('build/res'))
})

gulp.task('compile-hbs', ['manifest'], function () {
	// read in our manifest file
	var manifest = JSON.parse(fs.readFileSync('build/res/rev-manifest.json', 'utf8'));

	// read in our handlebars template, compile it using
	// our manifest, and output it to index.html
	var g = gulp.src('src/**/*.hbs')
		.pipe(handlebars(manifest, handlebarOpts))
		.pipe(rename(function (path) {
    			path.extname = ".html"
  			}))
		.pipe(gulp.dest('build'))
		.pipe(refresh(server))
	return g;
});

var cleanBuild = false;
var watching = false;
var enableImagemin = false;

gulp.task('scripts', function() {
	var script;

	if(!cleanBuild){
		script = gulp.src("src/**/*.js")
			 .pipe(babel({
				 "presets": [
				 	"babel-fast-presets/es2015-stage1"
				 ]
			 }))
			.pipe(concat('app.min.js'))
			.pipe(uglify().on('error', function(err) { endOnError(err) }))
			.pipe(javascriptObfuscator({compact:true}))
			.pipe(gulp.dest('build/tmp'))
	}
	else
		var script = gulp.src("src/**/*.js")
			.pipe(sourcemaps.init())
			.pipe(cached('scripts'))
			.pipe(babel({
				"presets": [
					"babel-fast-presets/es2015-stage1"
				]
			}))
			.pipe(remember('scripts'))
			.pipe(concat('app.min.js'))
			.pipe(gulp.dest('build/tmp'))

	script.on('error', function(err) { endOnError(err) })
	return script;
})

gulp.task('styles', function() {
	var styles = gulp.src(['src/**/*.css'])
		.pipe(gulpif(!cleanBuild, csso()))
	        .pipe(concat('app.min.css'))
		.pipe(gulp.dest('build/tmp'))
	return styles;
})

gulp.task('webserver', ['manifest', 'compile-hbs', 'styles', 'libs'], function() {
	return gulp.src('build')
		.pipe(webserver({
			host:"0.0.0.0",
			livereload: {
				enable: true, // need this set to true to enable livereload
				filter: function(fileName) {
					if (fileName.match(/.html$/) || fileName.match(/res/)) { // exclude all source maps from livereload
						return true;
					} else {
						return false;
					}
				}
			},
			fallback: 'index.html',
			open: "http://localhost:8000/index.html",
		}));
});


gulp.task('images', function(){
	return gulp.src('res/**')
		.pipe(gulpif(!cleanBuild && enableImagemin, imagemin()))
		.pipe(gulp.dest('build/res'))
});
gulp.task('libs', function() {
	return gulp.src('lib/*.js')
		.pipe(concat("lib.min.js"))
		.pipe(gulp.dest('build/lib'))
})


gulp.task('default', function() {
	gulp.run('clean', 'scripts', 'compile-hbs', 'manifest', 'styles', 'images', 'libs');
})

gulp.task('watch', ['compile-hbs'], function() {
	watching = true;
	gulp.watch('src/**', ['scripts', 'styles', 'manifest', 'compile-hbs','libs']);
	gulp.watch('res/**', ['images']);
})

gulp.task('debug', function(callback) {
	cleanBuild = true;
	gulp.run('default', 'webserver', 'watch');
})

gulp.task('release', function(callback) {
	cleanBuild = false;
	gulp.run('default', 'webserver', 'watch');
})

gulp.task('clean', function() {
	return del.sync('build/**/*');
});
