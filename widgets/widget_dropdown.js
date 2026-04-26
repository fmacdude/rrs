"use strict";

class Dropdown extends WidgetBase {
	#shadowRoot = null;
	#container = null;
	#selectEl = null;
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("dropdown", true); // is webkit scrollbar styling going to do anything for dropdowns...?
		
		this.#container = document.createElement("label");
		this.#container.classList.add("label");
		this.#shadowRoot.appendChild(this.#container);
		
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
		
		// destroy existing
		if(this.#selectEl !== null)
			this.#selectEl.remove();
		
		// create new select element according to specified data
		this.#selectEl = document.createElement("select");
		this.#selectEl.classList.add("select");
		this.#container.appendChild(this.#selectEl);
        if(!data.items)
            return;
		data.items.forEach((item) => {
			let option = document.createElement("option");
			option.innerText = item.name;
			option.setAttribute("value", item.id);
			this.#selectEl.appendChild(option);
		});
		this.#selectEl.addEventListener("change", (ev) => {
			this.FireEvent("change", this.#selectEl.value);
		});
	}
	
	SetState(state) {
		this._setState(state);
		
		if(state && state.selectedItemId) //todo what if 0, but option with id=0 is 2nd or 3rd option?
			this.#selectEl.value = state.selectedItemId;
		else
			this.#selectEl.selectedIndex = 0; // set to first option
	}
	// override widgetBase.GetState()
	GetState() {
		return { 
			selectedItemId: this.#selectEl.value,
		};
	}
}

customElements.define("ui-dropdown", Dropdown);
