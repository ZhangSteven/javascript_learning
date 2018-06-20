/*
	Chapter 11. Asynchronous Programming

	The crow example
*/
"use strict"



/*
	Send something over the crow net network.

	The convention for a callback function is to take at least two
	arguments: (failed, value), where 'failed' indicates the status,
	it's either null (successful) or reason of the failure, 'value'
	is the return value from the operation if successful.
*/
function send(target, requestType, content, callback){
	let t = 100 + Math.floor(800*Math.random());	// time out between 100-900ms
	setTimeout(() => {
		let value = Math.floor(10*Math.random());
		if (value > 4.9) {
			// console.log(`${target.name} ${value}`);
			callback(null, `${target.name} ${value}`);
		} else {
			// console.log(`${target.name} value too small ${value}`);
			callback(`${target.name} too small ${value}`);
		}
	}, t);
}



/*
	Since sending over the network may incur packet loss, so it would be
	nice if we don't receive response within a certain period (timeout),
	then we just retry sending. We will retry a few times before giving up.

	As send() is an aynchronous function using callbacks, we can do the
	following to realize what we want:

	1. Wrap the callback interface into a promise.
	2. Setup a timer to wakeup in xxx ms to check whether the result is
		available,
			if yes, then resolve or reject the promise based on outcome
			if not, then retry send() and setup another timer
			keep doing this recursively until 3 times, then give up and
			reject the promise.
*/
class Timeout extends Error {}

function request(nest, target, type, content){
	return new Promise((resolve, reject) => {
		let done = false;
		function attempt(n){
			nest.send(target, type, content, (failed, value) => {
				done = true;
				if (failed) {
					// console.log(failed);
					reject(failed);
				}
				else {
					// console.log(value);
					resolve(value);
				}
			});

			setTimeout(() => {	// if no response received within 250ms, 
								// then retry, up to 3 times.
				if (done) {
					// console.log(`completed`);
					return;
				}
				else {
					console.log(`attempt ${n} timed out`);
					if (n < 3) attempt(n+1);
					else reject(new Timeout(`${target.name} timed out`));
				}
			}, 250);
		}

		attempt(1);
	});
}

let nest = {};
nest.send = send;
request(nest, {name: 'n1'}, 'note', 'let us do it')
	.then(value => console.log('response: ' + value))
	.catch(reason => console.log('request failed: ' + reason));



/*
	Promise.all(...Array of Promises...).
		then(value => console.log(value), reason => console.log(reason));

	Wait for an array of promises to complete and return a single promise. 
	If any of the promises is rejected, the returned promise will be rejected
	with the reason being the reason of the first rejected promise. If all 
	promises resolve, the returned promise will resolve to an array of resolved
	values in the same order as the array of promises.

	Here is an illustration.
*/
function getResultRandom(n){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (Math.random() > 0.2) resolve(n + ' ok');
			else reject(n + ' rejected');
		}, 200 + Math.floor(800*Math.random()));
	});
}

Promise.all([1,2,3].map(getResultRandom))
	.then(value => console.log(value), reason => console.log(reason));



/*
	Asynchronous function.

	Wait for a promise to resolve, then return another promise based on 
	the outcome. 
	
	If the waited promise is rejected, then returns a rejected promise
	whose reject reason being the same as the waited promise.

	Note: await keyword can only be used in asynchronous functions.
*/
async function getResultFromRandom(n){
	let result = await getResultRandom(n);
	return 0;	// if getResultRandom(n) resolves, then return a promise 
				// that resolves to 0
}

getResultFromRandom('test')
	.then(value => console.log(value), reason => console.log(reason));



/*
	We want to send requests to a list of nests, and filter out those
	nests who cannot produce a valid response, i.e., promise rejected
	due to value too small or timed out.

	Since Promise.all() will be rejected if any of the promises is
	rejected, so we need to first map the array of promises to an array
	of 'true'/'false' promises, then call Promise.all() to return a
	single promise who will resolve to a list of nests who produce the
	valid response.
*/
function availableNeighbors(nest){
	let requests = nest.neighbors.map(neighbor => {
		return request(nest, neighbor, 'ping')
			.then(value => {
				console.log(value); 
				return true;
			}, reason => {
				console.log('ping request failed: ' + reason);
				return false;
			});
	});
	return Promise.all(requests).then(result => {
		return nest.neighbors.filter((_, i) => result[i]);
	});
}

nest.neighbors = [{name: 'bigOak'}, {name: 'TownX'}, {name: 'Shenzhen'}];
availableNeighbors(nest).then(value => console.log(value));



/*
	Define different request types.
*/

// how to define a request type 'note'
// defineRequestType('note', (nest, content, source, done) => {
// 	console.log(`${nest.name} received note: ${content}`);
// 	done();
// });

function requestType(name, handler){
	defineRequestType(name, (nest, content, source, callback) => {
		try {
			Promise.resolve(handler(nest, content, source))
				.then(response => callback(response),
						failure => callback(failure));
		} catch(exception){
			callback(exception);
		}
	});
}