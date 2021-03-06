/*
	Chapter 6. The Secret Life of Objects
*/

/*
	Create an object and assign a property whose value is a function. 
*/
let rabbit = {};	// an empty object.
rabbit.speak = function(line){	// assign a function as its property.
	console.log(`The rabbit says ${line}`);
};
rabbit.speak('你好!');



let yy = '88';
let r2 = {yy};	// same as {'yy': yy} or {yy: yy}
// let r2 = {yy: yy};
console.log(r2);



/*
	When a function is called as a method - looked up as a property
	and immediately called, as in object.method() - the binding called
	"this" in its body automatically points at the object that it was
	called on.
*/
function speak(line){
	console.log(`The ${this.type} rabbit says "${line}".`);
}
let whiteRabbit = {type: 'white', speak: speak};
let hungryRabbit = {type: 'hungry', speak};
whiteRabbit.speak('HaHa');
hungryRabbit.speak('I want to eat');


// You can think of "this" as an extra argument that is passed in a 
// different way. You can pass it explicitly as below.
speak.call(hungryRabbit, 'I want to eat');



/*
	When passing a function as an argument, who needs to access to
	"this" in the wrapping scope, use arrow functions.
*/
function normalize(){
	console.log(this.coords.map(n => n/this.length));
}
normalize.call({coords: [1,3,10], length: 5});

/*
	The below doesn't work. When we use function(n) {return n/this.length;}
	to replace n => n/this.length, the function fails to access "this"
	in the wrapping scope.

function normalize2(){
	console.log(this.coords.map(function(n){return n/this.length;}));
}
normalize2.call({coords: [1,3,10], length: 5});
*/



/*
	Prototypes.

	A prototype is another object that is used as a fallback source
	of properties. When an object gets a request for a property that 
	it does not have, its prototype will be searched for the property,
	then prototype's prototype, and so on.

	The prototype relations of Javascript objects form a tree-shaped
	structure, and at the root of this structure sits Object.prototype.
*/
console.log(Object.getPrototypeOf({}) == Object.prototype);
console.log(Object.getPrototypeOf({}));	// Object
console.log(Object.getPrototypeOf(Object));
console.log(Object.getPrototypeOf(Math.max) == Function.prototype);
console.log(Object.getPrototypeOf([]) == Array.prototype);
console.log(Object.getPrototypeOf('') == String.prototype);



/*
	Create an object with Object.create().
*/
let protoRabbit = {	// an object with a method called speak()
	/*
	speak: function(line){
		console.log(`The ${this.type} rabbit says "${line}"`);
	}
	*/

	// same as above, just a short notation.
	speak(line){
		console.log(`The ${this.type} rabbit says "${line}"`);
	}

};

// create a new object just like object "protoRabbit" (the prototype)
let killerRabbit = Object.create(protoRabbit);
killerRabbit.type = 'killer';
killerRabbit.speak('SKREEEE!');

// In the above, we need to create and initialize the new object in
// 2 steps. We can use a function to wrap it.
function makeRabbit(type){
	let rabbit = Object.create(protoRabbit);
	rabbit.type = type;
	return rabbit;
}
makeRabbit('killer').speak('haha');



/*
	Create an object with keyword "new" and a constructor function.
*/

// The constructor function (needs to be called with keyword "new")
function Rabbit(type){
	this.type = type;
}

/*
	A constructor fucntion like Rabbit (all functions, in fact), 
	automatically gets a property named "prototype", which by default
	holds a plain, empty object that derives from Object.prototype.

	When we do:

	let weirdRabbit = new Rabbit('weird');

	It is the same as:

	let weirdRabbit = Object.create(Rabbit.prototype);
	weirdRabbit.type = 'weird';
*/
console.log(Rabbit.prototype);

Rabbit.prototype.speak = function(line){
	console.log(`The ${this.type} rabbit says "${line}"`);
};
let weirdRabbit = new Rabbit('weird');
weirdRabbit.speak('Hello');
console.log(weirdRabbit);



/*
	You can bind Rabbit.prototype to another object.

	In that case, new Rabbit() will create objects following the new prototype,
	but existing Rabbit objects still use the old prototype.
*/
Rabbit.prototype = {
	move(distance){
		console.log(`The ${this.type} rabbit moves ${distance} meters`);
	},

	eat(food){
		console.log(`The ${this.type} rabbit eats ${food}`);
	}
};
let blackRabbit = new Rabbit('black');
blackRabbit.move(5);
blackRabbit.eat('carrot');
console.log(Rabbit.prototype);

// weirdRabbit created with the old prototype stays unchanged.
weirdRabbit.speak('hello again');	// still works.
// weirdRabbit.move(3);				// doesn't work



/*
	The class notation.

	In order to wrap the constructor function and the methods definition
	together, we can use the class notation. But under the cover, it does
	exactly the same things:

	1. Bind methods as properties of the Rabbit.prototype object.
	2. Create a new object with Object.create(), model after Rabbit.prototype.
	3. Initialize the new object's properties.

	For the moment, class declarations only allows methods - properties that
	hold functions - to be added to the prototype. Therefore, the following is
	not allowed:

	class A {
		
		constructor(...) { this... }	// OK
		doSth: function(){ ... } 		// OK

		value: 88	// NOT allowed
	}
*/
class GoodRabbit {

