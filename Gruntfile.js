// Small utility to add shims and external libs for our browserify build
var Libs = new (function() {
	this.shims = {};
	this.paths = [];
	this.aliases = [];
	this.externals = [];

	this.addShims = function(array) {
		for (var i=0; i<array.length; i++) {
			var params = array[i];

			this.shims[params.alias] = {
				path: params.path, exports: (params.exports || null), depends: (params.depends || null)
			};
			this.paths.push(params.path);

			if (params.exports) {
				this.aliases.push(params.path + ':' + params.alias);
				this.externals.push(params.path);
			}
		}
	};
})();


//We set up our shims here, so we can use require(...) on them in our code
Libs.addShims([
	{ 
		alias: 	 'threejs', 
		path: 	 'bower_components/threejs/build/three.js', 
		exports: 'THREE'
	},
	{ 
		alias:   'jquery', 
		path:    'bower_components/jquery/jquery.js', 
		exports: '$'
	},
	{ //this is how we might include a jQuery plugin to our libs build.
		alias:   'jquery.transit', 
		path:    'bower_components/jquery.transit/jquery.transit.js', 
		exports: null,
		depends: { jquery: '$' }
	}
]);

module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		distdir: 'build',
		srcdir: 'lib',

		browserify: {
			// Externalize 3rd party libraries for faster builds
			// http://benclinkinbeard.com/blog/2013/08/external-bundles-for-faster-browserify-builds/
			libs: {
				options: {
					shim: Libs.shims, 
					//Include source maps for libs during development...
					debug: true
				},
				src: Libs.paths,
				dest: '<%= distdir %>/libs.js'
			},

			//Here is where we bundle our app...
			bundle: {
				src: ['<%= srcdir %>/index.js'],
				dest: '<%= distdir %>/bundle.js',

				options: {
					alias: Libs.aliases,
					external: Libs.externals, 
					debug: true
				}
			}
		}, 

		watch: {
			js: { 
				//Watch for changes...
				files: ['<%= srcdir %>/*.js', 'index.html', 'Gruntfile.js'],
				tasks: ['build-core'],
				options: { 
					livereload: true
				},
			},
		}
	});
 
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('build-all', ['browserify']);
	grunt.registerTask('build-libs', ['browserify:libs']);
	grunt.registerTask('build-core', ['browserify:bundle']); 
	grunt.registerTask('default', ['build-all']);

};