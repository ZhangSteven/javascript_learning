/*
	Chapter 9 Regular expressions exercises
*/
"use strict"

// cat and car
let r1 = /ca[rt]/;
verify(r1,  ["my car", "bad cats"], ["camper", "high art"]);

// pop and prop
r1 = /pr?op/;
verify(r1, ["pop culture", "mad props"], ["plop", "prrrop"]);

// ferret, ferry, and ferrari
r1 = /ferr(et|y|ari)/;
verify(r1, ["ferret", "ferry", "ferrari"], ["ferrum", "transfer A"]);

// Any word ending in ious
// r1 = /\b\w+ious\b/;	
r1 = /ious\b/;	// same as above
verify(r1, ["how delicious", "spacious room"], ["ruinous", "consciousness"]);

// A whitespace character followed by a period, comma, colon, or semicolon
r1 = /\s[.,:;]/;
verify(r1, ["bad punctuation ."], ["escape the period"]);

// A word longer than six letters
// r1 = /\w{7,}/;
r1 = /\w{7}/;	// serve the same purpose
verify(r1, ["hottentottententen"], ["no", "hotten totten tenten"]);

// A word without the letter e (or E)
r1 = /\b[^eE\W]+\b/;
// r1 = /\b[^e\W]+\b/i;	// same as above
verify(r1, ["red platypus", "wobbling nest"], ["earth bed", "learning ape", "BEET"]);

function verify(regexp, yes, no){
	for (let str of yes){
		if (!regexp.test(str)){
			console.log('failed to match ' + str);
		} 
	}
	for (let str of no){
		if (regexp.test(str)){
			console.log('unexpected match of ' + str);
		}
	}
}



/*
	Quoting style.

	A single quote needs to be replaced by a double quote, unless it is within
	a word, like aren't.
*/
let text = "'I'm the cook,' he said, 'it's my job.'";
// text.replace(/(\b|\W)(')|(')(\b|\W)/, toDoubleQuote);
let t2 = text.replace(/^'|'$|\W'|'\W/g, toDoubleQuote);
console.log(t2);
function toDoubleQuote(string){
	return string.replace("'", '"');
}

/*
	The solution

	Note: $1 will be undefined if the pattern on the right matches,
		  $2 will be undefined if the pattern on the left matches
*/
let tSolution = text.replace(/(^|\W)'|'($|\W)/g, '$1"$2');
console.log(tSolution);


let tSolution2 = text.replace(/(^|\W)'|'($|\W)/g, toDoubleQuote2);
function toDoubleQuote2(whole, part1, part2){
	console.log(part1, part2);
	console.log();
}


/*
	Numbers.
*/
// let number = /^[+-]?[0-9]+\.?[0-9]*(e-|e\+?)?[0-9]*$|^\.[0-9]+(e\+?|e-)?[0-9]*$/i;

// the answer
let number = /^[+-]?(\d+(\.\d*)?|\.\d+)((e|e\+|e-)\d+)?$/i;

// positive tests
for (let str of ['1', '-1', '+5', '1.55', '.5', '5.', '1.3e2', '1E-4',
				'1e+12', '-.25']){
	if (!number.test(str)){
		console.log(`failed to match '${str}'`);
	}
}

// negative tests
for (let str of ['1a', '+-1', '1.2.3', '1+1', '1e4.5', '.5.', '1f5', '.']){
	if (number.test(str)){
		console.log(`shouldn't match '${str}'`);
	}
}