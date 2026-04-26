"use strict";

// todo:
// - tooltips
// - widgets in toolbar?
// - combined menu button (eg like font color button in Word)
// - default options, set if not set explicitly in config
// - "hidden" overflowMode option
// - fix overflow menu button not stretching to column width in vertical toolbar orientation when text beside buttons
// - don't depress button on middle/right click...

class ToolBar extends WidgetBase {
	#shadowRoot = null;
	#bar = null;
	#overflowButton = null;
	#data = {items: []};
	#toolbarEls = [];
	#menuData = [];
	#isRow = true;
	#resizeObserver = null;
	static _allToolbarsByWindow = {};
	#allToolbars = null;
	#buttonGroups = {};
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("toolbar");
		this.#bar = this.#shadowRoot.querySelector('.bar');
		this.#overflowButton = this.#shadowRoot.querySelector(".extra");
		
		let winUidStr = this.GetWin().GetUid() + "";
		ToolBar._allToolbarsByWindow[winUidStr] = ToolBar._allToolbarsByWindow[winUidStr] || [];
		this.#allToolbars = ToolBar._allToolbarsByWindow[winUidStr];
		this.#allToolbars.push(this);
		
		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());
	}
	disconnectedCallback() {
		let myIndex = this.#allToolbars.indexOf(this);
		this.#allToolbars.splice(myIndex, 1); // remove
		if(!this.#allToolbars.length)
			delete ToolBar._allToolbarsByWindow[this.GetWin().GetUid() + ""];
	}
	
	#mouseDownHandlerForContextMenu = (ev) => {
		if(ev.button !== 2)
			return;
		UI.OpenMenu(this.GetConfig().contextMenu, {x:ev.clientX, y:ev.clientY, w:0, h:0}, (cmd) => {
			if(cmd !== null)
				this.FireEvent("contextMenuCommand", cmd);
		});
	}
	
	#overflowButtonWidth = new LazyLoader(() => {
		let obw = this.#overflowButton;
		let wasHidden = getComputedStyle(obw).display === "none";
		if(wasHidden)
			obw.style.setProperty("display", "unset", "important");
		let val = this.#isRow ? obw.getBoundingClientRect().width : obw.getBoundingClientRect().height;
		if(wasHidden)
			obw.style.display = null;
		return val;
	});
	
	#buttonPositionsLoaded = false;
	#loadButtonPositions() {
		let barX = null;
		for(let i = 0; i < this.#data.items.length; i++) {
			let toolbarEl = this.#toolbarEls[i];
			if(barX === null)
				barX = this.#isRow ? this.#bar.getBoundingClientRect().x : this.#bar.getBoundingClientRect().y
			toolbarEl.xwPos = (this.#isRow ? toolbarEl.getBoundingClientRect().right : toolbarEl.getBoundingClientRect().bottom) - barX;
			toolbarEl.width_ = toolbarEl.getBoundingClientRect().width;
		}
		this.#buttonPositionsLoaded = true;
	};
	
	#buildOverflowMenuData() {
		this.#menuData.length = 0; // want to keep same array as overflow menu button references it
		
		for(var i = 0; i < this.#data.items.length; i++) {
			let toolbarItem = this.#data.items[i];
			let menuItem = {};
			if(toolbarItem.separator)
				menuItem.separator = true;
			else {
				menuItem.name = toolbarItem.name;
				menuItem.icon = toolbarItem.icon;
				menuItem.enabled = !toolbarItem.disabled;
				menuItem.command = i;
				menuItem.children = toolbarItem.menu;
			}
			this.#menuData.push(menuItem);
		};
	}
	
	// called by ResizeObserver whenever toolbar is resized, when in overflow mode.
	//		3.0 if haven't already, record all button right-side positions
	//		3.1 determine what elements are overflowed
	//		3.2 set display:none on those elements
	//		3.3 modify overflow menu button menu data to set overflowed items visible, other items not visible
	#onToolbarResizeInOverflowMenuMode(barWidth) {
		if(!this.#buttonPositionsLoaded)
			this.#loadButtonPositions();
		
		let nOverflowed = 0;
		let nVisible = 0;
		let obw = 0;
		for(let i = this.#data.items.length - 1; i >= 0; i--) { // go backwards to figure out if need to include onerflow button width for next item to the left....
			let toolbarEl = this.#toolbarEls[i];
			
			if(nOverflowed > 0 && obw === 0)
				obw = this.#overflowButtonWidth.Get();
			let testPos = barWidth - obw;
			let visible = toolbarEl.xwPos < testPos;
			toolbarEl.visible_ = visible;
			
			if(!visible)
				nOverflowed++;
			else
				nVisible++;
			if(nOverflowed && nVisible === 1) {
				// we have come (backwards) to the first visible item, when overflow menu is visible
				// if exists, remove separator from very last of visible items on toolbar.
				if(this.#data.items[i].separator) {
					toolbarEl.visible_ = false;
					visible = false;
				}
			}
			toolbarEl.style.display = visible ? null : "none";
		}
		if(nOverflowed > 0)
			this.#bar.classList.add("overflow");
		else
			this.#bar.classList.remove("overflow");
		this.#setOverflowMenuVisibleItems();
	}
	
	#setOverflowMenuVisibleItems() {
		var nHidden = 0;
		for(var i = 0; i < this.#data.items.length; i++) {
			this.#menuData[i].visible = !this.#toolbarEls[i].visible_;
			if(this.#menuData[i].visible)
				nHidden++;
			if(nHidden === 1 && this.#data.items[i].separator) // don't include separator at very start of menu
				this.#menuData[i].visible = false;
		}
	}
	
	// don't show separators as first or last child of any flex row/column. CSS can't do
	// this but we can do it in javascript:
	#onToolbarResizeInWrapMode() {
		let isRow = this.#isRow;
				
		let separatorWidth = 0; // (margin + actual box height) todo - set globally
		let previousEl = null;
		let previousElX = null;
		let previousSeparator = false;
		let shiftLeft = false;
		
		for(let i = 0; i < this.#toolbarEls.length; i++) {
			let el = this.#toolbarEls[i];
			let elX = isRow ? el.getBoundingClientRect().x : el.getBoundingClientRect().y;
			if(el.wasShiftedLeft)
				elX += separatorWidth;
			let isSeparator = this.#data.items[i].separator;
			if(isSeparator && separatorWidth === 0)
				separatorWidth = 12 + (isRow ? el.getBoundingClientRect().width : el.getBoundingClientRect().height);
				// (todo - get margin from css file? // get actual height as rendered by browser... margin (6 + 6) seems OK though.)
			let isNewRow = previousEl && previousElX > elX;
			
			// reset styles to default...
			if(isSeparator && el.hidden_) {
				el.style.visibility = null;
				el.hidden_ = false;
			}
			if(!isSeparator && el.wasShiftedLeft) {
				if(isRow)
					el.style.left = null;
				else
					el.style.top = null;
				el.wasShiftedLeft = false;
			}
			
			// alter styles to hide first/last child separators, and shift left siblings (in row) after hidden first child separator
			if(isNewRow) {
				if(isSeparator) {
					el.style.visibility = "hidden";
					el.hidden_ = true;
					shiftLeft = true;
				}
				else
					shiftLeft = false;
			}
			else if(shiftLeft) {
				if(isRow)
					el.style.left = "-" + separatorWidth + "px";
				else
					el.style.top = "-" + separatorWidth + "px";
				el.wasShiftedLeft = true;
			}
			if(isNewRow && previousSeparator) {
				previousEl.style.visibility = "hidden";
				previousEl.hidden_ = true;
			}
			
			previousEl = el;
			previousElX = elX;
			previousSeparator = isSeparator;
		}
	}
	
	// expand flex container to fit all columns...
	// only reason for this is that browsers seem to have trouble expanding the flex container width
	// when contents are set to wrap and flex-direction is set to column. The elements' boundingClientRects
	// already have correct coordinates (ie, the flex items are in the right places in each column), we just
	// need to use those to calculate the required width of the toolbar, then manually set the container
	// (this.#bar) to that width so that everything can actually be shown.
	#onToolbarResizeInWrapModeVertical() {
		let colWidth = 0;
		let totalWidth = 0;
		let x = this.#toolbarEls[0].getBoundingClientRect().x;
		let right = this.#toolbarEls[this.#toolbarEls.length - 1].getBoundingClientRect().right; // hopefully the last element is also max width... todo: check this
		let width = right - x;
		this.#bar.style.width = width + 0.5 + "px"; // do we need +0.5?
	}
	
	#commandCallback = (menuButtonCommand, i) => {
		if(menuButtonCommand) {
			// command from menu button or submenu from menu button in overflow menu
			this.FireEvent("command", menuButtonCommand);
			return;
		}
		var item = this.#data.items[i];
		var btnEl = this.#toolbarEls[i];
		var menuDataItem = this.#menuData[i];
		if(!menuDataItem)
			console.error("this is very bad");
		if(item.toggleOffCommand) { // item is a toggle button: read its state, send appropriate command, and change to new state
			btnEl.pressed_ = !btnEl.pressed_;
			if(btnEl.pressed_) {
				btnEl.classList.add("pressed");
				if(menuDataItem) // doesn't exist in wrap mode
					menuDataItem.leftText = '*';
				if(btnEl.buttonGroup_) {
					// un-select any other toolbar buttons with same button group (even in other toolbars, in same window)
					// 1. get all toolbar widget elements
					// 2. for each toolbar widget, call toolbar.deselectButtonsOfGroup(buttonGroup)
					// note - toggleOffCommand not fired for other buttons in group when they are deselected
					for (let i = 0; i < this.#allToolbars.length; i++)
						this.#allToolbars[i].DeselectButtonsOfGroup(btnEl.buttonGroup_, this.#allToolbars[i] === this ? btnEl.index_ : null);
				}
				if(item.command)
					this.FireEvent("command", item.command);
			}
			else {
				btnEl.classList.remove("pressed");
				if(menuDataItem) // doesn't exist in wrap mode
					menuDataItem.leftText = null;
				if(item.toggleOffCommand)
					this.FireEvent("command", item.toggleOffCommand);
			}
			this._setState(this.#buildState()); // store state of toggle buttons presses
		}
		else if(item.command)
			this.FireEvent("command", item.command);
	};
	
	DeselectButtonsOfGroup(buttonGroup, ignoreButtonIndex) {
		let group = this.#buttonGroups[buttonGroup];
		if(!group)
			return;
		for(let i = 0; i < group.length; i++) {
			let btnEl = group[i];
			if(ignoreButtonIndex === btnEl.index_)
				continue;
			btnEl.pressed_ = false;
			btnEl.classList.remove("pressed");
			let menuDataItem = this.#menuData[btnEl.index_];
			if(menuDataItem) // doesn't exist in wrap mode
				menuDataItem.leftText = null;
		}
	}
	
	SetConfig(config) {
		this._setConfig(config);
		
		// set to initial config (no config)
		this.#bar.classList.remove("large-icons", "small-icons", "text-under", "text-beside", "text-none", "vertical", "horizontal", "wrap", "overflow");
		this.#bar.removeEventListener("mousedown", this.#mouseDownHandlerForContextMenu);
		for(var i = 0; i < this.#data.items.length; i++) {
			this.#toolbarEls[i].style.visibility = null;
			this.#toolbarEls[i].style.display = null;
			this.#toolbarEls[i].hidden_ = false;
			this.#toolbarEls[i].visible_ = true;
		}
		this.#overflowButtonWidth.Clear();
		this.#buttonPositionsLoaded = false;
		
		if(!config)
			return;
		
		// set configuration specified
		if(config.iconSize === "large")
			this.#bar.classList.add("large-icons");
		else // "small" or not specified
			this.#bar.classList.add("small-icons");
		
		if(config.textPosition === "under")
			this.#bar.classList.add("text-under");
		else if(config.textPosition === "beside")
			this.#bar.classList.add("text-beside");
		else // "none" or not specified
			this.#bar.classList.add("text-none");
			
		if(config.orientation === "vertical") {
			this.#bar.classList.add("vertical");
			this.#isRow = false;
		}
		else {
			this.#bar.classList.add("horizontal");
			this.#isRow = true;
		}
		
		if(config.contextMenu)
			this.#bar.addEventListener("mousedown", this.#mouseDownHandlerForContextMenu);
		
		if(config.overflowMode === "wrap") {
			this.#bar.classList.add("wrap");
			UI.SetAsMenuButton(this.#overflowButton, null);
		}
		else if(config.overflowMode === "menu") {
			UI.SetAsMenuButton(this.#overflowButton, this.#menuData, (index) => {
				if(Number.isInteger(index)) // from top-level toolbar item in overflow menu
					this.#commandCallback(null, index);
				else // from menubutton toolbar's sub-menu in oveflow menu, index is the command to fire (string)
					this.#commandCallback(index);
			}, true);
		}
		
		if(!this.#resizeObserver) {
			this.#resizeObserver = new ResizeObserver((entries) => {
				if(this.#shadowRoot.styleSheets.length === 0) // todo - only need this check if using <link> tags for stylesheets
					return; // stylesheet not loaded yet, widths will be wrong...
				let barWidth = this.#isRow ? entries[0].contentRect.width : entries[0].contentRect.height;
				if(barWidth === 0) // hidden
					return;
				// ok, toolbar is visible...
				if(this.GetConfig().overflowMode === "menu") {
					this.#onToolbarResizeInOverflowMenuMode(barWidth);
				}
				if(this.GetConfig().overflowMode === "wrap") {
					this.#onToolbarResizeInWrapMode();
					if(!this.#isRow)
						this.#onToolbarResizeInWrapModeVertical();
				}
			});
		}
		else
			this.#resizeObserver.disconnect(); // unobserve this.#bar - so that resize handler will fire when observed again.
		this.#resizeObserver.observe(this.#bar); // (resize handler is fired initially on begin observation.)
	}
	
	SetData(data) {
		this._setData(data);
        data = data || {};
        data.items = data.items || [];
		this.#data = data;
		
		// destruct toolbar, if necessary
		this.#toolbarEls = [];
		this.#bar.replaceChildren();
		this.#bar.appendChild(this.#overflowButton);
		
		this.#buttonGroups = {};
		
		while(this.#menuData.length)
			this.#menuData.pop();
		// todo - need to trigger resize event handlers if in vert wrap mode?
		
		this.#buildOverflowMenuData();
		
		// construct toolbar
		let i = 0;
		data.items.forEach((btn) => {
			let index = i++;
			let btnEl;
			let menuDataItem = this.#menuData[index];
			if(btn.separator) {
				btnEl = document.createElement("div");
				btnEl.classList.add("separator");
			}
			else {
				btnEl = document.createElement("button");
				btnEl.index_ = index;
				btnEl.innerText = btn.name;
				btnEl.classList.add("button");
				if(btn.buttonGroup) {
					btnEl.buttonGroup_ = btn.buttonGroup;
					this.#buttonGroups[btn.buttonGroup] = this.#buttonGroups[btn.buttonGroup] || [];
					this.#buttonGroups[btn.buttonGroup].push(btnEl);
				}
				if(btn.icon)
					btnEl.style.backgroundImage = "url(" + UI.Icons[btn.icon] + ")"; //todo allow base64 or app-defined icons
				if(btn.disabled)
					btnEl.classList.add("disabled");
				if(btn.menu)
					UI.SetAsMenuButton(btnEl, btn.disabled ? null : btn.menu, this.#commandCallback, true);
				else {
					btnEl.addEventListener('click', (ev) => {
						if(ev.button !== 0)
							return; // don't respond to middle/right clicks - only respond to primary button
						if(btn.disabled)
							return;
						this.#commandCallback(null, index);
					});
				}
			}
			this.#bar.appendChild(btnEl);
			if(btn.breakAfter) {
				let breakEl = document.createElement("div");
				breakEl.classList.add("break");
				this.#bar.appendChild(breakEl);
			}
			this.#toolbarEls.push(btnEl);
		});
	}
	
	#buildState() {
		var pressedToggleButtonIds = [];
		for(var i = 0; i < this.#data.items.length; i++) {
			if(this.#toolbarEls[i].pressed_)
				pressedToggleButtonIds.push(this.#data.items[i].id);
		}
		return { pressedToggleButtonIds: pressedToggleButtonIds };
	}
	
	SetState(state) {
		this._setState(state);
		for(var i = 0; i < this.#data.items.length; i++)
		{
			let item = this.#data.items[i];
			if(!item.toggleOffCommand)
				continue; // item is not toggle button.
			
			// ok, item is toggle button, set it pressed if id specified in state.pressedToggleButtonIds:
			let pressed = state && state.pressedToggleButtonIds && state.pressedToggleButtonIds.includes(item.id);
			if(pressed && !this.#toolbarEls[i].pressed_) {
				this.#toolbarEls[i].pressed_ = true;
				this.#toolbarEls[i].classList.add("pressed");
				this.#menuData[i].leftText = "*";
			}
			else if(!pressed && this.#toolbarEls[i].pressed_) {
				this.#toolbarEls[i].pressed_ = false;
				this.#toolbarEls[i].classList.remove("pressed");
				this.#menuData[i].leftText = "";
			}
		}
	}
}

customElements.define("ui-toolbar", ToolBar);
