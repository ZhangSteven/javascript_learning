/*
	Chapter 10. Modules
*/
"use strict"



// dummy code
console.log('in module ch10_module.js');



/*
	CommonJS modules.

	The main concept in CommonJS modules is a function called require. When you
	call this function with the module name of a dependency, it makes sure the
	module is loaded and returns its interface. A module puts its interface in
	the object bound to the name 'exports'.

	To use below code, we need to install the ordinal and date-names package
	first, via 'npm install <package_name>'.
*/
const ordinal = require('ordinal');
const {days, months} = require('date-names');

// export the module's interface
exports.formatDate = function(date, format){
	/*
	[Date] date, [String] format => [String]
	*/
	return format.replace(/YYYY|M(MMM)?|Do?|dddd/g, tag => {
		if (tag == 'YYYY') return date.getFullYear();
		if (tag == 'M') return date.getMonth();
		if (tag == 'MMMM') return months[date.getMonth()];
		if (tag == 'D') return date.getDate();
		if (tag == 'Do') return ordinal(date.getDate());
		if (tag == 'dddd') return days[date.getDay()];
	});
};	// ; is needed at the end of the statement

