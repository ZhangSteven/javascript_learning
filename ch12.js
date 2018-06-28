/*
	Chapter 12. Project: A programming language.

	Create an interpreter for the mini language 'Egg'.
*/
"use strict"



/*
	Parse expression.

	An expression in Egg looks like (white spaces doesn't matter to interpreter)

	do(define(x, 10),
		if(>(x, 5),
			print("large"),
			print("small")
		)
	)

	The parser we create for the configuration file in Chapter 9 has a simple
	structure: it splits the input into lines and handle those lines one at
	a time. There are only a few forms that a line is allowed to have.

	Here we need a different approach. Expressions are not separated into
	lines, and they have a recursive structure. Application expressions
	contain other expressions. Therefore, we'll create a parser function
	that is recursive in a way that reflects the recursive nature of the
	language.
*/

/*
	An Egg program is a collection of expressions, in 3 types:

	A 'word', for identifiers (a string like 'x'), has a 'name' property.
	A 'value', for values (a number of string 5 or 'hello'), has a 'value' 
		property.
	An 'application', like 'define(x, 5)', has two properties, 'operator'
		and 'args'. An expression of type 'application' is in the form of
		<operator>(...)

	Values of the properties can be sub	expressions which will be parsed 
	recursively. The below expression,

	do(define(x, 10),
	   if(>(x, 5),
	       print("large"),
		   print("small")
	   )
	)

	can be parsed as:

	do (type:'apply', operator: {type:'word', name:'do'}, args: [...])
	|
	|
	|--- define (type:'apply', operator:{type:'word', name:'define'}, args: [...])
	|     |
	|     |--- x  ({type: 'word', name: 'x'})
	|     |--- 10 ({type: 'value', value: 10})
	|      
	|      
	|--- if (type:'apply', operator:{type:'word', name:'if'}, args: [...]) 
	      |
	      |
	      |--- > (type:'apply', operator:..., args: [...])
	      |    |
	      |    |--- x  ({type: 'word', name: 'x'})
	      |    |--- 5  ({type: 'value', value: 5})
	      |
	      |
	      |--- print (type:'apply', operator:..., args: [...])
	      |    |
	      |    |--- "large"  ({type: 'value', value: 'large'})
	      |
	      |
	      |--- print (type:'apply', operator:..., args: [...])
	           |
	           |--- "small"  ({type: 'value', value: 'small'})

*/
function parseExpression(program){
	program = skipSpace(program);
	let match, expr;
	if (match = /^"([^"]*)"/.exec(program)){
		expr = {type: 'value', value: match[1]};
	} else if (match = /^\d+\b/.exec(program)){
		expr = {type: 'value', value: Number(match[0])};
	} else if (match = /^[^\s(),"]+/.exec(program)){
		expr = {type: 'word', name: match[0]};
	} else {
		throw new SyntaxError('Unexpected syntax: ' + program);
	}

	// console.log(expr, program.slice(match[0].length));
	return parseApply(expr, program.slice(match[0].length));
}



function skipSpace(string){
	let first = string.search(/\S/);
	if (first == -1) return '';
	return string.slice(first);
}



/*
	Parse expression of type 'application'.
*/
function parseApply(expr, program){
	program = skipSpace(program);

	// still in an application expression, return as is.
	if (program[0] != '('){
		return {expr: expr, rest: program};
	}

	// remove leading '('
	program = skipSpace(program.slice(1));
	expr = {type: 'apply', operator: expr, args: []};

	while (program[0] != ')'){
		let arg = parseExpression(program);
		expr.args.push(arg.expr);
		program = skipSpace(arg.rest);
		if (program[0] == ','){
			program = skipSpace(program.slice(1));
		} else if (program[0] != ')'){
			throw new SyntaxError('Expected "," or ")"');
		}
	}
	return parseApply(expr, program.slice(1));
}



function parse(program){
	let {expr, rest} = parseExpression(program);
	if (skipSpace(rest).length > 0){
		throw new SyntaxError('Unexpected text after program');
	}
	return expr;
}



/*
	The evaluator.

	Given a syntax tree and a scope object that associates names with
	values, the function will evaluate the expression that the tree
	represents and return the value that it produces.
*/
const specialForms = Object.create(null);

function evaluate(expr, scope){
	if (expr.type == 'value'){
		return expr.value;
	} else if (expr.type == 'word'){
		if (expr.name in scope){
			return scope[expr.name];
		} else {
			throw new ReferenceError(`Undefined binding ${expr.name}`);
		}
	} else if (expr.type == 'apply'){
		let {operator, args} = expr;
		if (operator.type == 'word' && operator.name in specialForms){
			return specialForms[operator.name](expr.args, scope);
		} else {
			let op = evaluate(operator, scope);
			if (typeof op == 'function'){
				return op(...args.map(arg => evaluate(arg, scope)));
			} else {
				throw new TypeError('Apply a non-function');
			}
		}
	}
}



/*
	Special forms.

	Define keywords, operators, built-in functions here.
*/

/*
	if: more like Javascript's ?: operator

	It does not treat zero or empty strings as false, only the exact false.

	The reason 'if' is treated as a special form rather than a function, is
	because all arguments to functions are evaluated before the function is
	called, whereas if should evaluate only either its second or third
	argument, depending on the value of the first.
*/
specialForms.if = (args, scope) => {
	if (args.length != 3){
		throw new SyntaxError('Wrong number of args to if');
	} else if (evaluate(args[0], scope) !== false){
		return evaluate(args[1], scope);
	} else {
		return evaluate(args[2], scope);
	}
};



/*
	while:

	Note that there is no 'break' statement.
*/
specialForms.while = (args, scope) => {
	if (args.length != 2){
		throw new SyntaxError('Wrong number of args to while');
	}
	while (evaluate(args[0], scope) !== false){
		evaluate(args[1], scope);
	}

	// Since undefined does not exist in Egg, we return false for lack
	// of a meaningful result.
	return false;
};



/*
	do: a basic building block, which executes all its arguments from
		top to bottom. Its value is the value produced by the last
		argument.
*/
specialForms.do = (args, scope) => {
	let value = false;
	for (let arg of args){
		value = evaluate(arg, scope);
	}
	return value;
};



/*
	define: create bindings or give them new values

	Because define, like everything, is an expression, it must return a
	value. So let it return the value that was assigned.
*/
specialForms.define = (args, scope) => {
	if (args.length != 2 || args[0].type != 'word'){
		throw new SyntaxError('Incorrect use of define');
	}
	let value = evaluate(args[1], scope);
	scope[args[0].name] = value;
};



/*
	The environment

	The scope accepted by evaluate is an object with properties whose
	names correspond to binding names and whose values correspond to
	the values those bindings are bound to. Let's define an object to
	represent the global scope.
*/
const topScope = Object.create(null);
topScope.true = true;
topScope.false = false;



exports.parse = parse;
exports.topScope = topScope;
exports.evaluate = evaluate;