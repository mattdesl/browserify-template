require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"jquery":[function(require,module,exports){
module.exports=require('WSAlA4');
},{}],2:[function(require,module,exports){
var Class = require('jsOOP').Class;

var Foo = new Class({
	// ... some stuff here ...
});

module.exports = Foo; 
},{"jsOOP":5}],3:[function(require,module,exports){
var $ = require('jquery');

var Foo = require('./foo'); //treat "foo" as a module, Node looks for index.js
console.log("Foo Class: "+Foo);

$(function() {   
	$("<div>")
		.text("Click me!")
		.css({
			margin: 50,
			padding: 5,
			display: "inline-block",
			backgroundColor: "#ddd"
		})
		.click( function(ev) {
			$(this) //transit plugin in action
				.transition({ rotate: '45deg' })
				.transition({ rotate: '0deg' });
		})
		.appendTo($("body"));
});
},{"./foo":2,"jquery":"WSAlA4"}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
var Class = require('./lib/Class'),
	Enum = require('./lib/Enum'),
	Interface = require('./lib/Interface');

module.exports = {
	Class: Class,
	Enum: Enum,
	Interface: Interface
};
},{"./lib/Class":6,"./lib/Enum":7,"./lib/Interface":8}],6:[function(require,module,exports){
var BaseClass = require('./baseClass');

var Class = function( descriptor ) {
	if (!descriptor) 
		descriptor = {};
	
	if( descriptor.initialize ) {
		var rVal = descriptor.initialize;
		delete descriptor.initialize;
	} else {
		rVal = function() { this.parent.apply( this, arguments ); };
	}

	if( descriptor.Extends ) {
		rVal.prototype = Object.create( descriptor.Extends.prototype );
		// this will be used to call the parent constructor
		rVal.$$parentConstructor = descriptor.Extends;
		delete descriptor.Extends;
	} else {
		rVal.$$parentConstructor = function() {}
		rVal.prototype = Object.create( BaseClass );
	}

	rVal.prototype.$$getters = {};
	rVal.prototype.$$setters = {};

	for( var i in descriptor ) {
		if( typeof descriptor[ i ] == 'function' ) {
			descriptor[ i ].$$name = i;
			descriptor[ i ].$$owner = rVal.prototype;

			rVal.prototype[ i ] = descriptor[ i ];
		} else if( descriptor[ i ] && typeof descriptor[ i ] == 'object' && ( descriptor[ i ].get || descriptor[ i ].set ) ) {
			Object.defineProperty( rVal.prototype, i , descriptor[ i ] );

			if( descriptor[ i ].get ) {
				rVal.prototype.$$getters[ i ] = descriptor[ i ].get;
				descriptor[ i ].get.$$name = i;
				descriptor[ i ].get.$$owner = rVal.prototype;
			}

			if( descriptor[ i ].set ) {
				rVal.prototype.$$setters[ i ] = descriptor[ i ].set;
				descriptor[ i ].set.$$name = i;
				descriptor[ i ].set.$$owner = rVal.prototype;	
			}
		} else {
			rVal.prototype[ i ] = descriptor[ i ];
		}
	}

	// this will be used to check if the caller function is the consructor
	rVal.$$isConstructor = true;


	// now we'll check interfaces
	for( var i = 1; i < arguments.length; i++ ) {
		arguments[ i ].compare( rVal );
	}

	return rVal;
};	

exports = module.exports = Class;
},{"./baseClass":9}],7:[function(require,module,exports){
var Class = require('./Class');

/**
The Enum class, which holds a set of constants in a fixed order.

#### Basic Usage:
	var Days = new Enum([ 
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
			'Sunday'
	]);

	console.log( Days.Monday === Days.Tuesday ); // => false
	console.log( Days.values[1] ) // => the 'Tuesday' symbol object

Each enum *symbol* is an object which extends from the `{{#crossLink "Enum.Base"}}{{/crossLink}}` 
class. This base
class has  properties like `{{#crossLink "Enum.Base/value:property"}}{{/crossLink}}`  
and `{{#crossLink "Enum.Base/ordinal:property"}}{{/crossLink}}`. 
__`value`__ is a string
which matches the element of the array. __`ordinal`__ is the index the 
symbol was defined at in the enumeration. 

The resulting Enum object (in the above case, Days) also has some utility methods,
like fromValue(string) and the values property to access the array of symbols.

Note that the values array is frozen, as is each symbol. The returned object is 
__not__ frozen, as to allow the user to modify it (i.e. add "static" members).

A more advanced Enum usage is to specify a base Enum symbol class as the second
parameter. This is the class that each symbol will use. Then, if any symbols
are given as an Array (instead of string), it will be treated as an array of arguments
to the base class. The first argument should always be the desired key of that symbol.

Note that __`ordinal`__ is added dynamically
after the symbol is created; so it can't be used in the symbol's constructor.

#### Advanced Usage
	var Days = new Enum([ 
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			['Saturday', true],
			['Sunday', true]
		], new Class({
			
			Extends: Enum.Base,

			isWeekend: false,

			initialize: function( key, isWeekend ) {
				//pass the string value along to parent constructor
				this.parent( key ); 
				
				//get a boolean primitive out of the truthy/falsy value
				this.isWekeend = Boolean(isWeekend);
			}
		})
	);

	console.log( Days.Saturday.isWeekend ); // => true

This method will throw an error if you try to specify a class which does
not extend from `{{#crossLink "Enum.Base"}}{{/crossLink}}`.

#### Shorthand

You can also omit the `new Class` and pass a descriptor, thus reducing the need to 
explicitly require the Class module. Further, if you are passing a descriptor that
does not have `Extends` defined, it will default to
`{{#crossLink "Enum.Base"}}{{/crossLink}}`.

	var Icons = new Enum([ 
			'Open',
			'Save',
			'Help',
			'New'
		], {

			path: function( retina ) {
				return "icons/" + this.value.toLowerCase() + (retina ? "@2x" : "") + ".png";
			}
		}
	);


@class Enum
@constructor 
@param {Array} elements An array of enumerated constants, or arguments to be passed to the symbol
@param {Class} base Class to be instantiated for each enum symbol, must extend 
`{{#crossLink "Enum.Base"}}{{/crossLink}}`
*/
var EnumResult = new Class({

	/**
	An array of the enumerated symbol objects.

	@property values
	@type Array
	*/
	values: null,

	initialize: function () {
		this.values = [];
	},

	toString: function () {
		return "[ "+this.values.join(", ")+" ]";
	},

	/**
	Looks for the first symbol in this enum whose 'value' matches the specified string. 
	If none are found, this method returns null.

	@method fromValue
	@param {String} str the string to look up
	@return {Enum.Base} returns an enum symbol from the given 'value' string, or null
	*/
	fromValue: function (str) {
		for (var i=0; i<this.values.length; i++) {
			if (str === this.values[i].value)
				return this.values[i];
		}
		return null;
	}
});



var Enum = function ( elements, base ) {
	if (!base)
		base = Enum.Base;

	//The user is omitting Class, inject it here
	if (typeof base === "object") {
		//if we didn't specify a subclass.. 
		if (!base.Extends)
			base.Extends = Enum.Base;
		base = new Class(base);
	}
	
	var ret = new EnumResult();

	for (var i=0; i<elements.length; i++) {
		var e = elements[i];

		var obj = null;
		var key = null;

		if (!e)
			throw "enum value at index "+i+" is undefined";

		if (typeof e === "string") {
			key = e;
			obj = new base(e);
			ret[e] = obj;
		} else {
			if (!Array.isArray(e))
				throw "enum values must be String or an array of arguments";

			key = e[0];

			//first arg is ignored
			e.unshift(null);
			obj = new (Function.prototype.bind.apply(base, e));

			ret[key] = obj;
		}

		if ( !(obj instanceof Enum.Base) )
			throw "enum base class must be a subclass of Enum.Base";

		obj.ordinal = i;
		ret.values.push(obj);
		Object.freeze(obj);
	};

	//we SHOULD freeze the returrned object, but most JS developers
	//aren't expecting an object to be frozen, and the browsers don't always warn us.
	//It just causes frustration, e.g. if you're trying to add a static or constant
	//to the returned object.

	// Object.freeze(ret);
	Object.freeze(ret.values);
	return ret;
};


/**

The base type for Enum symbols. Subclasses can extend
this to implement more functionality for enum symbols.

@class Enum.Base
@constructor 
@param {String} key the string value for this symbol
*/
Enum.Base = new Class({

	/**
	The string value of this symbol.
	@property value
	@type String
	*/
	value: undefined,

	/**
	The index of this symbol in its enumeration array.
	@property ordinal
	@type Number
	*/
	ordinal: undefined,

	initialize: function ( key ) {
		this.value = key;
	},

	toString: function() {
		return this.value || this.parent();
	},

	valueOf: function() {
		return this.value || this.parent();
	}
});

exports = module.exports = Enum;

},{"./Class":6}],8:[function(require,module,exports){

var Interface = function( descriptor ) {
	this.descriptor = descriptor;
};

Interface.prototype.descriptor = null;

Interface.prototype.compare = function( classToCheck ) {

	for( var i  in this.descriptor ) {
		// First we'll check if this property exists on the class
		if( classToCheck.prototype[ i ] === undefined ) {

			throw 'INTERFACE ERROR: ' + i + ' is not defined in the class';

		// Second we'll check that the types expected match
		} else if( typeof this.descriptor[ i ] != typeof classToCheck.prototype[ i ] ) {

			throw 'INTERFACE ERROR: Interface and class define items of different type for ' + i + 
				  '\ninterface[ ' + i + ' ] == ' + typeof this.descriptor[ i ] +
				  '\nclass[ ' + i + ' ] == ' + typeof classToCheck.prototype[ i ];

		// Third if this property is a function we'll check that they expect the same amount of parameters
		} else if( typeof this.descriptor[ i ] == 'function' && classToCheck.prototype[ i ].length != this.descriptor[ i ].length ) {

			throw 'INTERFACE ERROR: Interface and class expect a different amount of parameters for the function ' + i +
				  '\nEXPECTED: ' + this.descriptor[ i ].length + 
				  '\nRECEIVED: ' + classToCheck.prototype[ i ].length;

		}
	}
};

exports = module.exports = Interface;
},{}],9:[function(require,module,exports){
//Exports a function named 'parent'
module.exports.parent = function() {
	// if the current function calling is the constructor
	if( this.parent.caller.$$isConstructor ) {
		var parentFunction = this.parent.caller.$$parentConstructor;
	} else {
		if( this.parent.caller.$$name ) {
			var callerName = this.parent.caller.$$name;
			var isGetter = this.parent.caller.$$owner.$$getters[ callerName ];
			var isSetter = this.parent.caller.$$owner.$$setters[ callerName ];

			if( arguments.length == 1 && isSetter ) {
				var parentFunction = Object.getPrototypeOf( this.parent.caller.$$owner ).$$setters[ callerName ];

				if( parentFunction === undefined ) {
					throw 'No setter defined in parent';
				}
			} else if( arguments.length == 0 && isGetter ) {
				var parentFunction = Object.getPrototypeOf( this.parent.caller.$$owner ).$$getters[ callerName ];

				if( parentFunction === undefined ) {
					throw 'No getter defined in parent';
				}
			} else if( isSetter || isGetter ) {
				throw 'Incorrect amount of arguments sent to getter or setter';
			} else {
				var parentFunction = Object.getPrototypeOf( this.parent.caller.$$owner )[ callerName ];	

				if( parentFunction === undefined ) {
					throw 'No parent function defined for ' + callerName;
				}
			}
		} else {
			throw 'You cannot call parent here';
		}
	}

	return parentFunction.apply( this, arguments );
};
},{}]},{},[3])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvcHJvamVjdHMvYnJvd3NlcmlmeS10ZW1wbGF0ZS9ib3dlcl9jb21wb25lbnRzL2pxdWVyeS9qcXVlcnkuanMiLCIvcHJvamVjdHMvYnJvd3NlcmlmeS10ZW1wbGF0ZS9saWIvZm9vL2luZGV4LmpzIiwiL3Byb2plY3RzL2Jyb3dzZXJpZnktdGVtcGxhdGUvbGliL2luZGV4LmpzIiwiL3Byb2plY3RzL2Jyb3dzZXJpZnktdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvX2VtcHR5LmpzIiwiL3Byb2plY3RzL2Jyb3dzZXJpZnktdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2pzT09QL2luZGV4LmpzIiwiL3Byb2plY3RzL2Jyb3dzZXJpZnktdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2pzT09QL2xpYi9DbGFzcy5qcyIsIi9wcm9qZWN0cy9icm93c2VyaWZ5LXRlbXBsYXRlL25vZGVfbW9kdWxlcy9qc09PUC9saWIvRW51bS5qcyIsIi9wcm9qZWN0cy9icm93c2VyaWZ5LXRlbXBsYXRlL25vZGVfbW9kdWxlcy9qc09PUC9saWIvSW50ZXJmYWNlLmpzIiwiL3Byb2plY3RzL2Jyb3dzZXJpZnktdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2pzT09QL2xpYi9iYXNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKCdXU0FsQTQnKTsiLCJ2YXIgQ2xhc3MgPSByZXF1aXJlKCdqc09PUCcpLkNsYXNzO1xuXG52YXIgRm9vID0gbmV3IENsYXNzKHtcblx0Ly8gLi4uIHNvbWUgc3R1ZmYgaGVyZSAuLi5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvbzsgIiwidmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcblxudmFyIEZvbyA9IHJlcXVpcmUoJy4vZm9vJyk7IC8vdHJlYXQgXCJmb29cIiBhcyBhIG1vZHVsZSwgTm9kZSBsb29rcyBmb3IgaW5kZXguanNcbmNvbnNvbGUubG9nKFwiRm9vIENsYXNzOiBcIitGb28pO1xuXG4kKGZ1bmN0aW9uKCkgeyAgIFxuXHQkKFwiPGRpdj5cIilcblx0XHQudGV4dChcIkNsaWNrIG1lIVwiKVxuXHRcdC5jc3Moe1xuXHRcdFx0bWFyZ2luOiA1MCxcblx0XHRcdHBhZGRpbmc6IDUsXG5cdFx0XHRkaXNwbGF5OiBcImlubGluZS1ibG9ja1wiLFxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiBcIiNkZGRcIlxuXHRcdH0pXG5cdFx0LmNsaWNrKCBmdW5jdGlvbihldikge1xuXHRcdFx0JCh0aGlzKSAvL3RyYW5zaXQgcGx1Z2luIGluIGFjdGlvblxuXHRcdFx0XHQudHJhbnNpdGlvbih7IHJvdGF0ZTogJzQ1ZGVnJyB9KVxuXHRcdFx0XHQudHJhbnNpdGlvbih7IHJvdGF0ZTogJzBkZWcnIH0pO1xuXHRcdH0pXG5cdFx0LmFwcGVuZFRvKCQoXCJib2R5XCIpKTtcbn0pOyIsbnVsbCwidmFyIENsYXNzID0gcmVxdWlyZSgnLi9saWIvQ2xhc3MnKSxcblx0RW51bSA9IHJlcXVpcmUoJy4vbGliL0VudW0nKSxcblx0SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9saWIvSW50ZXJmYWNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRDbGFzczogQ2xhc3MsXG5cdEVudW06IEVudW0sXG5cdEludGVyZmFjZTogSW50ZXJmYWNlXG59OyIsInZhciBCYXNlQ2xhc3MgPSByZXF1aXJlKCcuL2Jhc2VDbGFzcycpO1xuXG52YXIgQ2xhc3MgPSBmdW5jdGlvbiggZGVzY3JpcHRvciApIHtcblx0aWYgKCFkZXNjcmlwdG9yKSBcblx0XHRkZXNjcmlwdG9yID0ge307XG5cdFxuXHRpZiggZGVzY3JpcHRvci5pbml0aWFsaXplICkge1xuXHRcdHZhciByVmFsID0gZGVzY3JpcHRvci5pbml0aWFsaXplO1xuXHRcdGRlbGV0ZSBkZXNjcmlwdG9yLmluaXRpYWxpemU7XG5cdH0gZWxzZSB7XG5cdFx0clZhbCA9IGZ1bmN0aW9uKCkgeyB0aGlzLnBhcmVudC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7IH07XG5cdH1cblxuXHRpZiggZGVzY3JpcHRvci5FeHRlbmRzICkge1xuXHRcdHJWYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggZGVzY3JpcHRvci5FeHRlbmRzLnByb3RvdHlwZSApO1xuXHRcdC8vIHRoaXMgd2lsbCBiZSB1c2VkIHRvIGNhbGwgdGhlIHBhcmVudCBjb25zdHJ1Y3RvclxuXHRcdHJWYWwuJCRwYXJlbnRDb25zdHJ1Y3RvciA9IGRlc2NyaXB0b3IuRXh0ZW5kcztcblx0XHRkZWxldGUgZGVzY3JpcHRvci5FeHRlbmRzO1xuXHR9IGVsc2Uge1xuXHRcdHJWYWwuJCRwYXJlbnRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKCkge31cblx0XHRyVmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEJhc2VDbGFzcyApO1xuXHR9XG5cblx0clZhbC5wcm90b3R5cGUuJCRnZXR0ZXJzID0ge307XG5cdHJWYWwucHJvdG90eXBlLiQkc2V0dGVycyA9IHt9O1xuXG5cdGZvciggdmFyIGkgaW4gZGVzY3JpcHRvciApIHtcblx0XHRpZiggdHlwZW9mIGRlc2NyaXB0b3JbIGkgXSA9PSAnZnVuY3Rpb24nICkge1xuXHRcdFx0ZGVzY3JpcHRvclsgaSBdLiQkbmFtZSA9IGk7XG5cdFx0XHRkZXNjcmlwdG9yWyBpIF0uJCRvd25lciA9IHJWYWwucHJvdG90eXBlO1xuXG5cdFx0XHRyVmFsLnByb3RvdHlwZVsgaSBdID0gZGVzY3JpcHRvclsgaSBdO1xuXHRcdH0gZWxzZSBpZiggZGVzY3JpcHRvclsgaSBdICYmIHR5cGVvZiBkZXNjcmlwdG9yWyBpIF0gPT0gJ29iamVjdCcgJiYgKCBkZXNjcmlwdG9yWyBpIF0uZ2V0IHx8IGRlc2NyaXB0b3JbIGkgXS5zZXQgKSApIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggclZhbC5wcm90b3R5cGUsIGkgLCBkZXNjcmlwdG9yWyBpIF0gKTtcblxuXHRcdFx0aWYoIGRlc2NyaXB0b3JbIGkgXS5nZXQgKSB7XG5cdFx0XHRcdHJWYWwucHJvdG90eXBlLiQkZ2V0dGVyc1sgaSBdID0gZGVzY3JpcHRvclsgaSBdLmdldDtcblx0XHRcdFx0ZGVzY3JpcHRvclsgaSBdLmdldC4kJG5hbWUgPSBpO1xuXHRcdFx0XHRkZXNjcmlwdG9yWyBpIF0uZ2V0LiQkb3duZXIgPSByVmFsLnByb3RvdHlwZTtcblx0XHRcdH1cblxuXHRcdFx0aWYoIGRlc2NyaXB0b3JbIGkgXS5zZXQgKSB7XG5cdFx0XHRcdHJWYWwucHJvdG90eXBlLiQkc2V0dGVyc1sgaSBdID0gZGVzY3JpcHRvclsgaSBdLnNldDtcblx0XHRcdFx0ZGVzY3JpcHRvclsgaSBdLnNldC4kJG5hbWUgPSBpO1xuXHRcdFx0XHRkZXNjcmlwdG9yWyBpIF0uc2V0LiQkb3duZXIgPSByVmFsLnByb3RvdHlwZTtcdFxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyVmFsLnByb3RvdHlwZVsgaSBdID0gZGVzY3JpcHRvclsgaSBdO1xuXHRcdH1cblx0fVxuXG5cdC8vIHRoaXMgd2lsbCBiZSB1c2VkIHRvIGNoZWNrIGlmIHRoZSBjYWxsZXIgZnVuY3Rpb24gaXMgdGhlIGNvbnNydWN0b3Jcblx0clZhbC4kJGlzQ29uc3RydWN0b3IgPSB0cnVlO1xuXG5cblx0Ly8gbm93IHdlJ2xsIGNoZWNrIGludGVyZmFjZXNcblx0Zm9yKCB2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKysgKSB7XG5cdFx0YXJndW1lbnRzWyBpIF0uY29tcGFyZSggclZhbCApO1xuXHR9XG5cblx0cmV0dXJuIHJWYWw7XG59O1x0XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IENsYXNzOyIsInZhciBDbGFzcyA9IHJlcXVpcmUoJy4vQ2xhc3MnKTtcblxuLyoqXG5UaGUgRW51bSBjbGFzcywgd2hpY2ggaG9sZHMgYSBzZXQgb2YgY29uc3RhbnRzIGluIGEgZml4ZWQgb3JkZXIuXG5cbiMjIyMgQmFzaWMgVXNhZ2U6XG5cdHZhciBEYXlzID0gbmV3IEVudW0oWyBcblx0XHRcdCdNb25kYXknLFxuXHRcdFx0J1R1ZXNkYXknLFxuXHRcdFx0J1dlZG5lc2RheScsXG5cdFx0XHQnVGh1cnNkYXknLFxuXHRcdFx0J0ZyaWRheScsXG5cdFx0XHQnU2F0dXJkYXknLFxuXHRcdFx0J1N1bmRheSdcblx0XSk7XG5cblx0Y29uc29sZS5sb2coIERheXMuTW9uZGF5ID09PSBEYXlzLlR1ZXNkYXkgKTsgLy8gPT4gZmFsc2Vcblx0Y29uc29sZS5sb2coIERheXMudmFsdWVzWzFdICkgLy8gPT4gdGhlICdUdWVzZGF5JyBzeW1ib2wgb2JqZWN0XG5cbkVhY2ggZW51bSAqc3ltYm9sKiBpcyBhbiBvYmplY3Qgd2hpY2ggZXh0ZW5kcyBmcm9tIHRoZSBge3sjY3Jvc3NMaW5rIFwiRW51bS5CYXNlXCJ9fXt7L2Nyb3NzTGlua319YCBcbmNsYXNzLiBUaGlzIGJhc2VcbmNsYXNzIGhhcyAgcHJvcGVydGllcyBsaWtlIGB7eyNjcm9zc0xpbmsgXCJFbnVtLkJhc2UvdmFsdWU6cHJvcGVydHlcIn19e3svY3Jvc3NMaW5rfX1gICBcbmFuZCBge3sjY3Jvc3NMaW5rIFwiRW51bS5CYXNlL29yZGluYWw6cHJvcGVydHlcIn19e3svY3Jvc3NMaW5rfX1gLiBcbl9fYHZhbHVlYF9fIGlzIGEgc3RyaW5nXG53aGljaCBtYXRjaGVzIHRoZSBlbGVtZW50IG9mIHRoZSBhcnJheS4gX19gb3JkaW5hbGBfXyBpcyB0aGUgaW5kZXggdGhlIFxuc3ltYm9sIHdhcyBkZWZpbmVkIGF0IGluIHRoZSBlbnVtZXJhdGlvbi4gXG5cblRoZSByZXN1bHRpbmcgRW51bSBvYmplY3QgKGluIHRoZSBhYm92ZSBjYXNlLCBEYXlzKSBhbHNvIGhhcyBzb21lIHV0aWxpdHkgbWV0aG9kcyxcbmxpa2UgZnJvbVZhbHVlKHN0cmluZykgYW5kIHRoZSB2YWx1ZXMgcHJvcGVydHkgdG8gYWNjZXNzIHRoZSBhcnJheSBvZiBzeW1ib2xzLlxuXG5Ob3RlIHRoYXQgdGhlIHZhbHVlcyBhcnJheSBpcyBmcm96ZW4sIGFzIGlzIGVhY2ggc3ltYm9sLiBUaGUgcmV0dXJuZWQgb2JqZWN0IGlzIFxuX19ub3RfXyBmcm96ZW4sIGFzIHRvIGFsbG93IHRoZSB1c2VyIHRvIG1vZGlmeSBpdCAoaS5lLiBhZGQgXCJzdGF0aWNcIiBtZW1iZXJzKS5cblxuQSBtb3JlIGFkdmFuY2VkIEVudW0gdXNhZ2UgaXMgdG8gc3BlY2lmeSBhIGJhc2UgRW51bSBzeW1ib2wgY2xhc3MgYXMgdGhlIHNlY29uZFxucGFyYW1ldGVyLiBUaGlzIGlzIHRoZSBjbGFzcyB0aGF0IGVhY2ggc3ltYm9sIHdpbGwgdXNlLiBUaGVuLCBpZiBhbnkgc3ltYm9sc1xuYXJlIGdpdmVuIGFzIGFuIEFycmF5IChpbnN0ZWFkIG9mIHN0cmluZyksIGl0IHdpbGwgYmUgdHJlYXRlZCBhcyBhbiBhcnJheSBvZiBhcmd1bWVudHNcbnRvIHRoZSBiYXNlIGNsYXNzLiBUaGUgZmlyc3QgYXJndW1lbnQgc2hvdWxkIGFsd2F5cyBiZSB0aGUgZGVzaXJlZCBrZXkgb2YgdGhhdCBzeW1ib2wuXG5cbk5vdGUgdGhhdCBfX2BvcmRpbmFsYF9fIGlzIGFkZGVkIGR5bmFtaWNhbGx5XG5hZnRlciB0aGUgc3ltYm9sIGlzIGNyZWF0ZWQ7IHNvIGl0IGNhbid0IGJlIHVzZWQgaW4gdGhlIHN5bWJvbCdzIGNvbnN0cnVjdG9yLlxuXG4jIyMjIEFkdmFuY2VkIFVzYWdlXG5cdHZhciBEYXlzID0gbmV3IEVudW0oWyBcblx0XHRcdCdNb25kYXknLFxuXHRcdFx0J1R1ZXNkYXknLFxuXHRcdFx0J1dlZG5lc2RheScsXG5cdFx0XHQnVGh1cnNkYXknLFxuXHRcdFx0J0ZyaWRheScsXG5cdFx0XHRbJ1NhdHVyZGF5JywgdHJ1ZV0sXG5cdFx0XHRbJ1N1bmRheScsIHRydWVdXG5cdFx0XSwgbmV3IENsYXNzKHtcblx0XHRcdFxuXHRcdFx0RXh0ZW5kczogRW51bS5CYXNlLFxuXG5cdFx0XHRpc1dlZWtlbmQ6IGZhbHNlLFxuXG5cdFx0XHRpbml0aWFsaXplOiBmdW5jdGlvbigga2V5LCBpc1dlZWtlbmQgKSB7XG5cdFx0XHRcdC8vcGFzcyB0aGUgc3RyaW5nIHZhbHVlIGFsb25nIHRvIHBhcmVudCBjb25zdHJ1Y3RvclxuXHRcdFx0XHR0aGlzLnBhcmVudCgga2V5ICk7IFxuXHRcdFx0XHRcblx0XHRcdFx0Ly9nZXQgYSBib29sZWFuIHByaW1pdGl2ZSBvdXQgb2YgdGhlIHRydXRoeS9mYWxzeSB2YWx1ZVxuXHRcdFx0XHR0aGlzLmlzV2VrZWVuZCA9IEJvb2xlYW4oaXNXZWVrZW5kKTtcblx0XHRcdH1cblx0XHR9KVxuXHQpO1xuXG5cdGNvbnNvbGUubG9nKCBEYXlzLlNhdHVyZGF5LmlzV2Vla2VuZCApOyAvLyA9PiB0cnVlXG5cblRoaXMgbWV0aG9kIHdpbGwgdGhyb3cgYW4gZXJyb3IgaWYgeW91IHRyeSB0byBzcGVjaWZ5IGEgY2xhc3Mgd2hpY2ggZG9lc1xubm90IGV4dGVuZCBmcm9tIGB7eyNjcm9zc0xpbmsgXCJFbnVtLkJhc2VcIn19e3svY3Jvc3NMaW5rfX1gLlxuXG4jIyMjIFNob3J0aGFuZFxuXG5Zb3UgY2FuIGFsc28gb21pdCB0aGUgYG5ldyBDbGFzc2AgYW5kIHBhc3MgYSBkZXNjcmlwdG9yLCB0aHVzIHJlZHVjaW5nIHRoZSBuZWVkIHRvIFxuZXhwbGljaXRseSByZXF1aXJlIHRoZSBDbGFzcyBtb2R1bGUuIEZ1cnRoZXIsIGlmIHlvdSBhcmUgcGFzc2luZyBhIGRlc2NyaXB0b3IgdGhhdFxuZG9lcyBub3QgaGF2ZSBgRXh0ZW5kc2AgZGVmaW5lZCwgaXQgd2lsbCBkZWZhdWx0IHRvXG5ge3sjY3Jvc3NMaW5rIFwiRW51bS5CYXNlXCJ9fXt7L2Nyb3NzTGlua319YC5cblxuXHR2YXIgSWNvbnMgPSBuZXcgRW51bShbIFxuXHRcdFx0J09wZW4nLFxuXHRcdFx0J1NhdmUnLFxuXHRcdFx0J0hlbHAnLFxuXHRcdFx0J05ldydcblx0XHRdLCB7XG5cblx0XHRcdHBhdGg6IGZ1bmN0aW9uKCByZXRpbmEgKSB7XG5cdFx0XHRcdHJldHVybiBcImljb25zL1wiICsgdGhpcy52YWx1ZS50b0xvd2VyQ2FzZSgpICsgKHJldGluYSA/IFwiQDJ4XCIgOiBcIlwiKSArIFwiLnBuZ1wiO1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXG5AY2xhc3MgRW51bVxuQGNvbnN0cnVjdG9yIFxuQHBhcmFtIHtBcnJheX0gZWxlbWVudHMgQW4gYXJyYXkgb2YgZW51bWVyYXRlZCBjb25zdGFudHMsIG9yIGFyZ3VtZW50cyB0byBiZSBwYXNzZWQgdG8gdGhlIHN5bWJvbFxuQHBhcmFtIHtDbGFzc30gYmFzZSBDbGFzcyB0byBiZSBpbnN0YW50aWF0ZWQgZm9yIGVhY2ggZW51bSBzeW1ib2wsIG11c3QgZXh0ZW5kIFxuYHt7I2Nyb3NzTGluayBcIkVudW0uQmFzZVwifX17ey9jcm9zc0xpbmt9fWBcbiovXG52YXIgRW51bVJlc3VsdCA9IG5ldyBDbGFzcyh7XG5cblx0LyoqXG5cdEFuIGFycmF5IG9mIHRoZSBlbnVtZXJhdGVkIHN5bWJvbCBvYmplY3RzLlxuXG5cdEBwcm9wZXJ0eSB2YWx1ZXNcblx0QHR5cGUgQXJyYXlcblx0Ki9cblx0dmFsdWVzOiBudWxsLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnZhbHVlcyA9IFtdO1xuXHR9LFxuXG5cdHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIFwiWyBcIit0aGlzLnZhbHVlcy5qb2luKFwiLCBcIikrXCIgXVwiO1xuXHR9LFxuXG5cdC8qKlxuXHRMb29rcyBmb3IgdGhlIGZpcnN0IHN5bWJvbCBpbiB0aGlzIGVudW0gd2hvc2UgJ3ZhbHVlJyBtYXRjaGVzIHRoZSBzcGVjaWZpZWQgc3RyaW5nLiBcblx0SWYgbm9uZSBhcmUgZm91bmQsIHRoaXMgbWV0aG9kIHJldHVybnMgbnVsbC5cblxuXHRAbWV0aG9kIGZyb21WYWx1ZVxuXHRAcGFyYW0ge1N0cmluZ30gc3RyIHRoZSBzdHJpbmcgdG8gbG9vayB1cFxuXHRAcmV0dXJuIHtFbnVtLkJhc2V9IHJldHVybnMgYW4gZW51bSBzeW1ib2wgZnJvbSB0aGUgZ2l2ZW4gJ3ZhbHVlJyBzdHJpbmcsIG9yIG51bGxcblx0Ki9cblx0ZnJvbVZhbHVlOiBmdW5jdGlvbiAoc3RyKSB7XG5cdFx0Zm9yICh2YXIgaT0wOyBpPHRoaXMudmFsdWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoc3RyID09PSB0aGlzLnZhbHVlc1tpXS52YWx1ZSlcblx0XHRcdFx0cmV0dXJuIHRoaXMudmFsdWVzW2ldO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufSk7XG5cblxuXG52YXIgRW51bSA9IGZ1bmN0aW9uICggZWxlbWVudHMsIGJhc2UgKSB7XG5cdGlmICghYmFzZSlcblx0XHRiYXNlID0gRW51bS5CYXNlO1xuXG5cdC8vVGhlIHVzZXIgaXMgb21pdHRpbmcgQ2xhc3MsIGluamVjdCBpdCBoZXJlXG5cdGlmICh0eXBlb2YgYmFzZSA9PT0gXCJvYmplY3RcIikge1xuXHRcdC8vaWYgd2UgZGlkbid0IHNwZWNpZnkgYSBzdWJjbGFzcy4uIFxuXHRcdGlmICghYmFzZS5FeHRlbmRzKVxuXHRcdFx0YmFzZS5FeHRlbmRzID0gRW51bS5CYXNlO1xuXHRcdGJhc2UgPSBuZXcgQ2xhc3MoYmFzZSk7XG5cdH1cblx0XG5cdHZhciByZXQgPSBuZXcgRW51bVJlc3VsdCgpO1xuXG5cdGZvciAodmFyIGk9MDsgaTxlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBlID0gZWxlbWVudHNbaV07XG5cblx0XHR2YXIgb2JqID0gbnVsbDtcblx0XHR2YXIga2V5ID0gbnVsbDtcblxuXHRcdGlmICghZSlcblx0XHRcdHRocm93IFwiZW51bSB2YWx1ZSBhdCBpbmRleCBcIitpK1wiIGlzIHVuZGVmaW5lZFwiO1xuXG5cdFx0aWYgKHR5cGVvZiBlID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRrZXkgPSBlO1xuXHRcdFx0b2JqID0gbmV3IGJhc2UoZSk7XG5cdFx0XHRyZXRbZV0gPSBvYmo7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICghQXJyYXkuaXNBcnJheShlKSlcblx0XHRcdFx0dGhyb3cgXCJlbnVtIHZhbHVlcyBtdXN0IGJlIFN0cmluZyBvciBhbiBhcnJheSBvZiBhcmd1bWVudHNcIjtcblxuXHRcdFx0a2V5ID0gZVswXTtcblxuXHRcdFx0Ly9maXJzdCBhcmcgaXMgaWdub3JlZFxuXHRcdFx0ZS51bnNoaWZ0KG51bGwpO1xuXHRcdFx0b2JqID0gbmV3IChGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5hcHBseShiYXNlLCBlKSk7XG5cblx0XHRcdHJldFtrZXldID0gb2JqO1xuXHRcdH1cblxuXHRcdGlmICggIShvYmogaW5zdGFuY2VvZiBFbnVtLkJhc2UpIClcblx0XHRcdHRocm93IFwiZW51bSBiYXNlIGNsYXNzIG11c3QgYmUgYSBzdWJjbGFzcyBvZiBFbnVtLkJhc2VcIjtcblxuXHRcdG9iai5vcmRpbmFsID0gaTtcblx0XHRyZXQudmFsdWVzLnB1c2gob2JqKTtcblx0XHRPYmplY3QuZnJlZXplKG9iaik7XG5cdH07XG5cblx0Ly93ZSBTSE9VTEQgZnJlZXplIHRoZSByZXR1cnJuZWQgb2JqZWN0LCBidXQgbW9zdCBKUyBkZXZlbG9wZXJzXG5cdC8vYXJlbid0IGV4cGVjdGluZyBhbiBvYmplY3QgdG8gYmUgZnJvemVuLCBhbmQgdGhlIGJyb3dzZXJzIGRvbid0IGFsd2F5cyB3YXJuIHVzLlxuXHQvL0l0IGp1c3QgY2F1c2VzIGZydXN0cmF0aW9uLCBlLmcuIGlmIHlvdSdyZSB0cnlpbmcgdG8gYWRkIGEgc3RhdGljIG9yIGNvbnN0YW50XG5cdC8vdG8gdGhlIHJldHVybmVkIG9iamVjdC5cblxuXHQvLyBPYmplY3QuZnJlZXplKHJldCk7XG5cdE9iamVjdC5mcmVlemUocmV0LnZhbHVlcyk7XG5cdHJldHVybiByZXQ7XG59O1xuXG5cbi8qKlxuXG5UaGUgYmFzZSB0eXBlIGZvciBFbnVtIHN5bWJvbHMuIFN1YmNsYXNzZXMgY2FuIGV4dGVuZFxudGhpcyB0byBpbXBsZW1lbnQgbW9yZSBmdW5jdGlvbmFsaXR5IGZvciBlbnVtIHN5bWJvbHMuXG5cbkBjbGFzcyBFbnVtLkJhc2VcbkBjb25zdHJ1Y3RvciBcbkBwYXJhbSB7U3RyaW5nfSBrZXkgdGhlIHN0cmluZyB2YWx1ZSBmb3IgdGhpcyBzeW1ib2xcbiovXG5FbnVtLkJhc2UgPSBuZXcgQ2xhc3Moe1xuXG5cdC8qKlxuXHRUaGUgc3RyaW5nIHZhbHVlIG9mIHRoaXMgc3ltYm9sLlxuXHRAcHJvcGVydHkgdmFsdWVcblx0QHR5cGUgU3RyaW5nXG5cdCovXG5cdHZhbHVlOiB1bmRlZmluZWQsXG5cblx0LyoqXG5cdFRoZSBpbmRleCBvZiB0aGlzIHN5bWJvbCBpbiBpdHMgZW51bWVyYXRpb24gYXJyYXkuXG5cdEBwcm9wZXJ0eSBvcmRpbmFsXG5cdEB0eXBlIE51bWJlclxuXHQqL1xuXHRvcmRpbmFsOiB1bmRlZmluZWQsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKCBrZXkgKSB7XG5cdFx0dGhpcy52YWx1ZSA9IGtleTtcblx0fSxcblxuXHR0b1N0cmluZzogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMudmFsdWUgfHwgdGhpcy5wYXJlbnQoKTtcblx0fSxcblxuXHR2YWx1ZU9mOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy52YWx1ZSB8fCB0aGlzLnBhcmVudCgpO1xuXHR9XG59KTtcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gRW51bTtcbiIsIlxudmFyIEludGVyZmFjZSA9IGZ1bmN0aW9uKCBkZXNjcmlwdG9yICkge1xuXHR0aGlzLmRlc2NyaXB0b3IgPSBkZXNjcmlwdG9yO1xufTtcblxuSW50ZXJmYWNlLnByb3RvdHlwZS5kZXNjcmlwdG9yID0gbnVsbDtcblxuSW50ZXJmYWNlLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24oIGNsYXNzVG9DaGVjayApIHtcblxuXHRmb3IoIHZhciBpICBpbiB0aGlzLmRlc2NyaXB0b3IgKSB7XG5cdFx0Ly8gRmlyc3Qgd2UnbGwgY2hlY2sgaWYgdGhpcyBwcm9wZXJ0eSBleGlzdHMgb24gdGhlIGNsYXNzXG5cdFx0aWYoIGNsYXNzVG9DaGVjay5wcm90b3R5cGVbIGkgXSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHR0aHJvdyAnSU5URVJGQUNFIEVSUk9SOiAnICsgaSArICcgaXMgbm90IGRlZmluZWQgaW4gdGhlIGNsYXNzJztcblxuXHRcdC8vIFNlY29uZCB3ZSdsbCBjaGVjayB0aGF0IHRoZSB0eXBlcyBleHBlY3RlZCBtYXRjaFxuXHRcdH0gZWxzZSBpZiggdHlwZW9mIHRoaXMuZGVzY3JpcHRvclsgaSBdICE9IHR5cGVvZiBjbGFzc1RvQ2hlY2sucHJvdG90eXBlWyBpIF0gKSB7XG5cblx0XHRcdHRocm93ICdJTlRFUkZBQ0UgRVJST1I6IEludGVyZmFjZSBhbmQgY2xhc3MgZGVmaW5lIGl0ZW1zIG9mIGRpZmZlcmVudCB0eXBlIGZvciAnICsgaSArIFxuXHRcdFx0XHQgICdcXG5pbnRlcmZhY2VbICcgKyBpICsgJyBdID09ICcgKyB0eXBlb2YgdGhpcy5kZXNjcmlwdG9yWyBpIF0gK1xuXHRcdFx0XHQgICdcXG5jbGFzc1sgJyArIGkgKyAnIF0gPT0gJyArIHR5cGVvZiBjbGFzc1RvQ2hlY2sucHJvdG90eXBlWyBpIF07XG5cblx0XHQvLyBUaGlyZCBpZiB0aGlzIHByb3BlcnR5IGlzIGEgZnVuY3Rpb24gd2UnbGwgY2hlY2sgdGhhdCB0aGV5IGV4cGVjdCB0aGUgc2FtZSBhbW91bnQgb2YgcGFyYW1ldGVyc1xuXHRcdH0gZWxzZSBpZiggdHlwZW9mIHRoaXMuZGVzY3JpcHRvclsgaSBdID09ICdmdW5jdGlvbicgJiYgY2xhc3NUb0NoZWNrLnByb3RvdHlwZVsgaSBdLmxlbmd0aCAhPSB0aGlzLmRlc2NyaXB0b3JbIGkgXS5sZW5ndGggKSB7XG5cblx0XHRcdHRocm93ICdJTlRFUkZBQ0UgRVJST1I6IEludGVyZmFjZSBhbmQgY2xhc3MgZXhwZWN0IGEgZGlmZmVyZW50IGFtb3VudCBvZiBwYXJhbWV0ZXJzIGZvciB0aGUgZnVuY3Rpb24gJyArIGkgK1xuXHRcdFx0XHQgICdcXG5FWFBFQ1RFRDogJyArIHRoaXMuZGVzY3JpcHRvclsgaSBdLmxlbmd0aCArIFxuXHRcdFx0XHQgICdcXG5SRUNFSVZFRDogJyArIGNsYXNzVG9DaGVjay5wcm90b3R5cGVbIGkgXS5sZW5ndGg7XG5cblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IEludGVyZmFjZTsiLCIvL0V4cG9ydHMgYSBmdW5jdGlvbiBuYW1lZCAncGFyZW50J1xubW9kdWxlLmV4cG9ydHMucGFyZW50ID0gZnVuY3Rpb24oKSB7XG5cdC8vIGlmIHRoZSBjdXJyZW50IGZ1bmN0aW9uIGNhbGxpbmcgaXMgdGhlIGNvbnN0cnVjdG9yXG5cdGlmKCB0aGlzLnBhcmVudC5jYWxsZXIuJCRpc0NvbnN0cnVjdG9yICkge1xuXHRcdHZhciBwYXJlbnRGdW5jdGlvbiA9IHRoaXMucGFyZW50LmNhbGxlci4kJHBhcmVudENvbnN0cnVjdG9yO1xuXHR9IGVsc2Uge1xuXHRcdGlmKCB0aGlzLnBhcmVudC5jYWxsZXIuJCRuYW1lICkge1xuXHRcdFx0dmFyIGNhbGxlck5hbWUgPSB0aGlzLnBhcmVudC5jYWxsZXIuJCRuYW1lO1xuXHRcdFx0dmFyIGlzR2V0dGVyID0gdGhpcy5wYXJlbnQuY2FsbGVyLiQkb3duZXIuJCRnZXR0ZXJzWyBjYWxsZXJOYW1lIF07XG5cdFx0XHR2YXIgaXNTZXR0ZXIgPSB0aGlzLnBhcmVudC5jYWxsZXIuJCRvd25lci4kJHNldHRlcnNbIGNhbGxlck5hbWUgXTtcblxuXHRcdFx0aWYoIGFyZ3VtZW50cy5sZW5ndGggPT0gMSAmJiBpc1NldHRlciApIHtcblx0XHRcdFx0dmFyIHBhcmVudEZ1bmN0aW9uID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKCB0aGlzLnBhcmVudC5jYWxsZXIuJCRvd25lciApLiQkc2V0dGVyc1sgY2FsbGVyTmFtZSBdO1xuXG5cdFx0XHRcdGlmKCBwYXJlbnRGdW5jdGlvbiA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdHRocm93ICdObyBzZXR0ZXIgZGVmaW5lZCBpbiBwYXJlbnQnO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYoIGFyZ3VtZW50cy5sZW5ndGggPT0gMCAmJiBpc0dldHRlciApIHtcblx0XHRcdFx0dmFyIHBhcmVudEZ1bmN0aW9uID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKCB0aGlzLnBhcmVudC5jYWxsZXIuJCRvd25lciApLiQkZ2V0dGVyc1sgY2FsbGVyTmFtZSBdO1xuXG5cdFx0XHRcdGlmKCBwYXJlbnRGdW5jdGlvbiA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdHRocm93ICdObyBnZXR0ZXIgZGVmaW5lZCBpbiBwYXJlbnQnO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYoIGlzU2V0dGVyIHx8IGlzR2V0dGVyICkge1xuXHRcdFx0XHR0aHJvdyAnSW5jb3JyZWN0IGFtb3VudCBvZiBhcmd1bWVudHMgc2VudCB0byBnZXR0ZXIgb3Igc2V0dGVyJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBwYXJlbnRGdW5jdGlvbiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiggdGhpcy5wYXJlbnQuY2FsbGVyLiQkb3duZXIgKVsgY2FsbGVyTmFtZSBdO1x0XG5cblx0XHRcdFx0aWYoIHBhcmVudEZ1bmN0aW9uID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0dGhyb3cgJ05vIHBhcmVudCBmdW5jdGlvbiBkZWZpbmVkIGZvciAnICsgY2FsbGVyTmFtZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyAnWW91IGNhbm5vdCBjYWxsIHBhcmVudCBoZXJlJztcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcGFyZW50RnVuY3Rpb24uYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xufTsiXX0=
;