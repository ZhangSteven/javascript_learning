/*
	Chapter 11. Asynchronous Programming
*/
"use strict"



/*
	Callback function.

	One approach to asynchronous programming is to make functions that
	perform a slow action take an extra argument, a callback function.
*/
setTimeout(() => console.log('Tick 500'), 500);	// when time out(500ms) do print

setTimeout(() => { 
	showResult(Math.random() > 0.5 ? true : false);
}, 200);

function showResult(result){
	console.log('Tick 200, result =', result);
}


/*
	Promise.

	When performing an asynchronous operation, such as reading a file or getting
	response from network, the result is not available until sometime in the
	future. To use that result, we can use a special object to wrap the future 
	value (the Promise object), then speicify what to do when the future value 
	is available.

	A promise constructor takes a function as argument. When the promise is
	created, JavaScript environment will pass two built-in functions 
	(resolve, reject) as input.

	myPromise = new Promise((resolve, reject) => {
	 ... do some asynchronous work ...
		... if successful, then ...
		   resolve(some_value);			// leas to a resolved promise
		... else ...
		   reject(some_other_value);	// leads to a rejected promise
	});

	The easiest way to create a promise is by calling Promise.resolve(value).
	It creates a new promise wrapping the value, if the value is already a
	promise, it's simply returned - otherwise, you get a new promise that
	immediately finishes with your value as its result.
*/
let fifteen = Promise.resolve(15);
fifteen.then(value => console.log('promised resolved to', value));

// a promise that is 50% chance resolved, else rejected.
const {decimalPlace} = require('./js_utility');
let myPromise = new Promise((resolve, reject) => {
	setTimeout(() => {
		let value = decimalPlace(Math.random(), 2);
		if (value > 0.5){
			resolve(`Tick 300, value = ${value}`);
		} else {
			reject(`Tick 300, value ${value} too small`);
		}
	}, 300);
});

/*
	Then then() function will be called after the promise is settled (resolved
	or rejected). We can register two functions to it, in the form:

	promise.then(value => {},		// resolve promise handler 
					reason => {}	// reject promise handler
				);
*/
myPromise.then(value => console.log(value), 
				reason => console.log('failed:', reason));



/*
	Chain of promises.

	Each then() or catch() call returns a new promise, so we can chain them
	together. If they don't return a value (promise) explicitly, then the
	return value is still a promise resolved to 'undefined'.

	If a promise is resolved, then the catch() call following it will be
	skipped. If a promise is rejected, then the then() call following it
	will be skipped if the then() has only a successful handler.
*/

// A rejected promise skips the then() call following it, because
new Promise((_, reject) => reject(new Error('Failed')))
	.then(value => console.log('successful handler 1'))	// skipped
	.catch(reason => {
		console.log('error handler 1 ' + reason);
		return 'nothing';	// a new promise returned
	})
	.then(value => console.log('successful handler 2:', value));

// A resolved promise skips the catch() call.
new Promise(resolve => resolve(0))
	.then(value => console.log('successful handler 3'))		// return a promise
															// of undefined
	.catch(reason => console.log('error handler 2 ' + reason))	// skipped
	.then(value => console.log('successful handler 4:', value));// undefined



/*
	Generator function.

	A generator function is a function that has its own state and freezes
	its local state each time it hits a 'yield' statement.

	Therefore a generator function is like an iterator which yields multiple
	values, the iterating stops when the function returns.
*/

// a generator function that never returns, yielding an infinite set of
// numbers.
function* powers(n){	
	for(let current=n;; current *= n){
		yield current;
	}
}

for (let x of powers(3)){
	if (x > 50) break;
	console.log(x);
}

// 3
// 9
// 27

/*
	An iterator example.

	If we want an iterator for a class, we need to create another class
	to store the state during iteration.
*/
class Group {
	constructor(elements){
		this.elements = elements;
	}
}

class GroupIterator {
	constructor(group){
		this.group = group;
		this.position = 0;
	}

	next(){
		if (this.position == this.group.elements.length){
			return {done: true};
		}

		let value = this.group.elements[this.position];
		this.position++;
		return {value: value, done: false};
	}
}

Group.prototype[Symbol.iterator] = function(){
	return new GroupIterator(this);
}

for (let x of new Group([1,2,3])){
	console.log('group iterator', x);
}


/*
	Instead of create a new class to store state, we can use a generator
	function.
*/

Group.prototype[Symbol.iterator] = function*(){
	for (let i=0; i<this.elements.length;i++){
		yield this.elements[i];
	}
}

for (let x of new Group([4,5,6])){
	console.log('group generator', x);
}



/*
	Handle exceptions in a callback function.

	When a callback function throws an exception, a normal try/catch like
	below won't work:

	try {
		setTimeout(() => { throw new Error('error'); }, 600);
	} catch (_){	// never catches
		console.log('something goes wrong');
	}

	Because the try/catch code is finished when we do setTimeout(), at that
	point of time, nothing goes wrong. However, when the callback throws
	an exception, there is no catch() clause in the asynchronous call stack
	to handle it.

	So, we should make sure the callback does not throw any exceptions on its
	own.
*/
const {isError} = require('./js_utility');
try {
	new Promise((resolve, reject) => {
		setTimeout(() => {
			let value = Math.floor(Math.random() * 10);
			if (value > 4) resolve(value);
			else reject(new Error('something failed'));
		}, 400);	
	}).then(result => callback(result), failure => callback(failure));

} catch(exception) {
	callback(exception);
}


function callback(x){
	try {
		if (isError(x)) {
			console.log('callback caught error ' + x);
			return;
		}

		if (x < 7) throw new Error('some new error');
		console.log('callback value =', x);
	
	} catch(exception) {

		callback(exception);
	}
}



/*
	The event loop.

	Asynchronous code (promises, callback functions) and synchronous code
	are put into two different call stacks.

	Only when the synchronous code call stack is empty, JavaScript environment
	starts to execute the asynchronous call stack.

	Therefore, even if the below calculation takes more than 1 second, those
	asynchronous calls or promises that settle sooner than that still occur
	after them.
*/
calculate(10000000);	// do some time consuming calculation
calculate(20000000);

function calculate(n){
	console.log('start calculate()');
	for (let i=0; i<100000000; i++){
		Math.sqrt((Math.random() + 1) * n);
	}
	console.log('stop calculate()');
}



console.log('\n\nAll synchronous code finishes.\n\n');