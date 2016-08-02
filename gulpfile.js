var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');
var gutil = require('gulp-util')
var proxy = require('http-proxy-middleware');

function createLogger(name) {
	return function(req, res, next) {
		gutil.log("[" + name + "]", req.method, req.url, 'HTTP/' + req.httpVersion, res.statusCode);
		next();
	}
}

gulp.task('html', function() {
	return gulp.src('src/*.html')
		.pipe(gulp.dest('build/'));
});

gulp.task('js', function() {
	return gulp.src('src/*.js')
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('build/'));
});

gulp.task('backend', ['build'], function() {
	connect.server({
		port: 3000,
		https: true,
		root: 'build/',
		middleware: function(connect, opts) {
			return [createLogger('BACKEND')]
		}
	});
});

gulp.task('proxy', ['build'], function() {
	connect.server({
		port: 3001,
		https: true,
		middleware: function(connect, opts) {
			return [
				createLogger('PROXY'),
				proxy('/', {
					target: 'https://localhost:3000',
					secure: false // Ignore invalid SSL cert on "backend" server
				})
			]
		}
	})
})

gulp.task('build', ['js', 'html']);

gulp.task('default', ['backend', 'proxy']);
