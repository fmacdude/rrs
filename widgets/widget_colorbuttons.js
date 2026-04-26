"use strict";

/*
config: {}
data: ["blue", "green", "orange", ...]
state: null | "green"

*/

class ColorButtons extends WidgetBase {
	#shadowRoot = null;
	#div = null;
	#btnEls = [];
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("colorbuttons");
		
		this.#div = this.#shadowRoot.querySelector("div");
		
		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());
	}
	
	SetConfig(config) {
		this._setConfig(config);
	}
	
	SetData(data) {
		this._setData(data);
		data = data || {};
        //console.log("\n\nwidget_colorbuttons.js: setting data =", data);
		
		while(this.#btnEls.length)
			this.#btnEls.pop().remove();
		if(!data.colors)
            return;
		this.#populateButtons(data.colors);
	}
	
	SetState(state) {
		this._setState(state);
		this.#div.style.background = null;
		if(!state || !state.selectedColor)
			return;
		var data = this.GetData();
		if(!data)
			return;
		for(var i = 0; i < data.length; i++){
			if(data[i] === state.selectedColor) {
				this.#div.style.background = data[i];
				break;
			}
		}
	}
	
	#populateButtons(data) {
		data.forEach((color) => {
			var btn = document.createElement("button");
			btn.setAttribute("class", "bev");
			btn.innerText = color;
			btn.style.color = color;
			btn.addEventListener("click", () => {
				this.SetState(color);
			});
			this.#div.appendChild(btn);
			this.#btnEls.push(btn);
		});
	}
}

customElements.define("ui-colorbuttons", ColorButtons);
