"use strict";

class UiWindow extends HTMLElement {
	static #windowsByUid = {};
	static _addWindow(win) {
		this.#windowsByUid[win.GetUid()] = win;
	}
	static GetWindowByUid(uid) {
		return this.#windowsByUid[uid];
	}
	static _removeWindowUid(uid) {
		delete this.#windowsByUid[uid];
		UI.MarkRemovedUid(uid);
	}
	
	#widgetsById = {};
	AddWidget(widget) {
		let id = widget.GetId();
		if(id)
			this.#widgetsById[id] = widget;
	}
	GetWidgetById(id) {
		return this.#widgetsById[id];
	}
	ChangeWidgetId(widget, oldId, newId) {
		if(oldId === newId)
			return;
		if(oldId)
			delete this.#widgetsById[oldId];
		if(newId)
			this.#widgetsById[newId] = widget;
	}
	RemoveWidgetId(widgetId) {
		if(widgetId)
			delete this.#widgetsById[widgetId];
	}
	
	#uid = UI.GetNextUid();		GetUid() 			{ return this.#uid; }
	
	#process = null;
	GetProcess() {
		return this.#process;
	}
	SetProcess(process) {
		if(this.#process !== null)
			console.error("this is very bad");
		else
			this.#process = process;
	}
	
	#shadowRoot = null;
	#appOpsMenu = 				[{name: "App info", command: "appinfo"}, {name: "Kill app", command: "kill"}]; // todo - allow app to add custom entries here?
								GetAppOpsMenu() { return this.#appOpsMenu; }
	#winOpsMenu = 				[];
								GetWinOpsMenu() { return this.#winOpsMenu; }
	#icon = null;				GetIcon()			{ return this.#icon; } // note: setter defined below
	#title = null;				GetTitle()			{ return this.#title; } // note: setter defined below
	#titlebarEl = null;
	#titleEl = null;
	#iconEl = null;
	#content = null;			GetContentElement() { return this.#content; }
	#container = null;			GetContainer()		{ return this.#container; }
	#mouseblock = null;
	#modalfreeze = null;
	#posRect = { x:0, y:0, w:100, h:100 };
	#restoredRect = null;
	#maximized = false;
	#minimized = false;
	#focused = null;
	#zIndex = 0;
	#canRefocus = true;
	#data = null;
	#config = null;
	#events = [];
	#resizable = true;			GetResizable()			{ return this.#resizable; }
	#modalChildWin = null;		GetModalChildWin()		{ return this.#modalChildWin; }
	#modalParentWin = null;		GetModalParentWin()		{ return this.#modalParentWin; }
								SetModalParentWin(win) 	{ this.#modalParentWin = win; }
	
	constructor() {
		super();
	}
	
	static NewWindow(process, data, modalParentWin) {
		let win = document.createElement("ui-window");
		win.SetProcess(process);
		process.AddWindow(win);
		this._addWindow(win);
		win.SetData(data.data);
		win.SetConfig(data.config);
		win.SetModalParentWin(modalParentWin);
		UI.GetWindowsPane().append(win); // actually add onto the screen
		return win;
	}
	
	connectedCallback() {
		this.#shadowRoot = this.attachShadow({mode:"closed"});
		this.#shadowRoot.appendChild(document.getElementById("window-template").content.cloneNode(true));
        this.#shadowRoot.prepend(document.getElementById("webkit-scrollbar-style-template").content.cloneNode(true));
		this.#iconEl = this.#shadowRoot.querySelector(".titlebar-icon");
		this.#titleEl = this.#shadowRoot.querySelector(".titlebar-title");
		this.#titlebarEl = this.#shadowRoot.querySelector(".titlebar");
		this.#content = this.#shadowRoot.querySelector(".content");
		this.#container = new Container(this.#content, null, null, null, this);
		this.#mouseblock = this.#shadowRoot.querySelector(".mouseblock");
		this.#modalfreeze = this.#shadowRoot.querySelector(".modalfreeze");
		
		// apply config
		let cfg = this.#config;
		// todo tidy up icon code, and allow for no icon
		if(cfg.icon.indexOf("data:") === 0)
			this.SetIcon(cfg.icon);
		else
			this.SetIcon(UI.Icons[cfg.icon]);
		this.SetTitle(cfg.title || "");
		if(this.#modalParentWin) {
			// hide maximize and minimize buttons
			this.#shadowRoot.querySelectorAll(".titlebar-maximize, .titlebar-minimize").forEach((el) => {
				el.style.display = "none";
			});
		}
		
		UI.ApplyContainerLayout(this.#content, cfg.containerLayout);
		
		// apply data
		this.#data.forEach((widgetData) => {
			this.#container.AppendWidget(widgetData);
		});
		
		this.#resizable = !(cfg.resizable === false); // default = true
		if(cfg.fitInitialContent) {
			// 1. set window, content element styles such that window mirrors shape of contents
			this.#content.style.contain = "none";
			this.#content.style.position = "static";
			
			// 2. read window width/height
			// reading offsetWidth should trigger style recalc/relayout with newly added widgets...
			// but doesn't always work in Chrome as of v109. May be fixed in newer versions? OK in Firefox.
			cfg.width = Math.ceil(this.offsetWidth);
			cfg.height = Math.ceil(this.offsetHeight);
			
			// 3. reverse style changes in (1.) (width/height will be applied below...)
			this.#content.style.contain = null;
			this.#content.style.position = null;
		}
		
		// todo - detect or reject string numbers from windowData.config...
		// todo - add centerOnParent option
		let pos = {
			x:0, // to be filled below
			y:0, // to be filled below
			w: (cfg.width !== undefined && cfg.width !== null) ? cfg.width : 500,
			h: (cfg.height !== undefined && cfg.height !== null) ? cfg.height : 500,
		};
		let screenEdgeBuffer = 20; // don't allow window to be positioned within 20px of edge of screen
		// positioning for x,y: strategies... (need to know width/height first)
		if(cfg.x === "center")
			pos.x = Math.round((UI.GetScreenWidth() - pos.w) / 2);
		else if(cfg.x === undefined || cfg.x === null) { // random
			let range = UI.GetScreenWidth() - pos.w - (2 * screenEdgeBuffer);
			if(range < 0)
				pos.x = screenEdgeBuffer;
			else
				pos.x = Math.round(Math.random() * range) + screenEdgeBuffer;
		}
		else
			pos.x = cfg.x;
		
		if(cfg.y === "center")
			pos.y = Math.round((UI.GetScreenHeight() - pos.h) / 2);
		else if(cfg.y === undefined || cfg.y === null) { // random
			let range = UI.GetScreenHeight() - pos.h - (2 * screenEdgeBuffer);
			if(range < 0)
				pos.y = screenEdgeBuffer;
			else
				pos.y = Math.round(Math.random() * range) + screenEdgeBuffer;
		}
		else
			pos.y = cfg.y;
		this.SetPos(pos);
		
		// create context menu
		if(!this.#modalParentWin) { // not modal...
			this.#winOpsMenu.push({ name: "Minimize", command: "minimize", });
			this.#winOpsMenu.push({ name: "Maximize", command: "maximize", enabled: this.#resizable, });
		}
		this.#winOpsMenu.push({name: "Close", command: "close"});
		
		this.#attachEventHandlers();
	}
	
	ExecuteCommand(cmd) {
		this.#commandProcessor(cmd);
	}
	
	#commandProcessor = (cmd) => {
		switch(cmd) {
            //todo: distinguish maximize from restore
			case "maximize":
			this.Maximize();
			break;
			
			case "minimize":
			this.Minimize();
			break;
			
			case "close":
			OS.FireEvent(this, "requestClose", null);
			break;
			
			case "kill":
			this.#process.Kill();
			break;
			
			case "appinfo":
			break;
		}
	};
	
