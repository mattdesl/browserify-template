browserify-template
===================

This is a "real world" template for a client-side browserify ande Node-based project.
 
- [MikkoH/jsOOP](https://github.com/MikkoH/jsOOP) -- a [forked version](https://github.com/mattdesl/jsOOP) for Node.
- [requestAnimationFrame polyfill](https://github.com/thomaswelton/requestAnimationFrame)
- [normalize.css](https://github.com/necolas/normalize.css/)
- jQuery
- jQuery.transit plugin
- THREE.js


## Setup

First, install Node, NPM (version >= 1.1.65), and Bower. For development, it's a good idea to use the [LiveReload plugin](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) in your browser of choice.

Then, install the dependencies like so:

```
npm install
bower install
```

If you're getting Administrator issues, you might need to run as root with `sudo`. A safer alternative is to run something like this, which sets your user account to the owner of `/usr/local`.

```
sudo chown -R $USER /usr/local
```

## Development

Run `grunt watch` to begin your development process. 

