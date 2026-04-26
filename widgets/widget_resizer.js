"use strict";

class Resizer extends WidgetBase {
	#shadowRoot = null;
	#thumbEl = null;
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("resizer");
		this.#thumbEl = document.createElement("div");
		this.#thumbEl.classList.add("thumb");
		this.#shadowRoot.appendChild(this.#thumbEl);
		
		this.GetWin().SetElementAsResizer(this.#thumbEl, false, false, true, true);
		
		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());
	}
	
	SetConfig(config) {
		this._setConfig(config);
	}
	SetData(data) {
		this._setData(data);
	}
	SetState(state) {
		this._setState(state);
	}
}

customElements.define("ui-resizer", Resizer);
