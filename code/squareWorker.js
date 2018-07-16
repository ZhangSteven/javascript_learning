/*
	Chapter 15. Handling Events
*/
"use strict"

/*
	A worker that compute the square of passed time and send it back.
*/
addEventListener('message', event => {
	postMessage(event.data * event.data);
});
