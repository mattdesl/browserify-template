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