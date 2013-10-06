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

Before we can see our site at `index.html`, we need to browserify our source like so:
```
grunt bundle-all
```

After this, we can just use `grunt bundle-core` to bundle our project source. Now we only need to browserify our vendor libs when we introduce a new external. We do this for faster browserify builds and also to split the load across files. See here:  
http://benclinkinbeard.com/blog/2013/08/external-bundles-for-faster-browserify-builds/

## Typical Development Workflow

Run `grunt -v watch` to begin your development process (with verbose output for better debugging). Now when you change a JS file inside of `lib`, it will browserify your `lib/index.js` file. Anything you `require()` here will end up getting included in the bundled `dist/bundle.js`. 

You can enable the LiveReload plugin by clicking the Extension button in Chrome/FF. Now when the browserify build is complete, your web page should refresh automatically.

If you aren't already, check out [http-server](https://github.com/nodeapps/http-server) for quick testing on localhost.

# Other Notes

### .npmignore

When somebody else uses `install` to grab your package, they don't want all the bloat of documentation, binary files, build steps, unit tests, etc. So keep your `.npmignore` updated accordingly. Same goes for the `ignore` array in `bower.json`.

### Future Stuff

Some features you will probably want to add to your project:

- `grunt-contrib-nodeunit` for automated unit testing
- `grunt-contrib-uglify` for minification of browserified bundles
- `grunt-contrib-yuidoc` to generate docs
- `grunt-contrib-imagemin` and `grunt-shell` for image crunching and TexturePacker CLI