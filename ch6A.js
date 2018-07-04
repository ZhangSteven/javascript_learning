/*
	More on JavaScript Objects.

	JavaScript is one of the few languages that allows us to create objects
	directly, via Object.create(). Though it does provide notations like class,
	constructor, class inheritance as other Object-Oriented languages do, 
	under the cover it is actually a chain of objects linked together as
	prototypes, providing behaviour delegation rather than inhertitance.

	Therefore, arguably, we should avoid the class notation all together, and
	use the prototype systems directly. After all, simpler is better.

	For more information on this matter, see: Inherited a mess by Kyle Simpson.

	https://davidwalsh.name/javascript-objects
*/
"use strict"


/*
	Part 1. The most basic way to create an object in JavaScript: 

		let obj = Object.create(<prototype_object>)

	You can pass 'null' or any other object as the prototype object. When
	you lookup a property or call a method on 'obj', if that property is not
	available in 'obj', it will delegate to its prototype object to lookup,
	and its prototype object can delegate further to the its own prototype,
	and so on.
*/
let a = Object.create({x: 88});
console.log('lookup a.x = ', a.x);	// a is an empty object, delegate lookup
									// to prototype object.

a.x = 99;							// creates a new property in object a,
									// prototype object is not touched.

console.log('lookup a.x = ', a.x);	// 99
console.log('lookup x in prototype = ', Object.getPrototypeOf(a)['x']); // 88

let b = Object.create(null);
console.log(Object.getPrototypeOf(b));	// null
console.log('part 1 finished.\n\n');



/*
	Part 2. Create an object via operator 'new'.

	A function with 'this' in its body can be used as a constructor, i.e.,
	when used together with the 'new' operator, it creates a new object.

	Under the cover, when we do 'new Box(100)' what happens is:

	1. create object: obj = Object.create(Box.prototype);
	2. execute constructor: obj.volumn = 100 ('this' is bound to the newly
		created obj)

	By default, the object bound to function Box's 'prototype' property is an
	empty object, which is not very interesting. You can change that to create
	a more meaningful prototype.
*/
function Box(volumn){
	this.volumn = volumn;
}

b = new Box(100);
console.log('object b is', b);
console.log(Object.getPrototypeOf(b) == Box.prototype);	// true


// A constructor with a more meaningful prototype
function LockedBox(volumn, locked=true){
	this.volumn = volumn;
	this.locked = locked;
}

LockedBox.prototype = {
	/*
		lock() { ... } is a short notation of:

		lock: function() { ... }

		But for clarity purpose, we will stick to the old notation.
	*/
	lock() { this.locked = true; },
	unlock: function() { this.locked = false; },
};

let b2 = new LockedBox(200);
console.log('object b2 is', b2);
b2.unlock();

// modify the prototype to add more functionality
LockedBox.prototype.enlarge = function(n) { this.volumn = this.volumn * n; };
b2.enlarge(2);
console.log('object b2 is', b2);
console.log('part 2 finished.\n\n');



/*
	Part 3. Create an object with the class notation.

	The 'class' notation is just a wrapper that puts the constructor
	function and its 'prototype' property into one place. The below is
	the same as:

	function Locker(volumn, name) { ... }
	Locker.prototype = { showInfo: function() { ... } }
*/
class Locker {
	constructor(volumn, owner){
		this.volumn = volumn;
		this.owner = owner;
	}

	showInfo(){		// showInfo: function { ... } is not allowed in class
		console.log(`Locker volumn ${this.volumn}, belongs to ${this.owner}`);
	}
}

let locker = new Locker(300, 'Isaac');
locker.showInfo();
console.log(Locker);	// Locker is a function just like LockedBox
console.log(Object.getPrototypeOf(locker) == Locker.prototype);	// true
console.log(Locker.prototype.hasOwnProperty('showInfo'));		// true

// add another function
Locker.prototype.changeOwner = function(name){
	this.owner = name; 
};

locker.changeOwner('Steven');
locker.showInfo();

console.log('part 3 finished.\n\n');



/*
	Part 4. Extend a class and the better alternative.
*/

class Foo {
	constructor(who){
		this.me = who;
	}
}

class Bar {

}



