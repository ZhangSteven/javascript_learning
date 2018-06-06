/*
	Chapter 8. Bugs and Errors
*/

/*
	Enable the strict mode.

	When creating a new javascript file, we should almost always use this.
	If we are running a piece of javascript code in Chrome, it seems that
	strict mode is enabled by default.
*/
"use strict"

function canYouSpotTheProblem(){
	// if strict mode is not used,
	// without "let", this will create a global binding
	for (counter=0; counter<10; counter++){
		console.log(counter);
	}
}

// canYouSpotTheProblem();	// lead to error when in strict mode
// console.log(`counter = ${counter}`);



/*
	Exercise 1. Retry
*/
class MultiplicatorUnitFailure extends Error {}

function primitiveMultiply(a, b){
	if (Math.random() < 0.2) return a * b;
	throw new MultiplicatorUnitFailure('klunk');
}

function reliableMultiply(a, b){
	for (;;){	// an infinite loop
		try {
			return primitiveMultiply(a, b);
			// return primitivMultiply(a, b);	// typo
		} catch (e) {
			if (!(e instanceof MultiplicatorUnitFailure)){
				throw e;
			} else {
				console.log('try again');
			}
		}
	}
}

console.log(reliableMultiply(8, 8));



/*
	Exercise 2. Locked Box.
*/
const box = {
	locked: true,
	unlock(){
		this.locked = false;
	},
	lock(){
		this.locked = true;
	},
	_content: [],
	get content(){
		if (this.locked) throw new Error('Locked!');
		return this._content;
	}
};

// body: a function to run
function withBoxUnlocked(body){
	box.unlock();
	try {
		body();
	} catch (e){

	}
	box.lock();
}

withBoxUnlocked(function() {
	box.content.push('gold piece');
});

try {
	withBoxUnlocked(function() {
		throw new Error('Pirates on the horizon! Abort!');
	});
} catch (e) {
	console.log('Error raised:', e);
}

console.log(box.locked);