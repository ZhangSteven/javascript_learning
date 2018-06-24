/*
	Chapter 11. Asynchronous functions.

	Put some test here.
*/

"use strict"



getResult().then(value => console.log('getResult(): ' + value));
getResult2().then(() => {}, reason => console.log('getResult2(): ' + reason));
getResult3().then(value => console.log('getResult3(): ' + value));
getException().then(() => {}, reason => console.log('getException(): ' + reason));

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



async function getResult2(){
	let result = await resultError(600);
	return result;
}



/*
	If we use a try/catch clause to wrap the await statement and the awaited 
	promise is rejected, then the catch() will be active.
*/
async function getResult3(){
	try {
		let result = await resultError(700);
		return result;
	} catch (exception) {
		return 'error caught';
	}
}



/*
	When there is an uncaught exception, it will lead to a rejected promise
	whose reason is the exception.
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
