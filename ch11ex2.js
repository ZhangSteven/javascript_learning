/*
	Chapter 11. Asynchronous function

	Exercise 2. Promise_all
*/
"use strict"


/*

	This doesn't work.

function Promise_all(promises){
	function buildArray(promises, array){
		if (promises.length == 0) {
			resolve(array);
		}
		else {
			promises[0].then(result => {
				array.push(result);
				buildArray(promises.slice(1), array);
			}, error => {
				reject(error);
			});
		}
	}

	return new Promise((resolve, reject) => {
		buildArray(promises, []);
	});
}
*/



/*
	An implementation of Promise.all().

	There are two things worth notice:

	1. We register a list of asynchronous events in the for loop, each time
		when then() is invoked when a promise settles, the state of the code
		is maintained. That is, 'array' and 'resolved' are maintained across
		multiple then() calls.

	2. When array is an empty Array and we do 'array[2] = 3', it automatically
		allocates 3 spaces in array and then assign 3 to array[2], the resulting
		array becomes [ <2 empty elements>, 3 ]  
*/
function Promise_all(promises){
	return new Promise((resolve, reject) => {
		if (promises.length == 0){
			resolve([]);
			return;
		}

		let array = [], resolved = 0;
		for (let i=0; i<promises.length; i++){
			promises[i].then(result => {
				resolved++;
				array[i] = result;
				if (resolved == promises.length) resolve(array);
			}, reject);	
		}

		// Don't do this, it won't work. Because this line only
		// executes once.
		// if (resolved == promises.length) resolve(array);
	});
}



// Testing code
Promise_all([]).then(array => {console.log('This should be []:', array)});

function soon(value){
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(value);
		}, Math.random()*500);
	});
}

Promise_all([soon(1), soon(2), soon(3)])
	.then(array => {console.log('This should be [1,2,3]:', array)});
Promise_all([soon(1), Promise.reject('X'), soon(3)])
	.then(array => {console.log('we should not get here')}, 
			reason => {
				if (reason != 'X') console.log('unexpected failure', reason);
			});
