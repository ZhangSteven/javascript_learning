/*
	Chapter 9. Regular Expressions
*/

"use strict"

/*
	Two ways of regular expressions
*/
let re1 = new RegExp('abc');
let re2 = /abc/;	// same as above.

console.log(re1.test('abcde'));	// true
console.log(re2.test('abxde'));	// false

// "+" has special meaning in regexp, thus must be escaped with "\"
let eighteenPlus = /eighteen\+/;
console.log(eighteenPlus.test('eighteen+'));	// true

/*
	Match any in a set of characters
*/
console.log(/[123]/.test('3456'));	// match any of 1,2,3. true
console.log(/[0-9]/.test('you are the 1st')); // in the range of 0 - 9, true
console.log(/[a-zA-Z]/.test('123')); 	// false
console.log(/[a-zA-Z]/.test('A123')); 	// true

// match any digits (same as [0-9])
console.log(/\d/.test('1st'));	// true
console.log(/\d/.test('dd'));	// false

// match any alphanumeric character (letters, numbers)
console.log(/\w/.test('123'));	// true
console.log(/\w/.test('abc'));	// true
console.log(/\w/.test('+;'));	// false
console.log(/\w/.test('中'));	// false (non-Latin characters not supported)

// match a white space (space, tab, new line)
console.log(/\s/.test('1 2'));	// true
console.log(/\s/.test('12'));	// false
console.log(/\s/.test('1	2'));	// true (tab)

// match any non-digit, non-alphanumeric, non-white space character
console.log(/\D/.test('dd'));	// true
console.log(/\W/.test('+-'));	// true
console.log(/\S/.test('A123'));	// true



/*
	Invest, Repeat patterns
*/

// anything other than 0 or 1
console.log(/[^01]/.test('1001000101010'));	// false
console.log(/[^01]/.test('1001000101012'));	// true ('2' matches)

// anything that is not a letter and dot (note '.' lost its special meaning
// in the [], same as other special characters).
console.log(/[^a-zA-Z.]/.test('here.')); 		// false
console.log(/[^a-zA-Z.]/.test('here we are.'))	// true (the white space)

// match at least once
console.log(/\d+/.test('ab2'));	// true
console.log(/\d+/.test('ab'));	// false

// match zero or more
console.log(/[a-zA-Z]\s*\d/.test('a    2'));	// true
console.log(/[a-zA-Z]\s*\d/.test('A2'));		// true
console.log(/[a-zA-Z]\s*\d/.test('22'));		// false

// match at most once
console.log(/neighbou?r/.test('neighbour'));	// true
console.log(/neighbou?r/.test('neighbor'));		// true
console.log(/neighbou?r/.test('neighbouur'));	// false, 2 'u' there

// match for specific times
console.log(/\d{1,4}/.test('1234'));	// true (at least 1, at most 4 digits)
console.log(/\d{0,4}/.test(''));		// true (up to 4 digits)
console.log(/\d{4}/.test('123456'));	// true (exactly 4 digits)
console.log(/\d{4,}/.test('123'));		// false (at least 4 digits)

// Grouping sub expressions
let cartonCrying = /boo+(hoo+)+/i;	// "i" means case insensitive
console.log(cartonCrying.test('Boohoooohoohooo'));	// true



/*
	Extract matches
*/
let match = /\d+/.exec('one two 100 200');
console.log(match);		// ['100', index: 8, input: 'one two 100 200']
						// an Array object with two properties, 'index'
						// and 'input'
console.log(match[0]);		// '100', the matched part
console.log(match.index);	// 8
console.log(match.input);	// the whole string 'one two 100 200'


// regular expressions containing sub expressions grouped by
// parentheses
let quotedText = /'([^']*)'/;	// [^'] means any character that's not a 
								// single quote character "'"
match = quotedText.exec("she said 'hello'");
console.log(match[0]);	// "'hello'", the part matching the 
						// whole expression
console.log(match[1]);	// 'hello', the part matching the sub expression
						// in the parentheses


match = /bad(ly)?/.exec('bad');
console.log(match[0], match[1]);	// 'bad', undefined

match = /(\d)+/.exec('123A');
console.log(match[0], match[1]);	// '123', '3', tricky

match = /(\d+)/.exec('123A');
console.log(match[0], match[1]);	// '123', '123'



/*
	The Javascript Date() class.

	The Date class is very weird, month starts from 0, i.e., 0 means January, 
	and 11 means December. 
*/

console.log(new Date(2009, 4, 31));	// 2009-5-31, but displayed as CMT 0 time
console.log(new Date(2009, 4, 31).toLocaleDateString());
console.log(new Date(2009, 4, 0));	// 2009-4-30, one day back from 5-1

let date = new Date(2009, 4, 31);	// 2009-5-31
console.log(date.getFullYear(), date.getMonth(), date.getDate());	//2009,4,31

