/*
	Chapter 10. Modules (ECMAScript module)
*/
"use strict"



// For the ECMAScript import, code is NOT executed during the import process.
// Therefore we won't see the below line printed when others import the module.
console.log('from ch10_module.js: ECMAScript module');



/*
	ECMAScript modules.	

	Instead of creating a 'exports' object needed by 'require' function, here
	we use 'export' keyword to export bindings to be used by others.

	But, it's the binding, not the value, that is exported to others. That
	means the binding can change its value later.
*/
export let changingX = 5;
export function plus20(x, y){
	return x + y + 20;
}

export minus10 = (x, y) => x - y - 10;



