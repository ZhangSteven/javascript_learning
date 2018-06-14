/*
	Chapter 8. Modules
*/
"use strict"

/*
	Improvised modules.

	The old and obsolete way of separation and exposing an interface. It does
	not declare its dependencies.

	The below exposes an object as a result of a function call.
*/
const weekDay = function(){
	const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
					'Friday', 'Saturday'];
	return {
		name(number) {return names[number]},
		number(name) {return names.indexOf(name)}
	};
}();

console.log(weekDay.name(1));
console.log(weekDay.number('Sunday'));



/*
	Evaluating data as code.

	There are several ways to take data (a string of code) and run it as part
	of the current program.

	The most obvious way is the special operator 'eval', which will execute a
	string in the current scope. The is usually a bad idea because it breaks
	some of the properties that scopes normally have, e.g., it can mess up
	bindings.
*/
let x = 10;
function evalAndReturnX(code){
	eval(code);
	return x;
}
console.log(evalAndReturnX('var x = 2'));	// 10, why???
console.log(x);	// 10
console.log(evalAndReturnX('console.log("888")'));	// 888, 10



/*
	Evaluating data as code.

	Using the Function constructor. It wraps the code in a function value so
	it gets its own scope and won't do odd things with other scopes.
*/
let plusXY = Function('x, y', 'return x + y;');
console.log(plusXY(4, 5));	// 9



/*
	CommonJS modules: function 'require'

	The main concept in CommonJS modules is a function called require. When you
	call this function with the module name of a dependency, it makes sure the
	module is loaded and returns its interface. A module puts its interface in
	the object bound to the name 'exports'.

	see 'ch10_module.js' for more information.

	We can see when require is used, it actually executes the code in the
	imported module.
*/
const {formatDate} = require('./ch10_module');	// load ch10_module.js from
												// local directory

console.log(formatDate(new Date('2018-5-22'), 'YYYY MMMM Do')); //2018 May, 22nd
console.log(formatDate(new Date('2018-6-21'), 'YYYY MMMM Do, dddd'));
console.log(formatDate(new Date('2018-8-17'), 'dddd the Do'));// Friday the 17th



/*
	A simplified implementation of 'require'.
*/
require2.cache = Object.create(null);
function require2(name){
	// if(!name in require2.cache){	//!name will be executed first
	if(!(name in require2.cache)){
		let code = readFile(name);
		let mod = {exports: {}};
		require2.cache[name] = mod;
		let wrapper = Function('require, exports, module', code);

		/*
		'mod.exports' is passed as variable 'exports' into the
		function's local scope, then inside the code, there must be
		a line stating:

		exports = ...;

		This updates mod.exports, also require2.cache[name].exports

		require2 is also passed as 'require' becuase if inside code
		there are 'require' statements, then it will call the function.
		*/
		wrapper(require2, mod.exports, mod);
	}
	return require2.cache[name].exports;
}


/*
	A made-up function that reads a file and return its content as a string.
*/
function readFile(name){
	return 'exports.plus10 = (x, y) => x + y + 10';	// pretend to read the file
}

const {plus10} = require2('some file name');
console.log(plus10(2, 3));



/*
	ECMAScript modules: keyword import, export
*/

