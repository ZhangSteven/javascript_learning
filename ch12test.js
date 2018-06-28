/*
	Chapter 12. Project: A programming language.

	Put some testing code here.
*/
"use strict"



let {parse} = require('./ch12');
console.assert(JSON.stringify(parse('+ (a, 5)')) == JSON.stringify(
	{type: 'apply', 
		operator: {type: 'word', name: '+'}, 
		args: [{type: 'word', name: 'a'}, {type: 'value', value: 5}]}));

console.assert(JSON.stringify(parse('define(a, 5)(10)')) == JSON.stringify(
	{type: 'apply', 
		operator: {type: 'apply', 
					operator: {type: 'word', name: 'define'}, 
					args: [{type: 'word', name: 'a'}, {type: 'value', value: 5}]
		}, 
		args: [{type: 'value', value: 10}]
	}));



let {topScope, evaluate} = require('./ch12');
console.assert(evaluate(parse('if(true, false, true)'), topScope) === false);