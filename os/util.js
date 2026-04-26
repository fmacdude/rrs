"use strict";

class LazyLoader {
	#state = false;
	#val = null;
	#setterFunction = null;
	
	constructor(setterFunction) {
		this.#setterFunction = setterFunction;
	}
	Get() {
		if(!this.#state) {
			this.#val = this.#setterFunction();
			this.#state = true;
		}
		return this.#val;
	}
	Clear() {
		this.#val = null;
		this.#state = false;
	}
}

class Util {
	// https://stackoverflow.com/questions/2943140/how-to-swap-html-elements-in-javascript/44562952#44562952
	static SwapNodes(n1, n2) {
		var p1 = n1.parentNode;
		var p2 = n2.parentNode;
		var i1, i2;

		if(!p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1))
			return;

		for(var i = 0; i < p1.children.length; i++) {
			if (p1.children[i].isEqualNode(n1)) {
				i1 = i;
				break;
			}
		}
		for(var i = 0; i < p2.children.length; i++) {
			if(p2.children[i].isEqualNode(n2)) {
				i2 = i;
				break;
			}
		}

		if (p1.isEqualNode(p2) && i1 < i2)
			i2++;
		p1.insertBefore(n2, p1.children[i1]);
		p2.insertBefore(n1, p2.children[i2] || null);
	}
}