/*
	Exercise for chapter 10. Modules

	Contains an interface to be imported by ex10.js
*/
"use strict"



/*
	Question 2. Provide a function to be imported
*/
exports.buildGraph = function(roads){
	/*
		[Array] roads => [map] graph

		roads: an Array of strings, each string represents a pair of
		points, such as "Alice's House-Bob's House", meaning a two-way 
		connection between the two points.

		graph: a map for [String] point => [Array] points can be reached
													directly

	*/
	let graph = Object.create(null);
	function addEdge(from, to){
		if (graph[from] == undefined){
			graph[from] = [to];
		} else {
			graph[from].push(to);
		}
	}

	for (let [from, to] of roads.map(r => r.split('-'))){
		addEdge(from, to);
		addEdge(to, from);
	}

	return graph;
};
