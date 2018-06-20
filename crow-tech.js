/*
	For chapter 11, Asynchronous Function, the example of crow tech.
*/
"use strict"



/*
	Wrap the whole body inside a function and call it.
*/
(function() {

// direct links between crow nests
const connections = [
    "Church Tower-Sportsgrounds", "Church Tower-Big Maple", "Big Maple-Sportsgrounds",
    "Big Maple-Woods", "Big Maple-Fabienne's Garden", "Fabienne's Garden-Woods",
    "Fabienne's Garden-Cow Pasture", "Cow Pasture-Big Oak", "Big Oak-Butcher Shop",
    "Butcher Shop-Tall Poplar", "Tall Poplar-Sportsgrounds", "Tall Poplar-Chateau",
    "Chateau-Great Pine", "Great Pine-Jaques' Farm", "Jaques' Farm-Hawthorn",
    "Great Pine-Hawthorn", "Hawthorn-Gilles' Garden", "Great Pine-Gilles' Garden",
    "Gilles' Garden-Big Oak", "Gilles' Garden-Butcher Shop", "Chateau-Butcher Shop"
];



function storageFor(name){
	let storage = Object.create(null);
	storage['food caches'] = ['cache in the oak', 'cache in the meadow', 
								'cache under the hedge'];
	storage['cash in oak'] = 'A hollow above the third big branch from the bottom. Several pieces of break and a pile of acorns';
	storage['cache in the meadow'] = 'Buried below the patch of nettles (south side). A dead snake';
	storage['cache under the hedge'] = 'Middle of the hedge at Gilles\' garden. Marked with a forked twig. Two bottles of beer';
	storage['enemies'] = ['Farmer Jaque\'s dog', 'The butcher', 'The one-legged jackdaw', 'The boy with the airgun'];
	if (name == 'Church Tower' || name == 'Hawthorn' || name == 'Chateau'){
		storage['events on 2017-12-21'] = 'Deep snow. Butcher\'s garbage can fell over. We chased off the ravens from Saint-Vulbas.';
	}

	let hash = 0;
	for (let i=0; i<name.length; i++) hash += name.charCodeAt(i);
	for (let y=1985; y<=2018; y++){
		storage[`chicks in ${y}`] = hash % 6;
		hash = Math.abs((hash << 2) ^ (hash + y));
	}

	if (name == 'Big Oak') storage.scalpel = 'Gilles\' Garden';
	else if (name == 'Gilles\' Garden') storage.scalpel = 'Woods';
	else if (name == 'Woods') storage.scalpel = 'Chateau';
	else if (name == 'Chateau' || name == 'Butcher Shop') storage.scalpel = 'Butcher Shop';
	else storage.scalpel = 'Big Oak';

	// convert the property values to JSON string, so that they can be compared
	// with the == operator
	for (let prop of Object.keys(storage)) storage[prop] = JSON.stringify(storage[prop]);

	return storage;
}



class Network {
	constructor(connections, storageFor){
		let reachable = Object.create(null);
		for (let [from, to] of connections.map(conn => conn.split('-'))){
			/*
				same as:
				if (reachable[from] == undefined) reachable[from] = [];
				reachable[from].push(to);
			*/
			(reachable[from] || reachable[from] = []).push(to);
			(reachable[to] || reachable[to] = []).push(from);
		}

		this.nodes = Object.create(null);
		for (let name of Object.keys(reachable)){
			this.nodes[name] = new Node(name, reachable[name], this, storageFor(name));
		}

		this.types = Object.create(null);
	}

	defineRequestType(name, handler){
		this.types[name] = handler;
	}

	everywhere(f){
		for (let node of Object.values(this.nodes)) f(node);
	}
}



function ser(value){
	return value == null ? null: JSON.parse(JSON.stringify(value));
}



// two symbols as keys to store private members in the class
const $storage = Symbol('storage'), $network = Symbol('network');

class Node {
	constructor(name, neighbors, network, storage){
		this.name = name;
		this.neighbors = neighbors;
		this[$network] = network;
		this[$storage] = storage;
		this.state = Object.create(null);
	}

	send(to, type, message, callback){
		let toNode = this[$network].nodes[to];
		if (!toNode || !this.neighbors.includes(to)){
			return callback(new Error(`${to} is not reachable from ${this.name}`));
		}
		
		let handler = this[$network].types[type];
		if (!handler){
			return callback(new Error('Unknown request type ' + type));
		}

		// 3% chance of not calling the handler at all, to simulate a packet
		// loss in the network.
		if (Math.random() > 0.03){
			setTimeout(() => {
				try{
					handler(toNode, ser(message), this.name, (error, response) => {
						setTimeout(() => callback(error, ser(response)), 10);
					});

				} catch(e){
					callback(e);
				}
			}, 10 * Math.floor(Math.random() * 10));
		}
	}

	readStorage(name, callback){
		let value = this[$storage][name];

		/*
			same as:
			if (value != undefined) callback(JSON.parse(value))
		*/
		setTimeout(() => callback(value && JSON.parse(value)), 20);
	}

	writeStorage(name, value, callback){
		setTimeout(() => {
			this[$storage][name] = JSON.stringify(value);
			callback();
		}, 20);
	}
}



let network = new Network(connections, storageFor);
exports.bigOak = network.nodes['Big Oak'];
exports.everywhere = network.everywhere.bind(network);
exports.defineRequestType = network.defineRequestType.bind(network);

if (typeof __sandbox != 'undefined'){
	__sandbox.handleDeps = false;
	__sandbox.notify.onLoad = () => {
		/*
			Kludge to make sure some functions are delayed until the
			nodes have been running for 500ms, to give them a chance
			to propagate network information.
		*/
		let waitFor = Date.now() + 500;
		function wrapWaiting(f){
			return function(...args){
				let wait = waitFor - Date.now();
				if (wait <= 0) return f(...args);
				return new Promise(resolve => setTimeout(resolve, wait))
							.then(() => f(...args));
			};
		}

		for (let n of ['routeRequest', 'findInStorage', 'chicks']){
			window[n] = wrapWaiting(window[n]);
		}
	};	// end of onLoad
}

if (typeof window != 'undefined'){
	window.require = name => {
		if (name != './crow-tech'){
			throw new Error('Crow nests can only require \'./crow-tech\'');
		}
		return exports;
	};

} else if (typeof module != 'undefined' && module.exports){
	module.exports = exports;
}

})();	// End of function()