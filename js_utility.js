/*
	Some utility functions.
*/
"use strict"



/*
	Since instanceof operator is not 100% reliable, we will use the following
	code to tell whether an object 'e' is of type Error. Duck typing is used.

	Original code comes from: https://stackoverflow.com/a/45496068

	The e.message condition is removed so that isError(new Error()) is true.
*/
function isError(e){
	if (e && e.stack && typeof e.stack === 'string' && typeof e.message === 'string') {
		return true;
	}
	return false;
}

// console.log(isError(new Error('haha')));	// true
// console.log(isError(new Error()));			// true



/*
	Format number to show n decimal places.

	number, number => number

	Original code comes from: https://stackoverflow.com/a/32178833
*/
function decimalPlace(value, n){
	if (n < 1) return value;
	return Number(Math.round(value + 'e' + n) + 'e-' + n).toFixed(n);
}

// console.log(decimalPlace(1.345, 2));	// 1.35
// console.log(decimalPlace(2.6584, 3));	// 2.658



exports.isError = isError;
exports.decimalPlace = decimalPlace;