/*
	Chapter 11. Asynchronous Programming
*/
"use strict"



/*
	Callback function.

	One approach to asynchronous programming is to make functions that
	perform a slow action take an extra argument, a callback function.
	The action is started, and when it finishes, the callback function 
	is called with the result.

	From the below example we can see that, the callback functions are
	called only when all synchronous instructions are finished. So it
	looks like there are two call stacks, one for the synchronous one,
	the other for the asynchronous call. Only when the synchronous stack
	becomes empty then the asynchronous stack become active.

	The sequence of calling the callback functions, however, depend on
	the events that trigger them. For example, the 'Tick200' is displayed
	before the 'Tick800'.
*/
setTimeout(() => console.log('Tick800'), 800);	// wait 800ms then print sth
console.log('start calculate()');
setTimeout(() => console.log('Tick200'), 200);	// wait 200ms then print sth
calculate(10000000);
console.log('calculate() finishes');
// Tick200
// Tick800

function calculate(n){
	/*
		Time consuming calculation
	*/
	for (let i=0; i<300000000; i++){
		Math.sqrt((Math.random() + 1) * n);
	}
}



/*
	Asynchronous functions declaration: async keyword

	The return value of asynchronous functions is not get a normal value, 
	instead, it's a Promise object which resolves to a value when the value
	becomes available.
*/

// The code intends to create an asynchronous function which returns a value
// after 2 seconds. However it actually returns with the value 'undefined'.
// 
// For the proper use of waiting for an asynchronous call to return and do
// something after that, check 'ch11A.js', asynchronous function.
async function getResult2s(){
	console.log('calling getResult2s()');
	let value;
	function assignValue(){
		value = Math.random() > 0.5 ? true : false;
	}
	setTimeout(assignValue, 2000);
	return value;
}

let result = getResult2s();	
console.log(result);	// Promise {undefined}
result.then(value => console.log('getResultAsync(): ', value));	// undefined



/*
	Promise.

	When performing an asynchronous operation, such as reading a file or getting
	response from network, the result is not available until sometime in the
	future. To use that result, we have two ways:

	1. Pass handlers to the asynchronous operation, so that they are called when
	the result becomes available.

	2. Use a special object to wrap the future value (the Promise object), then
	speicify what to do when the future value is available.

	Again, like a callback function, a promise resolves only after all the 
	synchronous event calls are finished.
*/

// The first approach: call back.
getResultAsyncCallBack(resultHandler);

async function getResultAsyncCallBack(handler){
	console.log('calling getResultAsyncCallBack()');
	setTimeout(() => {
		console.log('callback waited 300ms');
		handler(Math.random() > 0.5 ? true : false);
	}, 300);
}

function resultHandler(result){
	console.log('result is', result);
}

// The second approach: Promise
// 
// A promise constructor takes a function as argument. When the promise is
// created, JavaScript environment will pass two built-in functions 
// (resolve, reject) as input.
// 
// myPromise = new Promise((resolve, reject) => {
//  ... do some asynchronous work ...
// 	... if job successful, then
// 	   resolve(some_value);
// 	... else
// 	   reject(some_other_value);
// });
// 
// The easiest way to create a promise is by calling Promise.resolve(value).
// It creates a new promise wrapping the value, if the value is already a
// promise, it's simply returned - otherwise, you get a new promise that
// immediately finishes with your value as its result.
// 
let fifteen = Promise.resolve(15);
fifteen.then(value => console.log('The value is', value));

let another = new Promise(resolve => setTimeout(resolve, 200));
another.then(value => console.log('finished'));

let myPromise = new Promise((resolve, reject) => {
	// use a timeout to simulate asynchronous work
	setTimeout(() => {
		let value = Math.random();
		if (value > 0.5 ? true: false){
			resolve(value);	// create a resolved promise
		} else {
			reject(`value ${value} is too small`);	// a rejected promise
		}
	}, 300);
});

// handle either resolve or reject status
myPromise.then(value => console.log(value), 
				reason => console.log('failed:', reason));



/*
	Chain of promises.

	Since 'then' or 'catch' returns a new promise, we can chain them together
	to register handles for different situations.
*/

// doomed to rejected
new Promise((_, reject) => reject(new Error('Failed')))
	.then(value => console.log('successful handler 1'))
	.catch(reason => {
		console.log('caught failure ' + reason);
		return 'nothing';	// a new promise returned
	})
	.then(value => console.log('successful handler 2', value));




/*
	Asynchronous function.

	Wait for a promise to resolve, then return another promise based on 
	the outcome. 
	
	If the waited promise is rejected, then returns a rejected promise
	whose reject reason being the same as the waited promise.

	Note: await keyword can only be used in asynchronous functions.
*/
function getResultRandom(n){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (Math.random() > 0.2) resolve(n + ' ok');
			else reject(n + ' rejected');
		}, 200 + Math.floor(800*Math.random()));
	});
}

async function getResultFromRandom(n){
	let result = await getResultRandom(n);
	return result + ' 000';
}

getResultFromRandom('test')
	.then(value => console.log(value), reason => console.log(reason));


