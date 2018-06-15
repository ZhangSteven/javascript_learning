/*
	Project: A Robot
*/
"use strict"

let x = Object.create(null);	// an object with no properties
								// no prototype
console.log(x);

let y = {}						// an object with prototype Object.prototype
								// has methods like hasOwnProperty() etc.
console.log(y);

// roads in the town.
const roads = [
	"Alice's House-Bob's House",   "Alice's House-Cabin",
	"Alice's House-Post Office",   "Bob's House-Town Hall",
	"Daria's House-Ernie's House", "Daria's House-Town Hall",
	"Ernie's House-Grete's House", "Grete's House-Farm",
	"Grete's House-Shop",          "Marketplace-Farm",
	"Marketplace-Post Office",     "Marketplace-Shop",
	"Marketplace-Town Hall",       "Shop-Town Hall"
];

// But the array of strings isn't very interesting to work with. What we
// are interested in is the destination that we can reach from a given
// place. So here, we convert the roads into a data structure that, for
// each place, tells us what can be reached from there.
function buildGraph(edges){
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
}

const roadGraph = buildGraph(roads);
console.log(roadGraph);

/*
	If we define a class for each type of things in the problem, like
	the robot, the houses, the roads, the parcels, then we may end up
	a program with lots of interconnected objects each having their
	own state, which is hard to understand and easy to break.

	Instead, let's condense the village's state down to the minimul set
	of values that define it. There's the robot's current location and
	the collection of undelivered parcels, each of which has a current
	location and a destination address.
*/
class VillageState {
	constructor(place, parcels) {
		this.place = place;		// the robot's location
		this.parcels = parcels;	// the parcels' state. Each parcel' state
								// is a pair (current location, destination)
	}

	/*
		Update the state of all parcels {place, address} when the robot
		moves, as below:

		1. For those not at the current location (p.place != this.place), 
			they are not with the robot (not picked up yet), no change.
		2. For those at the current location, they are with the robot so
			they are moved to next stop (p.place = destination).
		3. For those who reach their destination after the move
			(p.place = p.address), they are removed from the list of parcels.

		Finally return a new VillageState object reflecting the new
		state, the robot's location and the parcels' state.
	*/
	move(destination){
		if (!roadGraph[this.place].includes(destination)) return this;
		let parcels = this.parcels.map(p => {
			if (p.place != this.place) {
				return p;
			} else {
				return {place: destination, address: p.address};
			}
		}).filter(p => p.place != p.address);

		return new VillageState(destination, parcels);
	}
}

// test it.
let first = new VillageState('Post Office', 
							[{place: 'Post Office', address: "Alice's House"}]);
let next = first.move("Alice's House");
console.log(next.place);
console.log(next.parcels);
console.log(first.place);



/*
	Make a delivery robot.

	Since we already have the VillageState object to describe the state
	of the world, what we need is a robot that can tell what is the next
	move. The robot can be seen as a function whose input is the current
	state (state), maybe past moves (memory), and return the decision 
	(direction) and updated memory.

	In other words, a robot is a decision making machine, but it does not
	change any state, it just tells where to go and returns the new memory
	(if necessary). The rest of the program is responsible for updateing
	the state.
*/

function runRobot(state, robot, memory){
	for (let turn=0;;turn++){
		if (state.parcels.length == 0){
			// console.log(`Done in ${turn} turns`);
			return turn;
		}

		let direction;
		[direction, memory] = robot(state, memory);
		state = state.move(direction);
		// console.log(`Moved to ${direction}`);
	}
}



/*
	A random robot.

	The simpliest robot just moves randomly in every turn. Given enough
	time, we can expect it to run into every location that has parcels
	to deliver and send those parcels to their destination.
*/
function randomPick(array){
	let choice = Math.floor(Math.random() * array.length);
	return array[choice];
}

function randomRobot(state){
	return [randomPick(roadGraph[state.place]), null];
}



