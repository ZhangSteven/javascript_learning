/*
	Chapter 11. Asynchronous Programming

	The crow example
*/
"use strict"



/*
	Send something over the crow net network.

	Upon failure or success, it calls the callback function to deliver
	the result.
*/
function send(target, requestType, content, callback){
	let t = 200 + Math.floor(800*Math.random());	// time out between 200-1000ms
	setTimeout(() => {
		let value = Math.floor(10*Math.random());
		if (value > 4.9) {
			callback(null, value);
		} else {
			callback('too small ' + value, null);
		}
	}, t);	
}



/*
	Because the failure of a send() operation is random, we can just retry
	a few times within a time out period before giving up.
*/
class Timeout extends Error {}

function request(nest, target, type, content){
	return new Promise((resolve, reject) => {
		let done = false;
		function attempt(n){
			nest.send(target, type, content, (failed, value) => {
				done = true;
				if (failed) reject(failed);
				else resolve(value);
			});

			setTimeout(() => {
				if (done) {
					console.log(`attempt ${n} completed`);
					return;
				}
				else {
					console.log(`attempt ${n} timed out`);
					if (n < 3) attempt(n+1);
					else reject(new Timeout('timed out'))
				};
			}, 250);
		}

		attempt(1);
	});
}



let nest = {};
nest.send = send;
request(nest, 'bigOak', 'note', 'let us do it')
	.then(value => console.log('response: ' + value))
	.catch(reason => console.log('request failed: ' + reason));