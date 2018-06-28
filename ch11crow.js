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

	handler(targetNode, content, sourceNodeName, done);

	where 'done' is a function to be called inside the handler, when the
	response is ready, to deliver the result, its implementation is as:

	done (error, response) => {
		setTimeout(() => callback(error, ser(response)), 10);
	});

	where callback is another function which does something like:

	if (error) reject(error);
	else resolve(response);

	Therefore, either the handler does not return any value, i.e., just
	use side effects (like console.log); Or, if it needs to return a
	value, it must wrap that value as promise and use something like:

	Promise.resolve(value).then().catch();

	For details, see below 'requestType()' function on how to do this.
*/
const {defineRequestType} = require('./crow-tech');

defineRequestType('note', (nest, content, source, done) => {
	console.log(`${nest.name} received from ${source}, note: ${content}`);
	done();	// same as put (undefined, undefined) as (error, response)
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
	take care of the try/catch clause and the invoking of callback, so
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
requestType('ping', () => 'pong');
request(bigOak, 'Cow Pasture', 'ping')
	.then(response => console.log('bigOak ping: ' + response),
		reason => console.log('ping failed: ' + reason));

requestType('echo', (nest, content, source) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (Math.random() > 0.5) resolve(`echo '${content}' from '${nest.name}'`);
			else reject(`echo failed from '${nest.name}'`);
		}, 10 * Math.floor(Math.random() * 10));
	});
});
request(bigOak, 'Butcher Shop', 'echo', 'hello')
	.then(response => console.log(response),
			reason => console.log('error: ' + reason));

// doomed to fail 
request(bigOak, '<invalid destination>', 'echo', 'hello')
	.then(response => console.log(response),
			reason => console.log('error: ' + reason));



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
	
	Broadcast a message to the whole network.

	From one node send a message to all its neighbors, then the neighbors
	send to all their neighbors. To prevent them from resending the same
	messages for ever, a node only resend new messages but ignore messages
	it has received before. To boost efficiency, a node will not resend the
	message to its source when broadcasting.
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
// sendGossip(bigOak, 'Kids with airgun in the park');



/*
	Broadcast connections information to the whole network, so that every
	node has a complete network graph.

	To do this,

	1. Each node creates a 'connections' object (Map) to hold neighbors
		information of every node in the network.
	2. Each node broadcasts its own neighbors to the whole network.
	3. A node, upon receiving a message from another node, compares that
		node's neighbors to records in the connections object,
			> if they are the same, ignore the message
			> if not, update the record send the message to its neighboring 
				nodes.

	This way, when a new node is added to the network or an existing node
	is destroyed, connection status in the network can be updated by
	broadcasting.
*/
const {compareArray} = require('./js_utility');
requestType('connection', (nest, {name, neighbors}, source) => {
	if (compareArray(nest.state.connections.get(name), neighbors)){
		return;
	}
	// console.log(name, neighbors);
	nest.state.connections.set(name, neighbors);
	sendConnection(nest, {name, neighbors}, source);
});

everywhere(nest => {
	nest.state.connections = new Map;
	nest.state.connections.set(nest.name, nest.neighbors);
});

everywhere(nest => {
	sendConnection(nest, {name: nest.name, neighbors: nest.neighbors});
});

// test: wait 5 seconds, bigOak should have the whole network graph
setTimeout(() => console.log(bigOak.state.connections), 5000);



function sendConnection(nest, message, exceptFor=null){
	for (let neighbor of nest.neighbors){
		if (neighbor == exceptFor) continue;
		request(nest, neighbor, 'connection', message)
			.then(() => 0)
			.catch(reason => console.log(`failed: ${nest.name} -> ${neighbor}: ${reason}`));
	}
}



