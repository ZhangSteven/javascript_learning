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



// Test exercise 1: array
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



// Test exercise 2: closure
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



// Test exercise 3: comments
program = `#hello
	x`;
console.assert(JSON.stringify(parse(program)) == JSON.stringify(
	{type: 'word', name: 'x'}));

program = `f# plusOne
	# this line is comments
	(x)`;
console.assert(JSON.stringify(parse(program)) == JSON.stringify(
	{type: 'apply', 
		operator: {type: 'word', name: 'f'}, 
		args: [{type: 'word', name: 'x'}]
	}));



// Test exercise 4: set()
program = `	# in local scope
	do(
		define(x, 4),
		set(x, 88),
		print(x)
	)`;
console.assert(run(program) == 88);

program = ` # 2 scopes, both add() and setx() are in level 2 scope
	do(
		define(x, 0),
		define(setx, fun(value, set(x, value))),
		define(add, fun(a, b, +(a, b))),
		print(+(add(50, setx(50)), x))
	)`;
console.assert(run(program) == 150);

program = ` # 3 scopes, setx() is in level 3 scope
	do(
		define(x, 0),
		define(addset, fun(value, 
							do(
								define(setx, fun(value, set(x, value))),
								+(value, setx(value))
							)
						)
				),
		print(+(addset(50), x))
	)`;
console.assert(run(program) == 150);

// doomed to fail
program = `
	do(
		define(x, 4),
		set(y, 88)
	)
`;
try{
	run(program)
} catch(exception){
	console.assert(exception instanceof ReferenceError);
}