// construct a new Date() based on YYYY-MM-DD
function getDate(dateString){
	// first element ignored since it is the whole match
	let [, year, month, day] = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(dateString);

	// year, month, day are strings, but implicitly converted to
	// numbers when passed to the Date constructor
	return new Date(year, month-1, day);
}
console.log(getDate('2009-5-31').toLocaleDateString());


// Date() also allows to construct based on string, YYYY-MM-DD or
// MM/DD/YYYY
console.log(new Date('2009-4-30').toLocaleDateString());	// 2009-4-30
console.log(new Date('1/2/2009').toLocaleDateString());		// 2009-1-2



/*
	word boundaries		 \b

	start of a string    ^

	end of a string 	 $

	The start or end of a string, or any point in the string that has
	an alphanumeric character (as in \w) on one side and an non-alphanumeric 
	character on the other.
*/
console.log(/\bcat\b/.test('cat meow'));	// true
console.log(/\bcat\b/.test('concat'));		// false
console.log(/\bcat\b/.test('a cat there'));	// true

// match a string consisting of numbers from start to end
console.log(/^\d+$/.test('123'));	// true
console.log(/^\d+$/.test('123A'));	// false

// match a string starting with numbers and ends with letters
console.log(/^(\d+).*([a-zA-Z]+)$/.test('12 +_ 3A'));	// true
console.log(/^(\d+).*([a-zA-Z]+)$/.test('12 +_ A3'));	// false



/*
	Choice patterns, |
*/

// match one of 'pig', 'cow' or 'chicken' with possible plural forms
let animalCount = /\b(\d+) (pig|cow|chicken)s?\b/;
console.log(animalCount.test('15 pigs'));			// true
console.log(animalCount.test('15 pigchickens'));	// false

// NOTE: the \b at the end of the animalCount is very important,
let wrongAnimalCount = /\b(\d+) (pig|cow|chicken)s?/;	// no \b
console.log(wrongAnimalCount.test('15 pigchickens'));	// true



/*
	How the matching works: the lazy and greedy

	lazy: matching stops as long as a match is found
	greedy: when it encounters * or + or {a, b}, it tries the longest 
		sequence that matches, then start from there to match the
		rest.
*/

// for ^.*, the matcher starts with the entire string, then it finds 
// there is no 'x', then it backtracks one character, it then finds
// 'abcxfx' is a match, then it stops.
console.log(/^.*x/.exec('abcxfxg')[0])	// abcxfx



/*
	The replace() method.

	By default, it only replaces the first match, unless a global
	replace flag (/g) is used together with a regular expression.
*/
console.log('papa'.replace('p', 'm'));	// mapa
console.log('papa'.replace(/p/g, 'm'));	// mama

/*
 	use $1, $2, ... $9 to refer to matched part from sub expressions

	Say, we would like to change:

	Zhang, Steven
	Yeung, Kelvin

	To

	Steven Zhang
	Kelvin Yeung
*/
console.log('Zhang, Steven\nYeung, Kelvin'.replace(/(\w+), (\w+)/g, `$2 $1`));

/*
	use a function as the replacement.

	The function will be called with the whole match ($&) and the matched groups
	($1, $2, ... if any) as arguments, and its return value will be inserted 
	into the new string.
*/

// The arrow function only takes one argument, which will be the whole match,
// $&. The matched groups $1 and $2 are discarded.
//
//		ZHANG, STEVEN
//		YEUNG, KELVIN
console.log('Zhang, Steven\nYeung, Kelvin'.replace(/(\w+), (\w+)/g, s => s.toUpperCase()));

function fTwoArgs(x, y) {
	return x + ' ' + y
}

// Since the function takes only two arguments, then:
//		x = $&, y = $1, $2 is silently discarded
//
//		Zhang, Steven Zhang
//		Yeung, Kelvin Yeung
console.log('Zhang, Steven\nYeung, Kelvin'.replace(/(\w+), (\w+)/g, fTwoArgs));

// A more interesting example
let stock = '1 lemon, 2 cabbages, 101 eggs';
function minusOne(match, quantity, item){
	let amount = Number(quantity) - 1	// explicit conversion.
										// Actually, if we don't do that,
										// just quantity - 1 still works due
										// to implicit conversion.
										//
										// In Javascript, implicit conversion
										// is everywhere, like
										//
										// '2' == 2	// true
	if (amount == 0){
		return 'no ' + item
	} else if (amount == 1){
		return '1 ' + item.slice(0, item.length-1)	// remove the trailing 's'
	} else {
		return amount + ' ' + item	// implicit string conversion
	}
}

// no lemon, 1 cabbage, 100 eggs
console.log(stock.replace(/(\d+) (\w+)/g, minusOne));