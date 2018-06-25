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

console.assert(isError(new Error('haha')) === true);
console.assert(isError(new Error()) === true);
console.assert(isError(Object.create(null)) === false);
console.assert(isError({}) === false);
console.assert(isError('error') === false);
console.assert(isError(null) === false);
console.assert(isError(5.4) === false);



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



/*
	Compare two arrays regardless of the order of their elements, if they
	contain the same set of elements, then they are equal. But the elements
	must be either a string or an integer because we use == operator to 
	compare.
*/
function compareArray(list1, list2){

	if (!list1 || !list2) return list1 == list2;
	if (list1.length != list2.length) return false;
	return compareDictionary(arrayToDictionary(list1), arrayToDictionary(list2));

	function arrayToDictionary(list){
		let d = Object.create(null);
		for (let el of list){
			if (!d[el]) d[el] = 1;
			else d[el]++;
		}
		return d;
	}

	function compareDictionary(d1, d2){
		for (let key in d1){
			if (d1[key] != d2[key]) return false;
		}
		return true;
	}
}

console.assert(compareArray(null, null) === true);
console.assert(compareArray(null, []) === false);
console.assert(compareArray([], []) === true);
console.assert(compareArray(['a', 'b', 'c'], ['b', 'a', 'c']) === true);
console.assert(compareArray(['a', 'b', 'b'], ['b', 'a', 'b']) === true);
console.assert(compareArray(['a', 'b', 'b'], ['a', 'a', 'b']) === false);



exports.isError = isError;
exports.decimalPlace = decimalPlace;
exports.compareArray = compareArray;