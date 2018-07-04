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
let proto = {
	x: 88,
	increment: function() { this.x = this.x + 1; }
};
let a = Object.create(proto);
console.log(Object.getPrototypeOf(a) === proto);	// true
console.log('lookup a.x = ', a.x);	// 89, a is an empty object, delegate lookup
									// to object 'proto'

a.increment();	// when calling the function, 'this' is bound to object a,
				// assigning value to this.x creates a new property 'x' in a

console.log('lookup a.x = ', a.x);	// 90
console.log('lookup proto.x = ', Object.getPrototypeOf(a)['x']); // 89

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
	empty object (actually any function has a 'prototype' property), which is 
	not very interesting. You can change that to create a more meaningful 
	prototype.
*/
function Box(volumn){
	this.volumn = volumn;
}

b = new Box(100);
console.log('object b is', b);
console.log(Box.prototype);	// an empty object (default)
console.log(Object.getPrototypeOf(b) === Box.prototype);	// true


// A constructor with a more meaningful prototype
function LockedBox(volumn, locked=true){
	this.volumn = volumn;
	this.locked = locked;
}

LockedBox.prototype = {
	/*
		lock() { ... } is a shortcut notation of:

		lock: function() { ... }

		For clarity, we will stick to the old notation.
	*/
	lock() { this.locked = true; },
	unlock: function() { this.locked = false; },
};

let b2 = new LockedBox(200);
console.log('object b2 is', b2);
b2.unlock();

// add a function to the prototype
LockedBox.prototype.enlarge = function(n) { this.volumn = this.volumn * n; };

// now b2 can access the function
b2.enlarge(2);
console.log('object b2 is', b2);
console.log('part 2 finished.\n\n');



/*
	Part 3. Create an object with the class notation.

	The 'class' notation is just a wrapper that puts the constructor
	function and its 'prototype' property into one place. It is the
	same as:

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
	Part 4. Extending a class and a better alternative.
*/

class Foo {
	constructor(who){
		this.me = who;
	}

	identity() { return this.me; }
}

class Bar extends Foo {
	constructor(who, address){
		super(who);
		this.address = address;
	}

	show() { console.log(`${this.identity()} lives in ${this.address}`); }
}

let bar = new Bar('ZZ', 'California');
bar.show();
console.log(Object.getPrototypeOf(bar) == Bar.prototype);	// true
console.log(Object.getPrototypeOf(Object.getPrototypeOf(bar)) == Foo.prototype);


