/*
	Chapter 12. Project: A programming language.

	Put some testing code here.
*/
"use strict"



// Test parsing
let {parse} = require('./ch12');
console.assert(JSON.stringify(parse('+ (a, 5)')) == JSON.stringify(
	{type: 'apply', 
		operator: {type: 'word', name: '+'}, 
		args: [{type: 'word', name: 'a'}, {type: 'value', value: 5}]
	}));

console.assert(JSON.stringify(parse('define(a, 5)(10)')) == JSON.stringify(
	{type: 'apply', 
		operator: {type: 'apply', 
					operator: {type: 'word', name: 'define'}, 
					args: [{type: 'word', name: 'a'}, {type: 'value', value: 5}]
		}, 
		args: [{type: 'value', value: 10}]
	}));



// Test parse and evaluate
let {run} = require('./ch12');
console.assert(run('if(true, false, true)') === false);

// a program to add 1, 2, ... 10
let program = `
	do(
		define(total, 0),
		define(count, 1),
		while( <(count, 11),
			do(
				define(total, +(total, count)),
				define(count, +(count, 1))
			)
		),
		print(total)
	)`;
console.assert(run(program) == 55);



// Test function
program = `
	do(
		define(plusOne, fun(a, +(a, 1))),
		print(plusOne(10))
	)`;
console.assert(run(program) == 11);

program = `
	do(
		define(pow,
			fun(base, exp,
				if(==(exp, 0), 1,
					*(base, pow(base, -(exp, 1)))
				)
			)
		),
		print(pow(2, 10))
	)`;
console.assert(run(program) == 1024);



// Test array
program = `
	do(
		define(sum, 
			fun(array,
				do(
					define(i, 0),
					define(sum, 0),
					while(<(i, length(array)),
						do(
							define(sum, +(sum, element(array, i))),
							define(i, +(i, 1))
						)
					),
					sum
				)
			)
		),
		define(x, 6),
		print(sum(array(1,x,+(x, 1))))
	)
`;
console.assert(run(program) == 14);



// Test closure
program = `
	do(
		define(f, 
			fun(a,
				fun(b,
					+(a, b)
				)
			)
		),
		print(f(4)(5))
	)
`;
console.assert(run(program) == 9);