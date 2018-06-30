/*
	Chapter 12. Project: A programming language.

	Put some testing code here.
*/
"use strict"



// Test skip space and comments
let {skipSpace} = require('./ch12');
let string = '	 hello ok';
console.assert(skipSpace(string) == 'hello ok');

string = '	# ok test';
console.assert(skipSpace(string) == '');

string = '  text # ok ';
console.assert(skipSpace(string) == 'text ');

string = '  "text" # ok ';
console.assert(skipSpace(string) == '"text" ');

string = '  "text#ok" # ok ';
console.assert(skipSpace(string) == '"text#ok" ');

string = '  "text#ok" # ok "#123" ';
console.assert(skipSpace(string) == '"text#ok" ');

string = `	 hello ok
	hello 2`;
let s2 = `hello ok
	hello 2`;
console.assert(skipSpace(string) == s2);

string = `	# ok test
	a = 2 # ok 33 `;
s2 = `a = 2 `;
console.assert(skipSpace(string) == s2);

string = `	test # ok
	a = 2`;
s2 = `test 
	a = 2`;
console.assert(skipSpace(string) == s2);