/*
	Test robots.

	To setup the test, we can add a static method to the VillageState
	class, random, to initialize the setup of parcels waiting to be
	delivered. The starting position the robot is assumed to be at
	'Post Office'.
*/
VillageState.random = function(parcelCount = 5){
	let parcels = [];
	for (let i=0; i<parcelCount; i++){
		let place = randomPick(Object.keys(roadGraph));
		let address;
		do {
			address = randomPick(Object.keys(roadGraph));
		} while (place == address);

		parcels.push({place, address});
	}

	return new VillageState('Post Office', parcels);
}

// Test the random robot
runRobot(VillageState.random(), randomRobot);
console.log('Random robot finishes\n\n');



/*
	Manual route.

	We can figure out a route that covers all destinations in the
	graph, if the robot can go through the route twice, then all 
	parcels would be picked up and delivered.
*/

// the route is a list of next stops, starting from Post Office.
routeRobot.mailRoute = [
	"Alice's House", "Cabin", "Alice's House", "Bob's House",
    "Town Hall", "Daria's House", "Ernie's House",
    "Grete's House", "Shop", "Grete's House", "Farm",
    "Marketplace", "Post Office"
];

// a robot that starts from Post Office, going through all destinations.
// memory is list of remaining next stops to go.
function routeRobot(state, memory){
	if (memory.length == 0){
		memory = routeRobot.mailRoute;	// if all stops reached, 
										// start all over again.
	}

	return [memory[0], memory.slice(1)];
}

runRobot(VillageState.random(), routeRobot, []);
console.log('Route robot finishes\n\n');



/*
	Find route automatically.

	Here is a robot that finds its way from point A to B by itself.
*/

// input: graph, from (point A), to (point B)
// output: an array containing the list of next stops from A to B.
//
// A recursive version
//
function findRouteRecursive(graph, from, to){
	if (from == to) return [];

	for (let nextStop of graph[from]){
		let result = findPath(nextStop, to, [from, nextStop]);
		if (result) return result.slice(1);
	}

	function findPath(from, to, history){
		// console.log(history);
		if (from == to) return history;
		for (let nextStop of graph[from]){
			if (history.includes(nextStop)) continue;
			let result = findPath(nextStop, to, history.concat(nextStop));
			if (result) return result;
		}
		return null;
	}
}

// A test graph, connected like below.
//  ___________
// |           |   
// A - B - C - F
// 	   |   |   |
// 	   D   E   G
// 
let testGraph = {
	'A':['B', 'F'],
	'B':['A', 'D', 'C'],
	'C':['B', 'E', 'F'],
	'D':['B'],
	'E':['C'],
	'F':['C', 'A', 'G'],
	'G':['F']
};

console.log(findRouteRecursive(testGraph, 'C', 'A'));	// ['B', 'A']
console.log(findRouteRecursive(testGraph, 'A', 'E'));	// ['B', 'C', 'E']
console.log(findRouteRecursive(testGraph, 'A', 'G'));	// ['B', 'C', 'F', 'G']
console.log('End of findRouteRecursive test\n\n');


/*
	The non-recursive version from the book, looks more elegant.

	The search result is also different. This one finds a shorter path than
	the recursive one.

	Because in the resursive mode, the algorithm tries all possibilities
	in one branch first, if not work, then it switches to next branch.
	When searching for path from A to G, it tries node B first, B eventually
	reaches G, therefore the route is B-C-F-G. The shorter branch F-G is not
	tried at all.

	In the non-resursive version, from the starting point ('A'), we list what
	can be reached within one step ('A', 'B', 'F') and the path to reach those
	nodes from 'A' ([], ['B'], ['F']), then we start from ('A', 'B', 'F') and
	list what can be reached with one more step ('A', 'B', 'F', 'D', 'C') and
	the path to reach them. We keep doing this until the list of nodes reached
	include the destination. This way we'll find the shortest path to the 
	destination. Say our starting point is 'A' and destination is 'G', here is 
	how it goes:

	nodes reached		path to reach those nodes
	A 					[]
	A, B, F 			[], ['B'], ['F']
	A, B, F, D, C 		[], ['B'], ['F'], ['B', 'D'], ['B', 'C']
	A, B, F, D, C, G	[], ['B'], ['F'], ['B', 'D'], ['B', 'C'], ['F', 'G']

	Note that when we add a node and the path to reach the node to the work,
	we make sure the node hasn't been reached before, so that we only keep
	one path to a node in the work.
*/
function findRoute(graph, from, to){
	let work = [{reached: from, route: []}];
	for (let i=0; i<work.length; i++){
		let {reached, route} = work[i];
		for (let place of graph[reached]){
			if (place == to) return route.concat(place);
			if (!work.some(w => w.reached == place)){	
				work.push({reached: place, route: route.concat(place)});
				// console.log(`i = ${i}, ${work[work.length-1].route}`);
			}
		}
	}
}

