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

First, install Node, NPM (version >= 1.1.65), and Bower. You should also install the [LiveReload plugin](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) in your browser of choice, for faster development.

Then, install the dependencies like so:

```
npm install
bower install
```

If you're getting Administrator issues, you might need to run as root with `sudo`. A safer alternative is to use something like this, which sets your user account to the owner of `/usr/local` so that you don't need to use `sudo` all over the place.

```
sudo chown -R $USER /usr/local
```

## Development

Run `grunt watch` to begin your development process. 




## Installing Other Modules

Install another module like so:

```npm install underscore --save```

This will save it to your "dependencies" in the `package.json`. You should use `--save-dev` for things like unit testing and development-specific grunt plugins.

Likewise, for more client-side packages (like THREE.js) you should install them with Bower:

```bower install threejs --save```

And then, if necessary, add a shim.