	// this defines constructor function GoodRabbit()
	constructor(type){
		this.type = type;
	}

	speak(line){
		console.log(`The ${this.type} rabbit says "${line}"`);
	}
}

let okRabbit = new GoodRabbit('ok');
okRabbit.speak('Oooops');
console.log(GoodRabbit.prototype);	// same as Rabbit.prototype above.
									// However, the "small" property got
									// shown here.


/*
	Overriding derived properties.
*/

GoodRabbit.prototype.teeth = 'small';
let badRabbit = new GoodRabbit('bad');
console.log(badRabbit.teeth);			// badRabbit doesn't have "teeth"
										// property, fall back on its prototype
										// GoodRabbit.prototype

okRabbit.teeth = 'big, sharp, bloody';	// add a new property "teeth" to
										// okRabbit.
console.log(okRabbit.teeth);
console.log(badRabbit.teeth);			// not affected.



/*
	Map.
	
	We can use a plain empty object to store (key, value) pairs in Javascript,
	but the key must of type String.

	A Map object in Javascript solves the above problem:

	1. It can use any object as a key.
	2. It's more efficient to search and retrieve if there are large number
		of (key, value) pairs in it.
*/

// use a plain object.
let dictionary = {};
dictionary['x'] = 1;
dictionary['y'] = 88;
dictionary.speak = function(line) { console.log(line)};

for (let key in dictionary){ //same as (let key of Object.keys(dictionary))
	console.log(`${key}: ${dictionary[key]}`);
}

// note that keys in the an object's prototype won't be returned
// by Object.keys() call. 
let protoObj = {name: 'ok'};
let d = Object.create(protoObj);
console.log(d.hasOwnProperty('name'));	// false
console.log(Object.keys(d));			// []
console.log(d.name);					// ok.



// use a Map object.
let ages = new Map();
ages.set('Boris', 88);
ages.set('Isaac', 6);
ages.set('Julia', 15);
console.log('Boris age is', ages.get('Boris'));
console.log('Is Jack age know?', ages.has('Jack'));

for (let [key, value] of ages.entries()){
	console.log(key, value);
}



/*
	Polymorphism.
*/

// overwrite the toString() function for the Rabbit prototype
Rabbit.prototype.toString = function(){
	return `a ${this.type} rabbit`;
}
console.log(String(blackRabbit));



/*
	Iterator.
*/
let okIterator = 'OK'[Symbol.iterator]();	// retrieve the iterator
console.log(okIterator.next());	// {value: "O", done: false};
console.log(okIterator.next());	// {value: "K", done: false};
console.log(okIterator.next());	// {value: undefined, done: true};



/*
	Matrix.
*/
class Matrix {
	constructor(width, height, element = (x,y) => undefined){
		this.width = width;
		this.height = height;
		this.content = [];

		for (let y=0; y<height; y++){
			for (let x=0; x<width; x++){
				this.content[y*height + x] = element(x, y);
			}
		}
	}

	get(x, y){
		return this.content[y*this.height + x];
	}

	set(x, y, value){
		this.content[y*this.height + x] = value;
	}
}

let m = new Matrix(2, 2, (x,y) => x+y);
console.log(m);

// build the Matrix iterator
class MatrixIterator {
	constructor(matrix){
		this.matrix = matrix;
		this.x = 0;	// current position
		this.y = 0;
	}

	next(){
		if (this.x == 0 && this.y == this.matrix.height){
			return {done: true};
		}

		let value = {x: this.x, y: this.y, value: this.matrix.get(this.x, this.y)};
		this.x++;
		if (this.x == this.matrix.width){
			this.x = 0;
			this.y++;
		}

		return {value: value, done: false};
	}
}

// Make sure the Matrix prototype is associated with the iterator.
Matrix.prototype[Symbol.iterator] = function(){
	return new MatrixIterator(this);
}

for (let element of m){
	console.log(element);
}


/*
	Inheritance
*/
class SymmetricMatrix extends Matrix {
	constructor (size, element= (x,y) => undefined){
		super(size, size, (x,y) => {
				if (x < y) return element(y, x);	// force it to be
				else return element(x, y);			// symmetrical
			});
	}

	set(x, y, value){	// set two positions
		super.set(x, y, value);
		if (x != y){
			super.set(y, x, value);
		}
	}

	// get() use the prototype's
}

let sm = new SymmetricMatrix(3, (x,y) => x*y + x + y);
console.log(sm);
for (let element of sm){
	console.log(element);
}



/*
	Getter and Setter shortcuts and Static methods.

	Getter and Setter functions can be accessed like a property, such as

	a.size = 5;	// getter function
	a.size = 18;// setting function
*/
class Temperature{
	constructor(celsius){
		this.celsius = celsius;
	}

	// a getter function
	get fahrenheit(){
		return this.celsius * 1.8 + 32;
	}

	set fahrenheit(value){
		this.celsius = (value - 32)/1.8;
	}

	static fromFahreheit(value){
		return new Temperature((value -32)/1.8);
	}
}

let temp = new Temperature(10);
console.log(`temperature is ${temp.fahrenheit}F`);
temp.fahrenheit = 32;
console.log(`temperature is ${temp.celsius}C`);

let temp2 = Temperature.fromFahreheit(50);
console.log(`temperature is ${temp2.celsius}C`);