/*
	Chapter 6. The secret life of objects.

	Some more code on class.
*/
"use strict"



class Box {

	constructor(length, width, height){
		if (length && length > 0) this._length = length;
		if (width && width > 0) this._width = width;
		if (height && height > 0) this._height = height;
	}

	get length() { return this._length; }
	get width()  { return this._width; }
	get height() { return this._height; }

	get volumn() { return this._length * this._width * this._height; }
}



class LockedBox extends Box {

	constructor(length, width, height, locked){
		super(length, width, height);
		if (locked == undefined) this.locked = false;
		else this.locked = locked;
	}

	get lockedStatus() { return this.locked; }
}



exports.LockedBox = LockedBox;
