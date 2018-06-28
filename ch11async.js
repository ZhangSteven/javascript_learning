/*
	Chapter 11. Asynchronous functions.

	Put some test here.
*/

"use strict"



getResult().then(value => console.log('getResult(): ' + value));
getResultError()
	.then(() => {}, reason => console.log('getResultError(): ' + reason));
getResultErrorCaptured()
	.then(value => console.log('getResultErrorCaptured(): ' + value));
getException()
	.then(() => {}, reason => console.log('getException(): ' + reason));



/*
	Caution! this causes the program to stop execution.
*/
// getException2().then(() => {}, reason => console.log('getException2(): ' + reason));



/*
	Wait 500ms then result a result.

	The returned result is a promise which will be resolved once the await 
	finishes.

	Please note that there can be a time gap in between the resolve(0) call
	and the return statement. So the actual delay can be longer than 500ms.
*/
async function getResult(){
	let result = await new Promise((resolve) => {
		setTimeout(() => resolve(0), 500);
	});
	return result + 5;
}



async function getResultError(){
	let result = await resultError(600);
	return result;
}



/*
	In an asynchronous function, rejected promises are convered to exceptions
	by await, we can use try/catch to capture that.
*/
async function getResultErrorCaptured(){
	try {
		let result = await resultError(700);
		return result;
	} catch (exception) {
		return 'error caught';
	}
}



/*
	In an asynchronous function, throwing an exception will lead to an rejected
	promise, whose reason is the exception's text.
*/
async function getException(){
	throw new Error('things go wrong');
	return 0;
}



/*
	try/catch here doesn't help when the exception happens in the
	callback function in a setTimeout() call.
*/
async function getException2(){
	try {
		return callbackException();
	} catch (_){
		return -1;
	}
}



/*
	If an exception is thrown in the new Promise() body, then it will create a
	rejected promise.
*/
async function resultError(n){
	await new Promise(resolve => { setTimeout(() => {resolve(0)}, n); });
	return new Promise(() => { throw new Error('result error'); });
}



/*
	When callback function in the setTimeout() call throws an uncaught 
	exception, it won't lead to a rejected promise, instead it will stop
	the program execution.
*/
function callbackException(){
	return new Promise(() => {
		setTimeout(() => { throw new Error('callback error'); }, 300);
	});
}
