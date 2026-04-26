"use strict";

// config: {
//		width: css string,
//		height: css string,
//		selectable: false,
//		whiteBg: false,
// }
// data: {text: "the text..."},
// 

class UiLabel extends WidgetBase {
	#shadowRoot = null;
	#labelEl = null;
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("uilabel");
		this.#labelEl = document.createElement("div");
		this.#labelEl.classList.add("label");
		this.#shadowRoot.appendChild(this.#labelEl);
		
		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());
	}
	
	SetConfig(config) {
		this._setConfig(config);
		config = config || {};
		
		// set internal config to default
		this.#labelEl.removeAttribute("style");
		
		// apply specified configuration
		if(config.width)
			this.#labelEl.style.width = config.width;
		if(config.height)
			this.#labelEl.style.height = config.height;
		if(config.selectable) {
			this.#labelEl.style.userSelect = "text";
			this.#labelEl.style.cursor = "text";
		}
		if(config.whiteBg)
			this.#labelEl.style.backgroundColor = "var(--col-white)";
		let align = config.align || "none";
		if(align === "none") {
			
		}
		else {
			this.#labelEl.style.position = "absolute";
			this.#labelEl.style.padding = "inherit";
			this.#labelEl.style.margin = "auto";
			if(align === "l") {
				this.#labelEl.style.left = "0";
				this.#labelEl.style.top = "0";
				this.#labelEl.style.bottom = "0";
				this.#labelEl.style.height = "fit-content";
			}
			else if(align === "tl") {
				this.#labelEl.style.top = "0";
				this.#labelEl.style.left = "0";
			}
			else if(align === "t") {
				this.#labelEl.style.top = "0";
				this.#labelEl.style.left = "0";
				this.#labelEl.style.right = "0";
				this.#labelEl.style.width = "fit-content";
			}
			else if(align === "tr") {
				this.#labelEl.style.top = "0";
				this.#labelEl.style.right = "0";
			}
			else if(align === "r") {
				this.#labelEl.style.right = "0";
				this.#labelEl.style.top = "0";
				this.#labelEl.style.bottom = "0";
				this.#labelEl.style.height = "fit-content";
			}
			else if(align === "br") {
				this.#labelEl.style.bottom = "0";
				this.#labelEl.style.right = "0";
			}
			else if(align === "b") {
				this.#labelEl.style.bottom = "0";
				this.#labelEl.style.left = "0";
				this.#labelEl.style.right = "0";
				this.#labelEl.style.width = "fit-content";
			}
			else if(align === "bl") {
				this.#labelEl.style.bottom = "0";
				this.#labelEl.style.left = "0";
			}
			else if(align === "c") { // center
				this.#labelEl.style.top = "0";
				this.#labelEl.style.bottom = "0";
				this.#labelEl.style.left = "0";
				this.#labelEl.style.right = "0";
				this.#labelEl.style.width = "fit-content";
				this.#labelEl.style.height = "fit-content";
			}
		}
	}
	SetData(data) {
		this._setData(data);
		
		if(data && data.text !== undefined)
			this.#labelEl.innerText = data.text;
		else
			this.#labelEl.innerText = "";
	}
	SetState(state) {
		this._setState(state);
	}
}

customElements.define("ui-uilabel", UiLabel);
