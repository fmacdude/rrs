"use strict";

class MenuBar extends WidgetBase {
	#shadowRoot = null;
	#bar = null;
	#active = false;
	#selectedTop = null;
	#firstClick = false;
	#commandCallback = null;
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("menubar");
		this.#bar = this.#shadowRoot;
		
		this.#setCommandCallback((cmd) => { this.FireEvent("command", cmd); });
		
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


        //console.log("\n\nwidget_menubar.js: setting data =", data);

		// set to original state
		UI.CloseMenu();
		this.#clearActive();
		while(this.#bar.children.length > 1) // stylesheet is at [0]
			this.#bar.children[1].remove();
		
		this.#constructMenu(data.items || []);
	}
	SetState(state) {
		this._setState(state);
	}
	
	#setCommandCallback(callback) {
		this.#commandCallback = (cmd) => {
			this.#clearActive();
			if(cmd && callback) // if cmd = null, menu was closed but no item selected (ie, user clicked away from menu)
				callback(cmd);
		};
	}
	#setActive(topItem) {
		this.#active = true;
		topItem.classList.add("selected");
		this.#selectedTop = topItem;
		this.#firstClick = true;
	}
	#clearActive() {
		this.#active = false;
		if(this.#selectedTop)
			this.#selectedTop.classList.remove("selected");
	}
	
	#constructMenu(data) {
		data.forEach((topItem) => {
			var top = document.createElement("div");
			top.classList.add("top");
			top.append(topItem.name);
			if(topItem.visible === false)
				top.style.display = "none";
			this.#bar.appendChild(top);
			top.addEventListener("mousedown", (ev) => {
				if(ev.button !== 0)
					return; // don't respond to middle/right clicks - only respond to primary button
				if(!this.#active)
					this.#setActive(top);
				else if(top === this.#selectedTop) // don't re-open menu if already open
					return;
				var rect = top.getBoundingClientRect();
				UI.OpenMenu(topItem.children, {x:rect.x, y:rect.y, w:rect.width, h:rect.height}, this.#commandCallback, this, true);
			});
			top.addEventListener('mouseover', () => {
				if(!this.#active)
					return;
				if(top === this.#selectedTop)
					return;
				this.#selectedTop.classList.remove("selected");
				top.classList.add("selected");
				this.#selectedTop = top;
				var rect = top.getBoundingClientRect();
				UI.OpenMenu(topItem.children, {x:rect.x, y:rect.y, w:rect.width, h:rect.height}, this.#commandCallback, this);
			});
		});
	}
}

customElements.define("ui-menubar", MenuBar);
