"use strict";

// todo - add icon support

// config: {
//
// }
// data: { }
// 

class UiCheckbox extends WidgetBase {
	#shadowRoot = null;
	#checkboxEl = null;
	#checked = false;
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("uicheckbox");
		
		this.#checkboxEl = document.createElement("input");
		this.#checkboxEl.classList.add("checkbox");
		this.#checkboxEl.setAttribute("type", "checkbox");
		this.#shadowRoot.appendChild(this.#checkboxEl);

		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());

        this.#checkboxEl.addEventListener("change", (ev) => {
            this.FireEvent("change", this.GetState().checked === true);
        });
	}
	
	SetConfig(config) {
		this._setConfig(config);
	}
	
	SetData(data) {
		this._setData(data);
	}
	
	SetState(state) {
		this._setState(state);
		state = state || {};
		this.#checkboxEl.checked = state.checked === true;
	}
	
	// override WidgetBase.GetState()
	GetState() {
		return { checked: this.#checkboxEl.checked, };
	}
}

customElements.define("ui-uicheckbox", UiCheckbox);
