/*
	Chapter 11. Asynchronous Functions.

	Use the functions imported from ./crow-tech.js
*/
"use strict"



// import {bigOak} from './crow-tech';	// Node 8 doesn't support 
const {bigOak} = require('./crow-tech');
bigOak.readStorage('food caches', caches => {
	let firstCache = caches[0];
	bigOak.readStorage(firstCache, foodCache => {
		console.log(foodCache);
	})
});

bigOak.send('Cow Pasture', 'note', 'Let\'s caw loudly at 7PM', (error, response) => {
	// console.log('Note delivered');
	// console.log(error || response);
	console.log(error ? ('error: ' + error) : response);
});



/*
	Define handler function for a request type.

	A handler is a function that generates response for a request. Each
	type of request has its own handler. Based on the implementation in
	crow-tech.js, the send() function will first retrieve a handler based
	on the request type, then invoke the handler function to generate a
	response, it will also pass a callback function to the handler so that
	the handler can use it to deliver the response or indicate an error.

	A handler will be called like this:

	hander(targetNode, content, sourceNodeName, callback);

	So, a typical implementation of a handler looks like:
	try {
		... do some work to generate response ...
		callback(null, response);

	} catch (exception) {
		callback(exception);
	}

*/
const {defineRequestType} = require('./crow-tech');

defineRequestType('note', (nest, content, source, done) => {
	console.log(`${nest.name} received from ${source}, note: ${content}`);
	done();	// deliver an 'undefined' response
});



// create a promised based interface for the readStorage() function
function storage(nest, name){
	return new Promise(resolve => {
		nest.readStorage(name, result => {
			resolve(result);
		});
	});
}
storage(bigOak, 'food caches').then(value => console.log(value));
storage(bigOak, 'enemies').then(value => console.log(value));



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
			nest.send(target, type, content, (error, response) => {
				done = true;
				if (error) reject(error);
				else resolve(response);
			});

			if (!done){
				setTimeout(() => {
					if (done) return;
					else if (n > 2) reject(new Timeout('request timed out')); 
					else {
						console.log(`request ${n} ${nest.name} timed out`);
						attempt(n+1);
					}
				}, 200);
			}
		}

		attempt(1);
	});
}

// There is no .then() call following the promise, as 'note' request
// doesn't deliver any result.
request(bigOak, 'Cow Pasture', 'note', 'Let\'s caw loudly at 7PM');



/*
	Wrap the defineRequestType function in a promise based interface.

	As mentioned above, the handler function for a request type needs
	to take the callback function as an argument and use that to deliver
	the result. Also, it needs to wrap most of its code in a try/catch
	clause so that exceptions are caught and delivered to the callback
	function as well.

	Now we want to wrap the handler function in a new function which will
	take care of the try/catch clause and the invoking of callback, then
	the handler function can focus on generating results. Also, in case 
	the handler function will do something asynchronous, we wrap its return 
	value in a Promise. 
*/
function requestType(type, handler){
	defineRequestType(type, (nest, content, source, callback) => {	// wrapper
		try {
			Promise.resolve(handler(nest, content, source))
				.then(response => callback(null, response))
				.catch(reason => callback(reason));

		} catch (exception) {
			callback(exception);
		}																	
	});
}


/*
	With the above wrapper function, we can define our handlers in a 
	simpler way. Here we define two more handlers for request type

	ping, echo
*/
requestType('ping', (nest, content, source) => {
	console.log(`${nest.name} received ping from ${source}`);
});
request(bigOak, 'Cow Pasture', 'ping');

requestType('echo', (nest, content, source) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			let v = Math.floor(Math.random() * 10);
			if (v > 4) resolve(content + ' ' + v);
			else reject('value too small ' + v);

		}, 10 * Math.floor(Math.random() * 10));
	});
});
request(bigOak, 'Butcher Shop', 'echo', 'hello')
	.then(response => console.log(response),
			reason => console.log('echo failed: ' + reason));

// doomed to fail 
request(bigOak, '<invalid destination>', 'echo', 'hello')
	.then(response => console.log(response),
			reason => console.log('echo failed: ' + reason));



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
	Send 'ping' request to neighboring nodes and filter those nodes
	that produce a valid result.	
*/
function availableNeighbors(nest){
	/*
		An array of promises either resolve to true or false,
		but won't reject.
	*/
	let requests = nest.neighbors.map(neighbor => {
		return request(nest, neighbor, 'ping')
				.then(() => true, () => false);
	});

	return Promise.all(requests).then(result => {
		return nest.neighbors.filter((_, i) => result[i]);
	});
}
availableNeighbors(bigOak).then(result => console.log('Big Oak neighbors: ' + result));



/*
	Network flooding.
	
*/
const {everywhere} = require('./crow-tech');

// Apply a function f() to all the nodes in the crow network.
everywhere(nest => {
	nest.state.gossip = [];	// add a gossip property
});

requestType('gossip', (nest, message, source) => {
	if (nest.state.gossip.includes(message)) return;
	console.log(`${nest.name} received gossip '${message}' from ${source}`);
	sendGossip(nest, message, source);
});

function sendGossip(nest, message, exceptFor = null){
	nest.state.gossip.push(message);
	for (let neighbor of nest.neighbors){
		if (neighbor == exceptFor) continue;
		request(nest, neighbor, 'gossip', message);
	}
}

// start broadcasting
sendGossip(bigOak, 'Kids with airgun in the park');

