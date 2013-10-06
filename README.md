browserify-template
===================

This is a simple template for a browserify project. At some point I will
turn this into a Yeoman Generator with options for which third-party libraries
to include.

This brings together the following:
 
- [MikkoH/jsOOP](https://github.com/MikkoH/jsOOP) -- a forked version for Node.
- [requestAnimationFrame polyfill](https://github.com/thomaswelton/requestAnimationFrame)
- [normalize.css](https://github.com/necolas/normalize.css/)
- jQuery
- jQuery.transit plugin
- THREE.js

## Notes

I am using the GitHub shorthand in the package.json dependencies, which requires
at least version 1.1.65 of NPM. If you're using an older version, use the full
URL like so:  
`git+https://github.com/mattdesl/jsOOP.git`