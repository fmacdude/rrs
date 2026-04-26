"use strict";

// todo - add icon support

// config: {
// 		mode: normal | toggle | menu,
//		menuData: [menudata...]
//		width: css string
//		height: css string
// }
// data: {text: "Click me!"}
// 

class UiButton extends WidgetBase {
	#shadowRoot = null;
	#btnEl = null;
	#mode = "normal";
	#pressed = false;
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("uibutton");
		this.#btnEl = document.createElement("button");
		this.#btnEl.classList.add("button");
		this.#shadowRoot.appendChild(this.#btnEl);
		
		this.#btnEl.addEventListener("click", (ev) => {
			if(this.#mode === "toggle") {
				if(this.#pressed) {
					this.#btnEl.classList.remove("pressed");
					this.FireEvent("toggleOff");
					this.#pressed = false;
				}
				else {
					this.#btnEl.classList.add("pressed");
					this.FireEvent("toggleOn");
					this.#pressed = true;
				}
			}
			else if(this.#mode === "normal")
				this.FireEvent("click");
		});
		
		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());
	}
	
	SetConfig(config) {
		this._setConfig(config);
		config = config || {};
		
		this.#btnEl.removeAttribute("style");
		if(config.mode !== "toggle")
			this.#btnEl.classList.remove("pressed");
		UI.SetAsMenuButton(this.#btnEl, null);
		
		if(config.mode === "toggle")
			this.#mode = "toggle";
		else if(config.mode === "menu")
				//SetAsMenuButton(element, menuData, callback, mousedown)
			UI.SetAsMenuButton(this.#btnEl, config.menuData, (cmd) => { this.FireEvent("menuCommand", cmd); }, false);
		else
			this.#mode = "normal";
		
		if(config.width)
			this.#btnEl.style.width = config.width;
		if(config.height)
			this.#btnEl.style.height = config.height;
	}
	
	SetData(data) {
		this._setData(data);
		data = data || {};
		
		this.#btnEl.innerText = data.text;
	}
	
	SetState(state) {
		this._setState(state);
		state = state || {};
		
		if(this.#mode === "toggle") {
			if(state.pressed) {
				this.#pressed = true;
				this.#btnEl.classList.add("pressed");
				this.FireEvent("toggleOn");
			}
			else { 
				this.#pressed = false;
				this.#btnEl.classList.remove("pressed");
				this.FireEvent("toggleOff");
			}
		}
	}
}

customElements.define("ui-uibutton", UiButton);