console.log(findRoute(testGraph, 'C', 'A'));	// ['B', 'A']
console.log(findRoute(testGraph, 'A', 'E'));	// ['B', 'C', 'E']
console.log(findRoute(testGraph, 'A', 'G'));	// ['F', 'G']
console.log('End of findRoute test\n\n');


/*
	The path finding robot

	The robot first checks whether it is on the way of moving, 

	if yes (moves != []), just go on. 

	If not, then check if there is a parcel already picked up 
	(parcel.place == state.place),

		if yes, find a path from the current location to the pacel's 
		destination, then create the move.

		if not, then pick the first pacel in the pacels, find a path to 
		the pacel's pick up address, then create the move.
*/

function pathFindingRobot({place, parcels}, moves){
	if (moves.length > 0) return [moves[0], moves.slice(1)];
	let i = parcels.findIndex(p => place == p.place);
	let newMoves;
	if (i > -1){
		newMoves = findRoute(roadGraph, place, parcels[i].address);
	} else {
		newMoves = findRoute(roadGraph, place, parcels[0].place)
	}
	return [newMoves[0], newMoves.slice(1)];
}

runRobot(VillageState.random(), pathFindingRobot, []);
console.log('pathFindingRobot finishes\n\n');



/*
	The path finding robot from the book.

	It's simpler than the above, in that it doesn't care whether there is a 
	parcel already picked up. It simply choose the first parcel, if it is 
	already picked up, then move to destination, if not then go to pick it up.

	From the compareRobots() function below, this function takes slightly 
	fewer number of steps to deliver all parcels in average.
*/
function goalOrientedRobot({place, parcels}, route){
	if (route.length > 0) return [route[0], route.slice(1)];
	let parcel = parcels[0];
	if (place == parcel.place) {
		route = findRoute(roadGraph, place, parcel.address);
	} else {
		route = findRoute(roadGraph, place, parcel.place);
	}
	return [route[0], route.slice(1)];
}
runRobot(VillageState.random(), goalOrientedRobot, []);
console.log('goalOrientedRobot finishes\n\n');



/*
	Exercise 1. Measuring a robot.

	Generate 100 tasks and count the average number of turns each robot 
	requires.
*/
function compareRobots(robot1, memory1, robot2, memory2){
	let turns1 = 0, turns2 = 0;
	for (let i=0; i<100; i++){
		let task = VillageState.random();
		turns1 = turns1 + runRobot(task, robot1, memory1);
		turns2 = turns2 + runRobot(task, robot2, memory2);
	}
	return [turns1/100, turns2/100];
}

let [averageTurns1, averageTurns2] = compareRobots(pathFindingRobot, [], goalOrientedRobot, []);
console.log(`Average turns: pathFindingRobot ${averageTurns1}, goalOrientedRobot ${averageTurns2}`);

[averageTurns1, averageTurns2] = compareRobots(routeRobot, [], goalOrientedRobot, []);
console.log(`Average turns: routeRobot ${averageTurns1}, goalOrientedRobot ${averageTurns2}`);



/*
	Exercise 2. More efficient path finding robot.

	Here we try to improve the goalOrientedRobot. Instead of grabbing the first 
	parcel in the parcels array, we check whether there are parcels already 
	picked up, 

	if yes, then we go ahead delivering them.

	if no, then we measure the distance between the robot and each parcel, then 
	grab the nearest parcel (in terms of number of turns).
*/
function betterGoalOrientedRobot({place, parcels}, route){
	if (route.length > 0) return [route[0], route.slice(1)];

	let routes = [];
	for (let parcel of parcels){
		if (place == parcel.place) {
			route = findRoute(roadGraph, place, parcel.address);
			return [route[0], route.slice(1)];
		} else {
			routes.push(findRoute(roadGraph, place, parcel.place));
		}
	}

	let shortestRoute = routes.reduce((r1, r2) => r1.length > r2.length ? r2 : r1);
	return [shortestRoute[0], shortestRoute.slice(1)];
}

