/*
	More on JavaScript Objects.

	JavaScript is one of the few languages that allows us to create objects
	directly, via Object.create(). Though it does provide notations like class,
	constructor, class inheritance as other Object-Oriented languages do, 
	under the cover it is actually a chain of objects linked together as
	prototypes, providing behaviour delegation rather than inhertitance.

	Therefore, to make things simply and clear, we can avoid the class notation 
	all together, and use the prototype systems directly. After all, simpler 
	is better.

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

	Delegate chain: obj --> prototype_object (any property not found in obj
	will be delegated to prototype_object)
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
				// if it does not exist yet

console.log('lookup a.x = ', a.x);	// 90
console.log('lookup proto.x = ', Object.getPrototypeOf(a)['x']); // 89

let b = Object.create(null);
console.log(Object.getPrototypeOf(b));	// null
console.log('part 1 finished.\n\n');



/*
	Part 2. Create an object via operator 'new' and a constructor.

	In JavaScript, any function can be used as a constructor, i.e., when used 
	together with the 'new' operator, it creates a new object.

	Under the cover of 'new Box(100)', what happens is:

	1. create object: obj = Object.create(Box.prototype);
	2. execute constructor, Box(100), with 'this' bound to the newly created 
		obj, so it is equivalent as: obj.volumn = 100

	Actually, any function has a 'prototype' property with a default value
	of an empty object, which is not very interesting. We can change that to 
	create a more meaningful prototype.

	Usually we will use a function with 'this' in its body so that it can
	initialize state of the newly created object. But we can use a function
	without 'this' just the same way, such as:

	function f() {}		// an empty function
	let a = new f();	// creates an empty object
	console.log(Object.getPrototypeOf(a) == f.prototype);	// true
	console.log(a instanceof f);							// true
	
	Therefore, the constructor function does two things:

	1. provide a prototype to the newly created object, with its .prototype
		property.

	2. initialize the newly created object.

	Delegate chain: a --> f.prototype
*/

function Box(volumn){
	this.volumn = volumn;
}

b = new Box(100);
console.log('object b is', b);
console.log(Box.prototype);	// an empty object (default)



/*
	instanceof and isPrototypeOf()

	B.isPrototypeOf(A) searches the entire delegat chain of A, see if B is
	there. For example, if object creation happens like:
	
	let b = Object.create(c);	// delegate chain: b --> c
	let a = Object.create(b);	// delegate chain: a --> b --> c

	Then,

	b.isPrototypeOf(a);	// true
	c.isPrototypeOf(a);	// true

	
	A instance of B also searches the entire delegate chain of A, but behaves
	differently. For example, say b and c are both functions, and,

	let b.prototype = Object.create(c.prototype);	// b.prototype --> c.prototype
	let a = new b();	// a --> b.prototype --> c.prototype

	Then,

	a instanceof b;	// true
	a instanceof c;	// true
	b instanceof c;	// false
*/
console.log(Object.getPrototypeOf(b) === Box.prototype);	// true
console.log(b instanceof Box);					// true
console.log(Box.prototype.isPrototypeOf(b));	// true



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

	In JavaScript, 'class' is just a wrapper that puts the definition of
	the constructor function and its 'prototype' property into one place. 
	
	For example, the below 'class' Locker, it's the same as:

	let Locker = function(volumn, name) { ... }
	Locker.prototype = { showInfo: function() { ... } };

	when we do:

	let locker = new Locker(...);

	The above creates a delegate chain: locker --> Locker.prototype, where 
	the latter has a property 'showInfo' so that locker object can refer to.

	Therefore we can say that JavaScript does not offer any type for user
	defined objects, they are just objects sitting in different	places of 
	different delegate chains.
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
	Part 4. Extending a class.

	JavaScript offers class extension syntax as well, 
*/

class Foo {
	constructor(who){
		this.me = who;
	}

	identity() { return this.me; }
}

class Bar extends Foo {
	constructor(who, address){
		super(who);	// calls Foo(who)
		this.address = address;
	}

	show() { console.log(`${this.identity()} lives in ${this.address}`); }
}

let foo = new Foo('YY');
console.log(`This person is ${foo.identity()}`);

let bar = new Bar('ZZ', 'California');
bar.show();

console.log(Object.getPrototypeOf(foo) == Foo.prototype);	// true
console.log(Object.getPrototypeOf(Bar.prototype) == Foo.prototype);	// true
console.log(Object.getPrototypeOf(bar) == Bar.prototype);	// true
console.log(bar instanceof Bar);	// true
console.log(bar instanceof Foo);	// true
console.log(foo instanceof Foo);	// true
console.log(Bar instanceof Foo);			// false
console.log(Bar.prototype instanceof Foo);	// true



/*
	Under the cover of class extension, what happens is:

	1. define two constructor functions, Foo and Bar.
	2. creates delegate chains below:

	bar2 ---> Bar2.prototype ---> Foo2.prototype
							   	
					    foo2 ---> Foo2.prototype

*/
let Foo2 = function(who) { this.me = who; };
Foo2.prototype = {
	identity: function() { return this.me; }
};

let Bar2 = function(who, address) {
	Foo2.call(this, who);
	this.address = address;
};

Bar2.prototype = Object.create(Foo2.prototype);	// define the delegate relation
Bar2.prototype.show = function() {
	console.log(`${this.identity()} lives in ${this.address}`);
};

let foo2 = new Foo2('AA');		// foo2 --> Foo2.prototype
let bar2 = new Bar2('BB', 'Virginia');// bar2 --> Bar2.prototype --> Foo2.prototype
console.log(`That person is ${foo2.identity()}`);
bar2.show();

console.log(bar2 instanceof Bar2);	// true
console.log(bar2 instanceof Foo2);	// true
console.log(foo2 instanceof Foo2);	// true

console.log('part 4 finished.\n\n');



/*
	Part 5. An alternative to object creation. 

	Since the class and constructor function syntax is just but a way to create
	delegate chains, then why not create and link objects directly in delegate
	chains, like below.

	lp ---> LivePerson ---> Person
							
					 p ---> Person

	No more class and constructor function, no more 'xxx.prototype' in the chain, 
	we have only objects. Everything is simple and clear.
*/

// Capitalize the object name, to indicate that it's supposed to be a
// prototype object containing functions only and no state.
let Person = {
	setupIdentity: function(who) { this.me = who },
	identity: function() { return this.me; }
}

// c = Object.assign(a, b, ...); copy all enumerable own properties to target
// 
// Same as:
// 
// let LivePerson = Object.create(Person);
// LivePerson.setupAddress = function () { ... }, etc.
// 
let LivePerson = Object.assign(Object.create(Person), {
	setupAddress: function(address){
		this.address = address;
	},

	init: function(who, address){
		this.setupIdentity(who);
		this.setupAddress(address);
	},

	show: function(){
		console.log(`${this.identity()} lives in ${this.address}`);
	}
});

let p = Object.create(Person);
p.setupIdentity('PP');	// initialize state

let lp = Object.create(LivePerson);
lp.init('QQ', 'Florida');

lp.show();
console.log(Person.isPrototypeOf(p));	// true
console.log(Person.isPrototypeOf(lp));	// true
console.log(Person.isPrototypeOf(LivePerson));	// true
console.log(LivePerson.isPrototypeOf(lp));		// true