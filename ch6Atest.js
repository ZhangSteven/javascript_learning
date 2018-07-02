/*
	Chapter 6. The secret life of objects.

	Test the difference between two ways of creating an object:

	1. new Class()
	2. Object.create(existing object)
*/
"use strict"



// new object using new Class
let {LockedBox} = require('./ch6A');
let box = new LockedBox(1, 2, 3, true);


/*
	Create new object using Object.create()

	It does not duplicate box's properties to box2. box2 is actually an empty
	object whose prototype is box. So when we call enlarge() on box, both
	box and box2's volumn increase.

	However, calling enlarge() on box2 alone creates box2's own properties
	_length, _width, _height. Therefore subsequently, enlarge() call on box
	does not affect box2 again.
*/
let box2 = Object.create(box);

for (let name of ['_length', '_width', '_height']){
	console.log(`box has property ${name}: ${box.hasOwnProperty(name)}`);
	console.log(`box2 has property ${name}: ${box2.hasOwnProperty(name)}\n`);
}
console.log(`box volumn ${box.volumn}`);
console.log(`box2 volumn ${box2.volumn}`);


// change the class prototyp
LockedBox.prototype.enlarge = function(n){
	this._length *= n;
	this._width *= n;
	this._height *= n;
}


box.enlarge(2);
console.log('\nbox enlarges 2');
console.log(`new box volumn ${box.volumn}`);	// 48
console.log(`new box2 volumn ${box2.volumn}`);	// changes, too


box2.enlarge(2);
console.log('\nbox2 enlarges 2');
console.log(`new box volumn now ${box.volumn}`);	// 48, no change
console.log(`new box2 volumn now ${box2.volumn}`);	// 384, enlarge again


box.enlarge(1.5);
console.log('\nbox enlarges 1.5');
console.log(`new box volumn now ${box.volumn}`);	// 162
console.log(`new box2 volumn now ${box2.volumn}`);	// 384, no change