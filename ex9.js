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

	In essence, it's a "replace all except this pattern" kind of problem.
*/
let text = "'I'm the cook,' he said, 'it's my job.'";
// text.replace(/(\b|\W)(')|(')(\b|\W)/, toDoubleQuote);
let t2 = text.replace(/^'|'$|\W'|'\W/g, toDoubleQuote);
console.log(t2);
function toDoubleQuote(whole){
	return whole.replace("'", '"');
}
