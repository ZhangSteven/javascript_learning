/*
	Chapter 11. Asynchronous Programming
*/
"use strict"



/*
	Callback function.

	One approach to asynchronous programming is to make functions that
	perform a slow action take an extra argument, a callback function.
	The action is started, and when it finishes, the callback function 
	is called with the result.
*/
setTimeout(() => console.log('Tick'), 500);	// wait 500ms then print sth
console.log('this line runs first');