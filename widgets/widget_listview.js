//todo Implement state.selectedItemId, and multiple selection

"use strict";

class Listview extends WidgetBase {
	#shadowRoot = null;
	#container = null;
	#selectedItem = null;
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("listview", true);
		this.#container = document.createElement("div");
		this.#container.classList.add("container");
        //this.#shadowRoot.append(this.#container); // this line should be here? How does it work without? ...
		
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
		
		this.#container.replaceChildren();
		
        if(!data.items)
            return;
		data.items.forEach((itemData) => {
			let itemEl = document.createElement("div");
			itemEl.classList.add("item");
			itemEl.innerText = itemData.name;
			itemEl.addEventListener("mousedown", (ev) => {
				if(ev.button !== 0)
					return;
				this.#selectItem(itemEl, itemData);
			});
			this.#container.append(itemEl);
		});
	}
	SetState(state) {
		this._setState(state);
	}
	
	#selectItem(itemEl, itemData) {
		if(this.#selectedItem === itemEl)
			return;
		if(this.#selectedItem)
			this.#selectedItem.classList.remove("selected");
		this.#selectedItem = itemEl;
		itemEl.classList.add("selected");
		this.FireEvent("selected", itemData.id);
	}
}

customElements.define("ui-listview", Listview);