/*
	Find a route from source node (from) to the destination node (to).

	The function returns the next node the message should be sent to.
	When the message arrives at the next node, the next node will compute
	the route again and send the message to the next hop.

	findFullPath() is the same as the findPath() in chapter 7, which returns
	the full path from source to destination. 

	findRoute() is a slight modification which just returns the next hop.
*/
function findRoute(from, to, connections){
	let work = [{at: from, via: null}];
	for (let i=0; i<work.length; i++){
		let {at, via} = work[i];
		for (let next of connections.get(at)){
			if (next == to) return via;
			if (!work.some(w => w.at == next)){
				work.push({at: next, via: via || next});
			}
		}
	}
	return null;
}

function findFullPath(from, to, connections){
	let work = [{at: from, via: []}];
	for (let i=0; i<work.length; i++){
		let {at, via} = work[i];
		for (let next of connections.get(at)){
			if (next == to) return via.concat(next);
			if (!work.some(w => w.at == next)){
				work.push({at: next, via: via.concat(next)});
			}
		}
	}
	return [];	// nothing is found
}

// It takes some time for the connections to be built up 
let connections;
setTimeout(() => {
	connections = bigOak.state.connections;
	console.log(findFullPath('Big Oak', 'Church Tower', connections));
}, 5000);

setTimeout(() => {
	console.log(findRoute('Big Oak', 'Church Tower', connections));	
}, 5100);



/*
	Send long distance message through many hops.

	Previously, the request() function can only send a type of message to
	a nest's direct neighbor. However, if we want deliver a 'note' message
	to a remote node which is not a direct neighbor, what shall we do?

	We can define a new type of request handler, called 'route' which works
	as follows:

	If the message is addressed to a direct neighbor, it is delivered as
	usual. If not, it is packaged in an object and sent to a neighbor that
	is closer to the target, using the 'route' request type, which will
	cause that neighbor to repeat the same behavior.
*/
requestType('route', (nest, {target, type, content}) => {
	return routeRequest(nest, target, type, content);
});

function routeRequest(nest, target, type, content){
	if (nest.neighbors.includes(target)){
		return request(nest, target, type, content);
	}
	let via = findRoute(nest.name, target, nest.state.connections);
	if (!via) throw new Error('no valid path to ' + target);
	return request(nest, via, 'route', {target, type, content});
}

// we need to wait some time, say 5000ms so that bigOak has the network graph
// in its local state object.
setTimeout(() => {
	routeRequest(bigOak, 'Cow Pasture', 'echo', 'hello 2')
		.then(response => console.log(response))
		.catch(reason => console.log(reason));
	routeRequest(bigOak, 'Church Tower', 'echo', 'hello 3')
		.then(response => console.log(response))
		.catch(reason => console.log(reason));
}, 5100);



/*
	Find information from a nest's storage.

	If the information is available in the local storage, then return it.
	Otherwise consult random other nests in the network until it finds one
	that has it.
*/

requestType('storage', (nest, name) => storage(nest, name));

function findInStorage(nest, name){
	return storage(nest, name).then(found => {
		if (found) return found;
		else return findInRemoteStorage(nest, name);
	});
}

function network(nest){
	return Array.from(nest.state.connections.keys());
}

function findInRemoteStorage(nest, name){
	let sources = network(nest).filter(n => n != nest.name);

	function next(){
		if (sources.length == 0){
			return Promise.reject(new Error('not found'));
		} else {
			let source = sources[Math.floor(Math.random() * sources.length)];
			sources = sources.filter(s => s != source);
			console.log('try ' + source);
			return routeRequest(nest, source, 'storage', name)
				.then(value => value != null ? value: next(),
						() => next());
		}
	}

	return next();
}

// setTimeout(() => findInStorage(bigOak, 'events on 2017-12-21')
// 			.then(value => console.log(value))
// 			.catch(reason => console.log('failed to find storage: ' + reason)), 
// 			5200);

// setTimeout(() => findInStorage(bigOak, '<non-existing event>')
// 			.then(value => console.log(value))
// 			.catch(reason => console.log('failed to find storage: ' + reason)), 
// 			5200);



