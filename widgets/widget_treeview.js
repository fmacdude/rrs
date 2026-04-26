"use strict";

/*
data: [
	{ id: "file1", name: "File 1.pdf", children: [...] },
	{ id: "file2", name: "File 2.htm" }
]
*/

class Treeview extends WidgetBase {
	#shadowRoot = null;
	#selectedItem = null;
	#rootContainer = null;
	#itemsFlat = [];
	#autoExpand = false;
	
	constructor() {
		super();
	}

	OnConnect() {
		this.#shadowRoot = super.Connect("treeview", true);

		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());
	}

	SetConfig(config) {
		this._setConfig(config);
		
		if(config.autoExpand === true)
			this.#autoExpand = true;
	}
	SetData(data) {
		this._setData(data);
		let prevState = this.GetState(); // store state of expanded items / selected item
		
		// destruct existing...
		if(this.#rootContainer) {
			this.#rootContainer.remove();
			this.#rootContainer = null;
		}
		this.#itemsFlat = [];

		if(data && data.items)
			this.#rootContainer = this.#constructList(this.#shadowRoot, data.items, true);
		
		this.SetState(prevState); // restore expanded folders / selected item etc...
	}
	SetState(state) {
		this._setState(state);
		var selectedId = state && (state.selectedId || !isNaN(state.selectedId)) ? (state.selectedId + "") : null;

		// set to default state (no item selected)
		if(this.#selectedItem) {
			this.#selectedItem.classList.remove("selected");
			this.#selectedItem = null;
		}

		if(selectedId || selectedId === 0) {
			// select item with id = selectedId
			let item = this.#itemsFlat.find((x) => x.id === selectedId);
			if(item) {
				this.#selectItem(item.el, true);
				
				// auto expand so selected item is visible
				let parent = item.el.parentElement;
				while(parent) {
					if(parent.parentTreeviewItem)
						this.#expand(parent.parentTreeviewItem);
					parent = parent.parentElement;
				}
			}
		}
		
		let expandedIds = state.expandedIds || [];
		for(let i = 0; i < expandedIds.length; i++) {
			let item = this.#itemsFlat.find((x) => x.id === expandedIds[i]);
			if(item)
				this.#expand(item.el);
		}
	}
	
	// override super.getstate
	GetState() {
		let state = super.GetState() || {};
		
		let expandedIds = [];
		for(let i = 0; i < this.#itemsFlat.length; i++) {
			let item = this.#itemsFlat[i];
			if(item.el.expanded)
				expandedIds.push(item.id);
		}
		if(expandedIds.length)
			state.expandedIds = expandedIds;
		
		return state;
	}

	#constructList(parent, items, expanded) {
		var container = document.createElement("div");
		container.classList.add("container");
		if(!expanded)
			container.style.display = "none";

		items.forEach((itemData) => {
			this.#constructItem(container, itemData);
		});
		parent.appendChild(container);
		return container;
	}

	#constructItem(parent, itemData) {
		let itemEl = document.createElement("div");
		itemEl.id = itemData.id; // why?
		itemEl.classList.add("item");
		itemEl.innerText = itemData.name;
		itemEl.style.backgroundImage = UI.IconUrl(itemData.icon);
		
		itemEl.addEventListener("mousedown", (ev) => {
			if(ev.ignore1 || ev.ignore) // todo add UI.Ignore(ev) to be more clear
				return;
			ev.ignore1 = true;
			if(ev.button !== 0)
				return;
			this.#selectItem(itemEl);
		});
		parent.append(itemEl);
		this.#itemsFlat.push({id:itemEl.id, el: itemEl});

		if(itemData.children && itemData.children.length > 0) {
			itemEl.classList.add("parent");
			itemEl.expanded = false;
			let expander = document.createElement("div");
			expander.classList.add("expander");
			itemEl.prepend(expander);
			var container = this.#constructList(parent, itemData.children, false);
			itemEl.subContainer = container;
			container.parentTreeviewItem = itemEl;
			expander.addEventListener("mousedown", (ev) => {
				if(ev.ignore)
					return;
				ev.ignore = true;
				this.#toggleExpand(itemEl);
			});
			UI.OnDoubleClick(itemEl, (ev) => {
				this.#toggleExpand(itemEl);
			});
		}
	}

	#selectItem(itemEl, quiet) {
		if(this.#selectedItem === itemEl)
			return;
		if(this.#selectedItem)
			this.#selectedItem.classList.remove("selected");
		this.#selectedItem = itemEl;
		itemEl.classList.add("selected");
		this._setState({selectedId: itemEl.id});
		if(!quiet)
			this.FireEvent("selected", itemEl.id);
	}

	#toggleExpand(itemEl) {
		if(itemEl.expanded) {
			this.#collapse(itemEl);
			this.FireEvent("collapsed", itemEl.id);
		}
		else {
			this.#expand(itemEl);
			this.FireEvent("expanded", itemEl.id);
		}
	}

	#expand(itemEl) {
		if(itemEl.expanded !== false)
			return;

		itemEl.expanded = true;
		itemEl.classList.add("expanded");
		itemEl.subContainer.style.display = null;
	}

	#collapse(itemEl) {
		if(itemEl.expanded !== true)
			return;

		itemEl.expanded = false;
		itemEl.classList.remove("expanded");
		itemEl.subContainer.style.display = "none";

		// select itemEl, if not selected, and a child element is selected
		if(this.#selectedItem && this.#selectedItem !== itemEl) {
			// need to find if selectedItem is child of itemEl's assocuated sub-container:
			let testItem = this.#selectedItem;
			while(testItem) {
				if(testItem === itemEl.subContainer) {
					this.#selectItem(itemEl);
					break;
				}
				testItem = testItem.parentElement;
			}
		}
	}
}

customElements.define("ui-treeview", Treeview);