	Close(force) {
		if(this.#modalChildWin && force !== true)
			return;
		this.#container.RemoveOnParentWidgetRemove();
		// (calling Remove will recursively call Remove on each widget and container in the window.
		//  maybe can optimise by specifiying flag to not remove widget from DOM, then remove from
		// DOM in one hit with this.remove().)
		WM.RemoveWindow(this, force);
		this.remove();
		this.#process.RemoveWindow(this);
		UiWindow._removeWindowUid(this.#uid);
	}
	Minimize() {
		if(this.#modalParentWin || this.#modalChildWin)
			return;
		
		this.ToggleMinimized();
		OS.FireEvent(this, "minimize", null);
	}
	Maximize() {
		if(!this.#resizable)
			return;
		if(this.#modalParentWin || this.#modalChildWin)
			return;
		if(this.#maximized)// restore
			this.SetRestored(this.#restoredRect);
		else { // maximize
			this.#maximized = true;
			this.#restoredRect = {x: this.#posRect.x, y: this.#posRect.y, w: this.#posRect.w, h: this.#posRect.h};
			let taskbarHeight = UI.GetTaskbar().GetHeight();
			this.SetMaximized(0,0,taskbarHeight,0);
		}
		OS.FireEvent(this, "maximize", null);
	}
	UpdateMaximized(state) { // used to restore window from in window element when dragging maximized title bar...
		this.#maximized = state;
		if(state === false)
			this.#restoredRect = null;
		//? need more code? how does it work?
	}
	
	SetIcon(iconUri) {
		this.#icon = iconUri;
		if(this.#iconEl !== null)
			this.#iconEl.setAttribute("src", iconUri);
	}
	
	SetTitle(title) {
		this.#title = title;
		this.#titleEl.innerText = title;
	}
	// currently only intended to be called once before window added to DOM
	SetConfig(config) {
		this.#config = config || {};
	}
	// currently only intended to be called once before window added to DOM
	SetData(data) {
		this.#data = data || [];
	}
	SetEvents(events) {
		if(events)
			this.#events = events;
	}
	GetZIndex() {
		return this.#zIndex;
	}
	
	_getTopLevelModalParentWin() {
		let topLevelModalParentWin = this;
		while(topLevelModalParentWin.GetModalParentWin())
			topLevelModalParentWin = topLevelModalParentWin.GetModalParentWin();
		return topLevelModalParentWin;
	}
	
	// todo flash modal child window border or something to let user know they need to interact with the modal window first
	Focus(walkingModalChain) {
		if(!walkingModalChain) {
			let modalChildWin = this._getTopLevelModalParentWin();
			while(modalChildWin) {
				modalChildWin.Focus(true);
				modalChildWin = modalChildWin.GetModalChildWin();
			}
			return;
		}
		
		if(this.#focused === true)
			return;
		if(this.#minimized) {
			this.ToggleMinimized();
			return;
		}
		this.#focused = true;
		this.#canRefocus = true;
		var newZ = WM.GetNextZIndex();
		this.#zIndex = newZ;
		this.#shadowRoot.host.style.zIndex = newZ + "";
		this.#titlebarEl.style.background = "var(--titlebar-bg)";
		this.#titlebarEl.style.color = "var(--titlebar-font-col)";
		WM.DefocusOthers(this);
		UI.GetTaskbar().SelectWindow(this._getTopLevelModalParentWin());
	}
	GetFurthestModalChildWin() {
		let modalChildWin = this;
		while(modalChildWin.GetModalChildWin())
			modalChildWin = modalChildWin.GetModalChildWin();
		return modalChildWin;
	}
	
	// cause any attempt to focus this window to cause this.#modalChildWin to be focused instead
	CreateModalChildWin(windowData) {
		let modalParentWin = this;
		let addToTaskbar = false;
		let win = WM.NewWindow(this.#process, windowData, modalParentWin, addToTaskbar);
		this.#modalChildWin = win;
		win.Focus();
		this.Freeze(); // todo - add option to Freeze() to disable window moving / titlebar button presses / resizing etc.
		return win;
	}
	// called by WM after this window's modal child window closed.
	OnModalChildClose() {
		this.#modalChildWin = null;
		this.Unfreeze();
	}
	
	// allows WM to know if window can refocus after currently focused window is minimized
	GetCanRefocus() {
		return this.#canRefocus;
	}
	SetCanAutoRefocus(can) {
		this.#canRefocus = can;
	}
	Defocus(canAutoRefocus) {
		this.#focused = false;
		this.#canRefocus = canAutoRefocus;
		this.#titlebarEl.style.background = "var(--titlebar-inactive-bg)";
		this.#titlebarEl.style.color = "var(--titlebar-inactive-font-col)";
		UI.GetTaskbar().DeselectWindow(this);
	}
	GetFocused() {
		return this.#focused;
	}
	GetMinimized() {
		return this.#minimized;
	}
	GetMaximized() {
		return this.#maximized;
	}
	ToggleMinimized() {
		if(this.#minimized) { // restore to previous state
			this.#minimized = false;
			this.#shadowRoot.host.style.display = null;
			this.Focus();
		}
		else { // minimize
			this.#minimized = true;
			this.#shadowRoot.host.style.display = "none";
			this.Defocus();
			WM.FocusLast();
		}
	}
	GetPos() {
		return this.#posRect;
	}
	SetPos(rect) {
		if(rect !== null)
			this.#posRect = rect;
		this.#shadowRoot.host.style.left = this.#posRect.x + "px ";
		this.#shadowRoot.host.style.top = this.#posRect.y + "px";
		this.#shadowRoot.host.style.width = this.#posRect.w + "px";
		this.#shadowRoot.host.style.height = this.#posRect.h + "px";
	}
	
	SetRestored(rect) {
		this.#maximized = false;
		this.#restoredRect = null;
		this.#shadowRoot.host.style.right = null;
		this.#shadowRoot.host.style.bottom = null;
		this.#titlebarEl.style.height = "var(--titlebar-height)";
		this.#titlebarEl.style.paddingRight = "calc(calc(var(--titlebar-height) - var(--titlebar-button-height)) / 2)";
		this.SetPos(rect);
	}
	SetMaximized(top,right,bottom,left) {
		//WidgetBase.FireEvent();
		var windowBorderWidth = 4; //todo get from theme
		this.#maximized = true;
		if(this.#restoredRect === null)
			this.#restoredRect = {x:this.#posRect.x, y:this.#posRect.y, w:this.#posRect.w, h:this.#posRect.h};
		this.#shadowRoot.host.style.left = -windowBorderWidth + left + "px";
		this.#shadowRoot.host.style.top = -windowBorderWidth + top + "px";
		this.#shadowRoot.host.style.width = null;
		this.#shadowRoot.host.style.height = null;
		this.#shadowRoot.host.style.right = -windowBorderWidth + right + "px";
		this.#shadowRoot.host.style.bottom = -windowBorderWidth + bottom + "px";
		//this.#titlebarEl.style.height = "var(--titlebar-button-height)";
		this.#titlebarEl.style.paddingRight = 0;
	}
	
	Freeze() {
		this._disableResizers();
		this.#modalfreeze.style.display = "block";
	}
	Unfreeze() {
		this._enableResizers();
		this.#modalfreeze.style.display = null;
	}
	FreezeInput() {
		this.#mouseblock.style.pointerEvents = "auto";
	}
	UnfreezeInput() {
		this.#mouseblock.style.pointerEvents = null;
	}
	
	_disableResizers() {
		this.#shadowRoot.querySelectorAll("#l, #tl, #t, #tr, #r, #br, #b, #bl" )
						.forEach((el) => {
							el.style.display = "none";
						});
	}
	_enableResizers() {
		this.#shadowRoot.querySelectorAll("#l, #tl, #t, #tr, #r, #br, #b, #bl" )
						.forEach((el) => {
							el.style.display = null;
						});
	}
	
	#resize(resizeLeft, resizeUp, resizeRight, resizeDown, initialEvent) {
		if(initialEvent.button !== 0) // primary button = 0
			return;
		if(this.#maximized) // should never happen, but just in case...
			return;
		
		var cursorPane = UI.GetCursorPane();
		cursorPane.style.cursor  = getComputedStyle(initialEvent.target).cursor;
		cursorPane.style.display = "block";
		
		//this.#shadowRoot.host.style.willChange = (
		//	(resizeLeft  ? "left,width," : "") +
		//	(resizeUp    ? "top,height," : "") +
		//	(resizeRight ? "width,"      : "") +
		//	(resizeDown  ? "height,"     : "") ).slice(0,-1); // the slice removes the trailing comma
		
		var initialWindowRect = this.#shadowRoot.host.getBoundingClientRect();
		
		UI.SetDraggingFunc((currentEvent, finish) => {
			if(finish) {
				cursorPane.style.cursor = null;
				cursorPane.style.display = "none";
				//this.#shadowRoot.host.style.willChange = null;
			}
			var deltaX = currentEvent.clientX - initialEvent.clientX;
			var deltaY = currentEvent.clientY - initialEvent.clientY;
			var minWidth = 200; // todo - move to specific window instance options
			var minHeight = 100; // todo - move to specific window instance options
			var snapZone = 20; //todo - make configurable
			
			if(resizeLeft) {
				let newWidth = initialWindowRect.width - deltaX;
				let snapped = false;
				if(newWidth < minWidth) {
					newWidth = minWidth;
					snapped = true;
				}
				let widthDelta = newWidth - initialWindowRect.width;
				let newX = initialWindowRect.x - widthDelta;
				
				if(!snapped) { // do snapping
					let snapXPoints = WM.GetXSnapPoints(this);
					for(let i = 0; i < snapXPoints.length; i++) {
						let xPoint = snapXPoints[i];
						if(Math.abs(newX - xPoint) < snapZone) {
							let testW = newWidth + (newX - xPoint);
							if(testW < minWidth)
								continue;
							newWidth = testW;
							widthDelta = newWidth - initialWindowRect.width;
							newX = initialWindowRect.x - widthDelta;
							break;
						}
					}
				}
				
				this.#posRect.x = newX;
				this.#posRect.w = newWidth;
				this.#shadowRoot.host.style.left = newX + "px";
				this.#shadowRoot.host.style.width = newWidth + "px";
			}
			if(resizeUp) {
				let newHeight = initialWindowRect.height - deltaY;
				let snapped = false;
				if(newHeight < minHeight) {
					newHeight = minHeight;
					snapped = true;
				}
				let heightDelta = newHeight - initialWindowRect.height;
				let newY = initialWindowRect.y - heightDelta;
				
				if(!snapped) { // do snapping
					let snapYPoints = WM.GetYSnapPoints(this);
					for(let i = 0; i < snapYPoints.length; i++) {
						let yPoint = snapYPoints[i];
						if(Math.abs(newY - yPoint) < snapZone) {
							let testH = newHeight + (newY - yPoint);
							if(testH < minHeight)
								continue;
							newHeight = testH;
							heightDelta = newHeight - initialWindowRect.height;
							newY = initialWindowRect.y - heightDelta;
							break;
						}
					}
				}
				
				this.#posRect.y = newY;
				this.#posRect.h = newHeight;
				this.#shadowRoot.host.style.top = newY + "px";
				this.#shadowRoot.host.style.height = newHeight + "px";
			}
			if(resizeRight) {
				let newWidth = initialWindowRect.width + deltaX;
				if(newWidth >= minWidth) { // do snapping
					let snapXPoints = WM.GetXSnapPoints(this);
					for(let i = 0; i < snapXPoints.length; i++) {
						let xPoint = snapXPoints[i];
						let newXW = initialWindowRect.x + newWidth;
						if(Math.abs(newXW - xPoint) < snapZone) {
							newWidth = xPoint - initialWindowRect.x;
							break;
						}
					}
				}
				this.#posRect.w = Math.max(minWidth, newWidth);
				this.#shadowRoot.host.style.width = Math.max(minWidth, newWidth) + "px ";
			}
			if(resizeDown) {
				let newHeight = initialWindowRect.height + deltaY;
				if(newHeight >= minHeight) { // do snapping
					let snapYPoints = WM.GetYSnapPoints(this);
					for(let i = 0; i < snapYPoints.length; i++) {
						let yPoint = snapYPoints[i];
						let newYH = initialWindowRect.y + newHeight;
						if(Math.abs(newYH - yPoint) < snapZone) {
							newHeight = yPoint - initialWindowRect.y;
							break;
						}
					}
				}
				this.#posRect.h = Math.max(minHeight, newHeight);
				this.#shadowRoot.host.style.height = Math.max(minHeight, newHeight) + "px ";
			}
		});
	};
	
	
	#attachEventHandlers() {
		this.#shadowRoot.host.addEventListener("mousedown", (ev) => {
			this.Focus();
		});
		// need to add doubleclick handler before mousedown drag handler so can
		// set ev.ignore on doubleclick second mousedown event, to prevent dragging
		UI.OnDoubleClick(this.#shadowRoot.querySelector(".titlebar"), () => {
			this.#commandProcessor("maximize");
		});
		this.#shadowRoot.querySelector(".titlebar").onmousedown = (initialEvent) => {
			if(initialEvent.ignore)
				return;
			if(initialEvent.button === 2) { // secondary button: open context menu
				//initialEvent.preventDefault(); // todo place at top level (body)?
				UI.OpenMenu(this.#winOpsMenu, {x:initialEvent.clientX, y:initialEvent.clientY, w:0, h:0}, this.#commandProcessor);
				return;
			}
			if(initialEvent.button !== 0)
				return;
			
			// primary button: drag window:
			
			var snapZone = 20;
			
			var taskbarHeight = UI.GetTaskbar().GetHeight();
			var screenWidth = UI.GetScreenWidth();
			var screenHeight = UI.GetScreenHeight();
			
			UI.CloseMenu(); // will-change css rule seems to produce glitch in chrome where menu stays open (mousedown handler doesnt fire?)
			//this.#shadowRoot.host.style.willChange = "top,left";
			UI.GetCursorPane().style.display = "block";
			
			var winInitialX = this.#posRect.x;
			var winInitialY = this.#posRect.y;
			// if dragging away from maximized / from filling half of screen, window will return in size to its
			// original size (this.#restoredRect). Need to ensure that the window is under the cursor and not off screen.
			if(this.#restoredRect !== null) {
				// todo: minimize large horizontal position shifts when dragging away from filling quarter of screen (if window was originally very wide)
				winInitialX = initialEvent.clientX - (this.#restoredRect.w / 2);
				if(winInitialX < 0)
					winInitialX = 0;
				if(winInitialX + this.#restoredRect.w > document.documentElement.clientWidth)
					winInitialX = screenWidth - this.#restoredRect.w;
				if(this.#maximized) // SetMaximized does not set posRect, need to set winInitialY)
					winInitialY = -4; // window border width - todo: get from theme
			}
			UI.SetDraggingFunc((currentEvent, finish) => {
				var currentX = currentEvent.clientX;
				var currentY = currentEvent.clientY;
				var deltaX = currentX - initialEvent.clientX;
				var deltaY = currentY - initialEvent.clientY;
				
				var rightBuffer = 3;
				
				// sanitize input - don't allow dragging past taskbar (out of sight)...
				var maxY = screenHeight - taskbarHeight - 1; // todo: increase to 5 or 6px...?
				if(currentY > maxY)
					currentY = maxY;
				
				// still dragging (mousemove event)...
				if(!finish) {
				
					// todo clean up this codeblock so style value isn't set twice...
					this.#posRect.x = winInitialX + deltaX;
					this.#posRect.y = winInitialY + deltaY;
					if(this.#maximized) {// restore if dragging maximized window's title bar
						this.SetRestored({x:this.#posRect.x, y:this.#posRect.y, w:this.#restoredRect.w, h:this.#restoredRect.h});
						this.UpdateMaximized(false);
					}
					else if(this.#restoredRect !== null) { // if dragging away from filling right half of screen, for example
						this.SetPos({x: this.#posRect.x, y: this.#posRect.y, w: this.#restoredRect.w, h: this.#restoredRect.h});
						this.#restoredRect = null;
					}
					else {
						this.#shadowRoot.host.style.left = this.#posRect.x + "px ";
						this.#shadowRoot.host.style.top = this.#posRect.y + "px";
					}
					
					//snapping
					let snappedPos = null;
					// X snapping
					let snapXPoints = WM.GetXSnapPoints(this);
					let snapL = null;
					let snapR = null;
					for(var i = 0; i < snapXPoints.length; i++) {
						let xPoint = snapXPoints[i];
						if(Math.abs(this.#posRect.x - xPoint) < snapZone) {
							snapL = xPoint;
							break;
						}
						if(Math.abs(this.#posRect.x + this.#posRect.w - xPoint) < snapZone) {
							snapR = xPoint;
							break;
						}
					}
					if(snapL !== null)
						snappedPos = {x: snapL, y: this.#posRect.y, w: this.#posRect.w, h: this.#posRect.h};
					else if(snapR !== null)
						snappedPos = {x: snapR - this.#posRect.w, y: this.#posRect.y, w: this.#posRect.w, h: this.#posRect.h};
					if(snapL !== null || snapR !== null)
						this.SetPos(snappedPos);
					
					// Y snapping
					let snapYPoints = WM.GetYSnapPoints(this);
					let snapT = null;
					let snapB = null;
					for(var i = 0; i < snapYPoints.length; i++) {
						let yPoint = snapYPoints[i];
						if(Math.abs(this.#posRect.y - yPoint) < snapZone) {
							snapT = yPoint;
							break;
						}
						if(Math.abs(this.#posRect.y + this.#posRect.h - yPoint) < snapZone) {
							snapB = yPoint;
							break;
						}
					}
					if(snapT !== null)
						snappedPos = {x: this.#posRect.x, y: snapT, w: this.#posRect.w, h: this.#posRect.h};
					else if(snapB !== null)
						snappedPos = {x: this.#posRect.x, y: snapB - this.#posRect.h, w: this.#posRect.w, h: this.#posRect.h};
					if(snapT !== null || snapB !== null)
						this.SetPos(snappedPos);
					
					// do x snapping one more time, because new y-snapped position might yield new x-snapping points
					if(snapL === null && snapR === null && snappedPos !== null) {
						snapXPoints = WM.GetXSnapPoints(this);
						for(var i = 0; i < snapXPoints.length; i++) {
							let xPoint = snapXPoints[i];
							if(Math.abs(this.#posRect.x - xPoint) < snapZone) {
								snapL = xPoint;
								break;
							}
							if(Math.abs(this.#posRect.x + this.#posRect.w - xPoint) < snapZone) {
								snapR = xPoint;
								break;
							}
						}
						if(snapL !== null)
							snappedPos = {x: snapL, y: this.#posRect.y, w: this.#posRect.w, h: this.#posRect.h};
						else if(snapR !== null)
							snappedPos = {x: snapR - this.#posRect.w, y: this.#posRect.y, w: this.#posRect.w, h: this.#posRect.h};
						if(snapL !== null || snapR !== null)
							this.SetPos(snappedPos);
					}
					
					//todo remove, if no problems
					//this.#win.UpdatePos(this.#posRect);
				}
				
				// finished dragging (mouseup event) - clean up...
				else { // if(!finish) {...} else {
					// check if window should be snapped to a certain size (eg, maximize if dragged to top of screen)....
					// fill upper left quarter of screen
					if(currentX === 0 && currentY === 0) {
						this.#restoredRect = {x: this.#posRect.x, y: this.#posRect.y, w: this.#posRect.w, h: this.#posRect.h};
						this.SetPos({x:0, y:0, w:screenWidth / 2, h: (screenHeight - taskbarHeight) / 2});
						//this.#win.UpdatePos(this.#posRect);//todo remove
					}
					// fill upper right corner of screen
					else if(currentX >= screenWidth - 1 - rightBuffer && currentY === 0) {
						this.#restoredRect = {x: this.#posRect.x, y: this.#posRect.y, w: this.#posRect.w, h: this.#posRect.h};
						this.SetPos({x:screenWidth / 2, y:0, w:screenWidth / 2, h: (screenHeight - taskbarHeight) / 2});
						//this.#win.UpdatePos(this.#posRect);//todo remove
					}
					// maximize
					else if(currentY === 0) {
						let rect = {x: winInitialX, y: winInitialY, w: this.#posRect.w, h: this.#posRect.h};
						this.SetMaximized(0,0,UI.GetTaskbar().getBoundingClientRect().height,0);
						this.#restoredRect = rect;
						this.UpdateMaximized(true);
						//this.#win.UpdatePos(this.#posRect);//todo remove
					}
					// fill lower left quarter of screen
					else if(currentX === 0 && currentY === maxY) {
						this.#restoredRect = {x: this.#posRect.x, y: this.#posRect.y, w: this.#posRect.w, h: this.#posRect.h};
						this.SetPos({x:0, y:(screenHeight - taskbarHeight) / 2, w:screenWidth / 2, h: (screenHeight - taskbarHeight) / 2});
						//this.#win.UpdatePos(this.#posRect);//todo remove
					}
					// fill lower right quarter of screen
					else if(currentX >= screenWidth - 1 - rightBuffer && currentY === maxY) {
						this.#restoredRect = {x: this.#posRect.x, y: this.#posRect.y, w: this.#posRect.w, h: this.#posRect.h};
						this.SetPos({x:screenWidth / 2, y:(screenHeight - taskbarHeight) / 2, w:screenWidth / 2, h: (screenHeight - taskbarHeight) / 2});
						//this.#win.UpdatePos(this.#posRect);//todo remove
					}
					// fill left half of screen
					else if(currentX === 0) {
						this.#restoredRect = {x: this.#posRect.x, y: this.#posRect.y, w: this.#posRect.w, h: this.#posRect.h};
						this.SetPos({x:0, y:0, w:screenWidth / 2, h: screenHeight - taskbarHeight});
						//this.#win.UpdatePos(this.#posRect);//todo remove
					}
					// fill right half of screen
					else if(currentX >= screenWidth - 1 - rightBuffer) {
						this.#restoredRect = {x: this.#posRect.x, y: this.#posRect.y, w: this.#posRect.w, h: this.#posRect.h};
						this.SetPos({x:screenWidth / 2, y:0, w:screenWidth / 2, h: screenHeight - taskbarHeight});
						//this.#win.UpdatePos(this.#posRect);//todo remove
					}
					// cleanup
					//this.#shadowRoot.host.style.willChange = null;
					UI.GetCursorPane().style.display = null;
				}
			});
			
		};
		this.#shadowRoot.querySelector(".titlebar-icon").addEventListener("mousedown", (ev) => {
			ev.ignore = true; // so window will not drag
			if(ev.button === 2)
				UI.OpenMenu(this.#appOpsMenu, {x:ev.clientX,y:ev.clientY,w:0,h:0}, this.#commandProcessor);
		});
		this.#shadowRoot.querySelectorAll(".titlebar-maximize, .titlebar-minimize, .titlebar-close").forEach((el) => {
			el.addEventListener("mousedown", (ev) => {
				ev.ignore = true; // so window will not drag or double click
			});
		});
		this.#shadowRoot.querySelector(".titlebar-maximize").addEventListener("click", () => {
			this.#commandProcessor("maximize");
		});
		this.#shadowRoot.querySelector(".titlebar-minimize").addEventListener("click", () => {
			this.#commandProcessor("minimize");
		});
		this.#shadowRoot.querySelector(".titlebar-close").addEventListener("click", () => {
			this.#commandProcessor("close");
		});
		
		if(!this.#resizable) {
			this._disableResizers();
			
			// disable maximize button
			this.#shadowRoot.querySelector(".titlebar-maximize").classList.add("disabled");
			return;
		}
		this.#shadowRoot.querySelector("#l").addEventListener("mousedown", (initialEvent) => {
			this.#resize(true, false, false, false, initialEvent);
		});
		this.#shadowRoot.querySelector("#tl").addEventListener("mousedown", (initialEvent) => {
			this.#resize(true, true, false, false, initialEvent);
		});
		this.#shadowRoot.querySelector("#t").addEventListener("mousedown", (initialEvent) => {
			this.#resize(false, true, false, false, initialEvent);
		});
		this.#shadowRoot.querySelector("#tr").addEventListener("mousedown", (initialEvent) => {
			this.#resize(false, true, true, false, initialEvent);
		});
		this.#shadowRoot.querySelector("#r").addEventListener("mousedown", (initialEvent) => {
			this.#resize(false, false, true, false, initialEvent);
		});
		this.#shadowRoot.querySelector("#br").addEventListener("mousedown", (initialEvent) => {
			this.#resize(false, false, true, true, initialEvent);
		});
		this.#shadowRoot.querySelector("#b").addEventListener("mousedown", (initialEvent) => {
			this.#resize(false, false, false, true, initialEvent);
		});
		this.#shadowRoot.querySelector("#bl").addEventListener("mousedown", (initialEvent) => {
			this.#resize(true, false, false, true, initialEvent);
		});
	}
	
	SetElementAsResizer(element, resizeLeft, resizeUp, resizeRight, resizeDown) {
		element.addEventListener("mousedown", (initialEvent) => {
			this.#resize(resizeLeft, resizeUp, resizeRight, resizeDown, initialEvent);
		});
	}
}

customElements.define("ui-window", UiWindow);