/*
	Asynchronous function.

	In the findStorage() and findInRemoteStorage() function, we need to
	wait for the previous storage() call to finish (resolve or reject) before
	we decide whether to make the next storage() call. So this procedure is
	actually synchronous. In this case, we can use the 'await' keyword to
	complete the task.
*/
async function findInStorageA(nest, name){
	let local = await storage(nest, name);
	if (local != null) return local;
	let sources = network(nest).filter(n => n != nest.name);
	let source, result;
	while (sources.length > 0){
		source = sources[Math.floor(Math.random() * sources.length)];
		sources = sources.filter(s => s != source);
		console.log('trying ' + source);
		try {
			result = await routeRequest(nest, source, 'storage', name);
			if (result != null) return result;
		} catch (_) { 
			/* 
				we do try/catch so that rejected promise come here,
				simeply ignore them.
			*/
		}
	}

	throw new Error('not found');
}

setTimeout(() => findInStorageA(bigOak, 'events on 2017-12-21')
			.then(value => console.log(value))
			.catch(reason => console.log('failed to find storage: ' + reason)), 
			5300);



/*
	Asynchronous bugs.
	
	Find chicks information from storage of all nests.

	The below chicks() and chicks2() are flawed.
*/
function anyStorage(nest, source, name){
	if (source == nest.name) return storage(nest, name);
	else return routeRequest(nest, source, 'storage', name);
}

/*
	list is:
	Church Tower: 0

	The problem is, inside each call to that list += xxx, 'list' starts with
	the current value at the time when the statement starts execution, which
	is an empty string. Therefore, its final value is the reply of the node
	that replies the latest.
*/
async function chicks(nest, year){
	let list = '';
	await Promise.all(network(nest).map(async name => {
		list += `${name}: ${await anyStorage(nest, name, `chicks in ${year}`)}\n`;
	}));
	return list;
}

// some time delay is needed because the network graph (connections) can build up
setTimeout(() => {
	chicks(bigOak, 2017).then(result => console.log('result chicks is', result));
}, 5400);



/*
	list is:

	BigOak: [object promise]
	Great Pine: [object promise]
	...
	
	When we don't wait for anyStore() to resolve, its return value converted
	to string will be '[object promise]'. Since map() does not call an async 
	function, we cannot wait for anyStorage() to resolve, that function will
	return a value 'undefined' and Promise.all() resolves instantly.
*/
async function chicks2(nest, year){
	let list = '';
	let result = await Promise.all(network(nest).map(name => {
		list += `${name}: ${anyStorage(nest, name, `chicks in ${year}`)}\n`;
	}));
	console.log(result);
	return list;
}

setTimeout(() => {
	chicks2(bigOak, 2017).then(result => console.log('result chicks2 is', result));
}, 5500);



/*
	This version works.
*/
function chicks3(nest, year){
	return Promise.all(network(nest).map(async name => {
		return `${name}: ${await anyStorage(nest, name, `chicks in ${year}`)}`;
	}));
}

setTimeout(() => {
	chicks3(bigOak, 2017)
	.then(result => console.log('result chicks3 is', result.join('\n')));
}, 6000);



/*
	Exercises.

	Tracking the scapel.
*/
async function locateScalpel(nest){
	let scalpel = await storage(nest, 'scalpel');
	let source = nest.name;
	for (;scalpel != source;){
		source = scalpel;
		scalpel = await anyStorage(nest, source, 'scalpel');
	}
	return scalpel;
}

setTimeout(() => {
	locateScalpel(bigOak).then(result => console.log('scalpel', result),
							reason => console.log('scalpel failed ' + reason));
}, 6200);




/*
	This version does not use asynchronous function, to wait for promises to
	resolve it uses a recursive function.

	This version has feature that if a node does not reply in time which leads
	to a rejected promise, then it will retry until it gets a response.
*/
function locateScalpel2(nest){

	function next(source){
		return anyStorage(nest, source, 'scalpel')
			.then(result => result == source ? result: next(result), 
					() => next(source));
	}

	return next(nest.name);
}

setTimeout(() => {
	locateScalpel(bigOak).then(result => console.log('scalpel2', result),
							reason => console.log('scalpel2 failed ' + reason));
}, 6500);

