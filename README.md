browserify-template
===================

This is a "real world" example for a client-side browserify ande Node-based project.
 
- [MikkoH/jsOOP](https://github.com/MikkoH/jsOOP) -- a [forked version](https://github.com/mattdesl/jsOOP) for Node.
- [requestAnimationFrame polyfill](https://github.com/thomaswelton/requestAnimationFrame)
- [normalize.css](https://github.com/necolas/normalize.css/)
- jQuery
- jQuery.transit plugin
- THREE.js


## Setup

First, install Node, NPM (version >= 1.1.65), Grunt, and Bower. You should also install the [LiveReload plugin](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) in your browser of choice, for faster development.

Then, install the dependencies like so:

```
npm install
bower install
```

If you're getting Administrator issues, you might need to run as root with `sudo`. A safer alternative is to use something like this, which sets your user account to the owner of `/usr/local` so that you don't need to use `sudo` all over the place.

```
sudo chown -R $USER /usr/local
```

## Bundling External Libs

First, you need to build the `libs.js`. We use a separate build for THREE.js, jQuery, etc to speed things up a little, and split the load across more files. See here:  
http://benclinkinbeard.com/blog/2013/08/external-bundles-for-faster-browserify-builds/

To bundle these, we use `grunt bundle-libs` (or `build-all`). This will concat them into `dist/libs.js` which our HTML includes with a simple script tag.

## Development

Run `grunt -v watch` to begin your development process (with verbose output for better debugging). Now when you change a JS file inside of `lib`, it will browserify your `lib/index.js` file. Anything you `require()` here will end up getting included in the bundled `dist/bundle.js`.

You can enable the LiveReload plugin by clicking the Extension button in Chrome/FF. Now when the browserify build is complete, your web page should refresh automatically.

If you aren't already, check out [http-server](https://github.com/nodeapps/http-server) for quick testing on localhost.

# Other Notes

### Installing Other Modules

Install another module like so:

```npm install underscore --save```

This will save it to your "dependencies" in the `package.json`. You should use `--save-dev` for things like unit testing, build steps, grunt plugins, etc.

Likewise, for more client-side packages (like THREE.js) you should install them with Bower:

```bower install threejs --save```

And then, if necessary, add a shim.

### .npmignore

When somebody else uses `install` to grab your package, they don't want all the bloat of documentation, binary files, build steps, unit tests, etc. So update the `.npmignore` file accordingly.



## Future Stuff

Some features you will probably want to add to your project:

- `grunt-contrib-nodeunit` for automated unit testing
- `grunt-contrib-uglify` for minification of browserified bundles
- `grunt-contrib-yuidoc` to generate docs
- `grunt-contrib-imagemin` and `grunt-shell` for image crunching and TexturePacker CLI