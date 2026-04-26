// todo:
// - tooltips
// - default options, set if not set explicitly in config

// 	config: {
//		contextMenu: [menuData],
//      itemContextMenu: [menuData],
//      multipleItemsContextMenu: [menuData],
//      orientation: "row" | "column,
// }
// data: [
//      icon: string,
//      label: string,
//      id: string,
// ]
// state: {
//      selectedItemIds: ['id1', 'id2', ...],
// }

"use strict";

class Iconview extends WidgetBase {
	#shadowRoot = null;
	#container = null;
    #itemEls = [];
	#selectedItemEls = [];
    #oldSelectedItemEls = [];
    #dragBox = null;

	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("iconview", true);
		this.#container = document.createElement("div");
		this.#container.classList.add("container");
        this.#shadowRoot.append(this.#container);
        this.#dragBox = document.createElement("div");
        this.#dragBox.classList.add("dragbox");

		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());

        this.#container.addEventListener("mousedown", (ev) => {
            if(ev.button === 1) // middle button
                return;
            // do nothing if click is on either scrollbar
            if((ev.clientX >= this.#container.getBoundingClientRect().x + this.#container.clientWidth) ||
                (ev.clientY >= this.#container.getBoundingClientRect().y + this.#container.clientHeight))
                return;
			
			// if was click on icon...
			let itemEl = null;
			if(ev.target.classList.contains("item"))
				itemEl = ev.target;
			else if(ev.target.classList.contains("icon") || ev.target.classList.contains("label"))
				itemEl = ev.target.parentElement;
			if(itemEl !== null) {
				this.#onItemMouseDown(itemEl, ev);
				return;
			}
			
            this.#deselectAll();
            this.#notifySelection();

            if(ev.button === 2) { // right button
                let menuData = this.GetConfig().contextMenu;
                if(menuData && menuData.length) {
                    UI.OpenMenu(menuData, {x:ev.clientX, y:ev.clientY, w:0, h:0}, (cmd) => {
                        if(cmd !== null)
                            this.FireEvent("contextMenuCommand", cmd);
                    });
                }
            }
            else if(ev.button === 0){ // left button
                let dragInfo = {
                    startScrollLeft: this.#container.scrollLeft,
                    startScrollTop: this.#container.scrollTop,
                    startx: ev.clientX,
                    starty: ev.clientY,
                    maxX: this.#container.scrollWidth,
                    maxY: this.#container.scrollHeight,
                }
                UI.SetDraggingFunc((ev,done) => {
                    if(done) {
                        this.#dragBox.style.display = "none";
                        return;
                    }
                    this.#updateDragbox(dragInfo, ev);
                });
            }
        });
	}

	#updateDragbox(dragInfo, ev) {
        let dxScroll = this.#container.scrollLeft - dragInfo.startScrollLeft;
        let dx = ev.clientX - dragInfo.startx + dxScroll;
        let x = dragInfo.startx - this.#container.getBoundingClientRect().x + dragInfo.startScrollLeft;
        let w = dx;
        if(dx < 0) {
            x += dx;
            w = -dx;
        }
        if(x + w > dragInfo.maxX)
            w = dragInfo.maxX - x;

        let dyScroll = this.#container.scrollTop - dragInfo.startScrollTop;
        let dy = ev.clientY - dragInfo.starty + dyScroll;
        let y = dragInfo.starty - this.#container.getBoundingClientRect().y + dragInfo.startScrollTop;
        let h = dy;
        if(dy < 0) {
            y += dy;
            h = -dy;
        }
        if(y + h > dragInfo.maxY)
            h = dragInfo.maxY - y;

        // update selection
        // todo: optimise this especially for selection large numbers of icons (eg 10,000)
        // 1. deselect all
        this.#deselectAll();
        // 2. select all icons intersecting dragbox
        let toSelect = [];
        let i = 0;
        this.#itemEls.forEach((itemEl) => {
            let itemData = itemEl._itemData;
            let itemX = itemEl.offsetLeft;
            let itemY = itemEl.offsetTop;
            let bbox = itemEl.getBoundingClientRect();
            let itemW = bbox.width;
            let itemH = bbox.height;
            if(( !((x + w < itemX) || (x > itemX + itemW)) ) && // x-intersect
               ( !((y + h < itemY) || (y > itemY + itemH)) )) // y-intersect
                toSelect.push(itemEl);
        });
        toSelect.forEach((itemEl) => { this.#selectItemEl(itemEl); });
        this.#notifySelection();

        this.#dragBox.style.display = "block";
        this.#dragBox.style.left = x + "px";
        this.#dragBox.style.top = y + "px";
        this.#dragBox.style.width = w + "px";
        this.#dragBox.style.height = h + "px";
    }

    #onItemMouseDown(itemEl, ev) {
        if(ev.button === 0) { // left button
            this.#deselectAll();
            this.#selectItemEl(itemEl);
            this.#notifySelection();
            return;
        }

        // right button...
        if(!itemEl._selected) {
            this.#deselectAll();
            this.#selectItemEl(itemEl);
            this.#notifySelection();
        }
        let menuData = this.#selectedItemEls.length === 1
            ? this.GetConfig().itemContextMenu
            : this.GetConfig().multipleItemsContextMenu;
        if(menuData && menuData.length) {
            UI.OpenMenu(menuData, {x:ev.clientX, y:ev.clientY, w:0, h:0}, (cmd) => {
                if(cmd !== null)
                    this.FireEvent("itemContextMenuCommand", cmd);
            });
        }
    }

	SetConfig(config) {
		this._setConfig(config);
        if(config.orientation === "column")
            this.#container.style.flexDirection = "column";
        else
            this.#container.style.flexDirection = "row";
	}
	SetData(data) {
		this._setData(data);
		data = data || {};
		this.#itemEls = [];
        this.#selectedItemEls = [];
        this.#oldSelectedItemEls = [];

		this.#container.replaceChildren();
        this.#container.append(this.#dragBox);
		
        if(!data.items)
            return;
		data.items.forEach((itemData) => {
            let iconEl = document.createElement("div");
            iconEl.style.backgroundImage = UI.IconUrl(itemData.icon);
            iconEl.classList.add("icon");

            let labelEl = document.createElement("div");
			labelEl.innerText = itemData.label;
            labelEl.classList.add("label");

			let itemEl = document.createElement("div");
            itemEl.appendChild(iconEl);
            itemEl.appendChild(labelEl);
            itemEl._itemData = itemData;
			itemEl.classList.add("item");
			//itemEl.addEventListener("mousedown", (ev) => { this.#onItemMouseDown(itemEl, ev); });
			//UI.OnDoubleClick(itemEl, (ev) => { this.FireEvent("open", itemData.id); });
			this.#container.appendChild(itemEl);
            this.#itemEls.push(itemEl);
		});
	}
	SetState(state) {
		//console.log("icons... setting state=",state);
		//console.log("existing icons:", this.#itemEls);
		this._setState(state);
        state = state || {};
        state.selectedItemIds = state.selectedItemIds || [];
        this.#deselectAll();
        state.selectedItemIds.forEach(itemId => {
            if(!itemId)
                return;
            let itemEl = this.#itemEls.find((el) => {
                return el._itemData.id === itemId;
            });
            if(!itemEl)
                return;
            this.#selectItemEl(itemEl);
        });
        this.#oldSelectedItemEls = [];
	}
	
	// TODO implementat
	// override WidgetBase.GetState()
	GetState() {
		return {
			selectedItemIds: this.#selectedItemEls.map((itemEl) => { return itemEl._itemData.id; }),
		};
	}

    // todo: test all select/deselect methods
    #notifySelection() {
        // only fire event if selection has changed
        // todo: optimise this especially for selection large numbers of icons (eg 10,000)
        let newlySelectedItems = this.#selectedItemEls.filter(itemEl => !this.#oldSelectedItemEls.includes(itemEl));
        let newlyDeselectedItems = this.#oldSelectedItemEls.filter(itemEl => !this.#selectedItemEls.includes(itemEl));
        if(newlySelectedItems.length === 0 && newlyDeselectedItems.length === 0)
            return;

        this.FireEvent("selectionChanged", this.#selectedItemEls.map((itemEl) => { return itemEl._itemData.id; }));
        this.#oldSelectedItemEls = this.#selectedItemEls.slice(); // clone array
    }
	#selectItemEl(itemEl) {
        let idx = this.#selectedItemEls.indexOf(itemEl);
        if(idx >= 0)
            return;
		this.#selectedItemEls.push(itemEl);
		itemEl.classList.add("selected");
        itemEl._selected = true;
	}

	#deselectItemEl(itemEl) {
        let idx = this.#selectedItemEls.indexOf(itemEl);
        if(idx < 0)
            return;
        itemEl.classList.remove("selected");
        itemEl._selected = false;
        this.#selectedItemEls.splice(idx, 1);
    }

    #selectAll() {
        this.#selectedItemEls = [];
        this.#itemEls.forEach((itemEl) => {
            this.#selectedItemEls.push(itemEl);
            itemEl.classList.add("selected");
            itemEl._selected = true;
        });
    }

    #deselectAll() {
        while(this.#selectedItemEls.length) {
            let itemEl = this.#selectedItemEls.pop();
            itemEl.classList.remove("selected");
            itemEl._selected = false;
        }
    }
}

customElements.define("ui-iconview", Iconview);
