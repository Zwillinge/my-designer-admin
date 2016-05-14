var debug_export = false;

var gulp = require('gulp');
var glob = require('glob');

var _if = require('gulp-if');
var rjs = require('gulp-requirejs');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var less = require('gulp-less');
var rimraf = require('gulp-rimraf');
var replace = require("gulp-replace");
var jshint = require("gulp-jshint");
var shell = require("gulp-shell");

gulp.task("css", function(){
	return build_css();
});

function build_css(){
	return gulp.src('./public/assets/theme.*.less')
		.pipe(less({ compress:true }))
		.pipe(gulp.dest('./deploy/public/assets'));
}

gulp.task('js', function(){
	return build_js();
});

function build_node(){
	return require('event-stream').merge(
		gulp.src(['./index.js','./db.js', './package.json']).pipe(gulp.dest("./deploy/")),
		gulp.src('./models/*.*').pipe(gulp.dest("./deploy/models/"))
	);
	
}

function build_js(){
	var views = glob.sync("./public/views/**/*.js").map(function(value){
		return value.replace(".js", "").replace("public/","");
	});

	var locales = glob.sync("./public/locales/**/*.js").map(function(value){
		return value.replace(".js", "").replace("public/","");
	});

	return rjs({
		baseUrl: './public/',
		out: 'app.js',
		insertRequire:["app"],
		paths:{
			"locale" : "empty:",
			"text": 'libs/text'
		}, 
		deps:["app"],
		include: ["libs/requirejs/require.js"].concat(views).concat(locales)
	})
	.pipe( _if(debug_export, sourcemaps.init()) )
	.pipe(uglify())
	.pipe( _if(debug_export, sourcemaps.write("./")) )
	.pipe(gulp.dest('./deploy/public/'));
}

gulp.task("clean", function(){
	return gulp.src("deploy/*", {read: false}).pipe(rimraf());
});

gulp.task('build', ["clean"], function(){
	var build = (new Date())*1;

	return require('event-stream').merge(
	build_js(),
	build_css(),
	build_node(),
		//assets
	gulp.src("./public/assets/imgs/**/*.*")
		.pipe(gulp.dest("./deploy/public/assets/imgs/")),
	gulp.src("./public/assets/html/**/*.*")
		.pipe(gulp.dest("./deploy/public/assets/html/")),
	gulp.src("./public/assets/codemirror/**/*.*")
		.pipe(gulp.dest("./deploy/public/assets/codemirror/")),
	gulp.src("./public/assets/templates/**/*.*")
		.pipe(gulp.dest("./deploy/public/assets/templates/")),
	gulp.src("./public/models/ui/*.*")
		.pipe(gulp.dest("./deploy/public/models/ui/")),
		//index
	gulp.src("./public/index.html")
		.pipe(replace('data-main="app" src="libs/requirejs/require.js"', 'src="app.js"'))
		.pipe(replace('<script type="text/javascript" src="libs/less/dist/less.min.js"></script>', ''))
		.pipe(replace(/rel\=\"stylesheet\/less\" href=\"(.*?)\.less\"/g, 'rel="stylesheet" href="$1.css"'))
		.pipe(replace(/\.css\"/g, '.css?'+build+'"'))
		.pipe(replace(/\.js\"/g, '.js?'+build+'"'))
		.pipe(replace("require.config", "webix.production = true; require.config"))
		.pipe(replace(/libs\/webix\/codebase\//g, '//cdn.webix.com/site/'))

		.pipe(gulp.dest("./deploy/public/"))
		//server
	);
});


gulp.task('lint', function() {
  return gulp.src(['./public/views/**/*.js', './public/helpers/**/*.js', './public/models/**/*.js', './public/*.js', "!./jshint.conf.js"])
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
	.pipe(jshint.reporter('fail'));
});

gulp.task('deploy', shell.task([
  'rsync -rv ./deploy/* webix.com:/sites/designer-admin.webix.com/'
]));