"use strict";

class ColorInput extends WidgetBase {
	#shadowRoot = null;
	#wrapperLabel = null;
	#inputEl = null;
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("colorinput");
		
		this.#wrapperLabel = document.createElement("label");
		this.#wrapperLabel.classList.add("wrapperlabel");
		this.#shadowRoot.appendChild(this.#wrapperLabel);
		
		let wrapper2 = document.createElement("div");
		wrapper2.classList.add("wrapper2");
		this.#wrapperLabel.appendChild(wrapper2);
		
		this.#inputEl = document.createElement("input");
		this.#inputEl.classList.add("input");
		this.#inputEl.setAttribute("type", "color");
		wrapper2.appendChild(this.#inputEl);

		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());

        this.#inputEl.addEventListener("change", (ev) => {
			console.log("color input event");
            this.FireEvent("changeColor", this.#inputEl.value);
        });
	}
	
	SetConfig(config) {
		this._setConfig(config);
		config = config || {};
		
		if(config.width)
			this.#wrapperLabel.style.width = config.width;
		else
			this.#wrapperLabel.style.width = null;
		if(config.height)
			this.#wrapperLabel.style.height = config.height;
		else
			this.#wrapperLabel.style.height = null;
	}
	
	SetData(data) {
		this._setData(data);
	}
	
	SetState(state) {
		this._setState(state);
		state = state || {};
		this.#inputEl.value = state.color; //format? must be "#ff0022" hex format I think
	}
	
	// override WidgetBase.GetState()
	GetState() {
		return { color: this.#inputEl.value, };
	}
}

customElements.define("ui-colorinput", ColorInput);
