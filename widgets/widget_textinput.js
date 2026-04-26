"use strict";

// config: {
//		width: css string,
//		height: css string,
// }
// data: {},
// state: {
//     text: string
// }
//

class Textinput extends WidgetBase {
	#shadowRoot = null;
	#inputEl = null;
	#text = "";
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("textinput", true);
		this.#inputEl = document.createElement("input");
		this.#inputEl.setAttribute("type", "text");
		this.#inputEl.classList.add("input");
		this.#shadowRoot.appendChild(this.#inputEl);
		
		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());

        this.#inputEl.addEventListener("change", (ev) => {
            this.FireEvent("change", this.GetState().text);
        });
	}
	
	SetConfig(config) {
		this._setConfig(config);
		if(!config)
			return;
		
		// reset config to default
		this.#inputEl.style.width = null;
		this.#inputEl.style.height = null;
		
		// apply specified config
		if(config.width !== undefined)
			this.#inputEl.style.width = config.width;
		if(config.height !== undefined)
			this.#inputEl.style.height = config.height;
	}
	SetData(data) {
		this._setData(data);
	}
	SetState(state) {
		if(state && state.text !== undefined)
			this.#inputEl.value = state.text;
		else
			this.#inputEl.value = "";
	}
	
	// override WidgetBase.GetState()
	GetState() {
		return { text: this.#inputEl.value, };
	}
}

customElements.define("ui-textinput", Textinput);
