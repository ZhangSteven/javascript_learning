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
			callback(`${target.name} value too small ${value}`);
		}
	}, t);
}



/*
	Since sending over the network may incur packet loss, so it would be
	nice if we don't receive response within a certain period (timeout),
	then we just retry sending. We will retry a few times before giving up.
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
					console.log(`completed`);
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
	Promise.all


*/
function availableNeighbors(nest){
	let requests = nest.neighbors.map(neighbor => {
		return request(nest, neighbor, 'ping')
			.then(value => {
				console.log(value); 
				return true;
			}, reason => {
				console.log(reason);
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