[averageTurns1, averageTurns2] = compareRobots(betterGoalOrientedRobot, [], goalOrientedRobot, []);
console.log(`Average turns: betterGoalOrientedRobot ${averageTurns1}, goalOrientedRobot ${averageTurns2}`);



/*
	Exercise 2. Continued.

	The above betterGoalOrientedRobot() is actually not better than 
	goalOrientedRobot. Now we change the algorithm, we simply measure the 
	distance for each parcel (whether to pick them up or deliver them), then 
	take the shortest one.
*/
function evenBetterGoalOrientedRobot({place, parcels}, route){
	if (route.length > 0) return [route[0], route.slice(1)];

	let routes = [];
	for (let parcel of parcels){
		if (place == parcel.place) {
			routes.push(findRoute(roadGraph, place, parcel.address));
		} else {
			routes.push(findRoute(roadGraph, place, parcel.place));
		}
	}

	let shortestRoute = routes.reduce((r1, r2) => r1.length > r2.length ? r2 : r1);
	return [shortestRoute[0], shortestRoute.slice(1)];
}

[averageTurns1, averageTurns2] = compareRobots(evenBetterGoalOrientedRobot, [], goalOrientedRobot, []);
console.log(`Average turns: evenBetterGoalOrientedRobot ${averageTurns1}, goalOrientedRobot ${averageTurns2}`);



/*
	Exercise 2. Continued.

	The evenBetterGoalOrientedRobot() performs better than the 
	goalOrientedRobot(). We can further improve it by preferring the pick up 
	task over the delivery. That is, when multiple shortest path exist, we 
	prefer the route to pick up a new parcel.
*/
function evenEvenBetterGoalOrientedRobot({place, parcels}, route){
	if (route.length > 0) return [route[0], route.slice(1)];

	let routes = [];
	for (let parcel of parcels){
		if (place == parcel.place) {
			routes.push({type: 'delivery', route: findRoute(roadGraph, place, parcel.address)});
		} else {
			routes.push({type: 'pickup', route: findRoute(roadGraph, place, parcel.place)});
		}
	}

	let shortestRoute = routes.reduce((r1, r2) => {
		if (r1.route.length < r2.route.length) {
			return r1;
		} else if (r1.route.length == r2.route.length) {
			return r1.type == 'pickup' ? r1 : r2;
		} else {
			return r2;
		}
	}).route;
	return [shortestRoute[0], shortestRoute.slice(1)];
}

[averageTurns1, averageTurns2] = compareRobots(evenBetterGoalOrientedRobot, [], evenEvenBetterGoalOrientedRobot, []);
console.log(`Average turns: evenBetterGoalOrientedRobot ${averageTurns1}, evenEvenBetterGoalOrientedRobot ${averageTurns2}`);



/*
	Exercise 2. Continued.

	The lazyRobot() is the one from the solution. But it uses Array.map() 
	function to replace the for loop above and uses a score() function to 
	replace the if/else if/else structure, is more clear.
*/
function lazyRobot({place, parcels}, route){
	if (route.length > 0) return [route[0], route.slice(1)];
	let routes = parcels.map(p => place == p.place ? 
			{pickup: false, route: findRoute(roadGraph, place, p.address)} :
			{pickup: true, route: findRoute(roadGraph, place, p.place)});

	function score(route){
		return (route.pickup ? 0.5 : 0) - route.route.length;
	}

	let shortestRoute = routes.reduce((r1, r2) => score(r1) > score(r2) ? r1 : r2).route;

	return [shortestRoute[0], shortestRoute.slice(1)];
}

[averageTurns1, averageTurns2] = compareRobots(lazyRobot, [], evenEvenBetterGoalOrientedRobot, []);
console.log(`Average turns: lazyRobot ${averageTurns1}, evenEvenBetterGoalOrientedRobot ${averageTurns2}`);