"use strict";

class MenuPane extends HTMLElement {
	#shadowRoot = null;
	#selectedSubs = [];
	#commandCallback = null;
	#menu = null;
	#caller = null;
	#triggeredFromMouseDown = false; // menu was opened from mousedown instead of mouseup
	#firstClick = true;
	
	constructor() {
		super();
	}
	
	connectedCallback() {
		this.#shadowRoot = this.attachShadow({mode:"closed"});
		this.#shadowRoot.appendChild(document.getElementById("menupane-template").content.cloneNode(true));
	}
	
	// menudata - menu items
	// callingRect - rect of location where menu was called from - place menu under or as close to it, but without covering
	//               (eg, callingRect = {x,y,w,h} of "File" element on menubar
	// commandCallback - command to call when menu item selected or when menu closed (null argument if no menu item selected)
	// caller - menubar (or similar widget). if caller argument specified, then close any other menu currently opened from caller element, without calling its callback.
	open(menuData, callingRect, commandCallback, caller, mouseDown) {
		if(this.#caller === caller) { // opening another menu from same menubar (or similar) widget - don't call callback, because we haven't properly "closed" the menus from that widget yet
			this.close();
		}
		else { // another menu could be open on screen - from different menubar/parent widget - close it and call its callback with null argument
			this.close(null);
			this.#caller = caller;
		}
		this.#triggeredFromMouseDown = mouseDown || false;
		this.#firstClick = true;
		this.#menu = this.#constructMenu(menuData, 1);
		this.#menu.style.left = callingRect.x + "px";
		this.#menu.style.top = (callingRect.y + callingRect.h) + "px";
		this.#shadowRoot.appendChild(this.#menu);
		var menuRect = this.#menu.getBoundingClientRect();
		var screenWidth = UI.GetScreenWidth();
		var screenHeight = UI.GetScreenHeight();
		if(menuRect.x < 0) // menu opened to left of screen - menu bar item partially off left of screen
			this.#menu.style.left = "0";
		else if(menuRect.right > screenWidth) {
			if(menuRect.width > screenWidth)
				this.#menu.style.left = "0"; // menu too wide for screen
			else {
				// menu is going to go off right edge of screen, bring it back into view
				this.#menu.style.left = "";
				this.#menu.style.right = (-screenWidth) + "px";
			}
		}
		if(menuRect.bottom > screenHeight) { // menu is going to go off bottom edge of screen:
			if(menuRect.height > screenHeight) { // if menu too tall for screen,
				this.#menu.style.top = "0"; // just put it at top of screen. //todo - scrollable menu
			}
			else if(callingRect.y < menuRect.height) { // else, if menu can't fit above calling element rect,
				this.#menu.style.top = "0"; // just put it at top of screen.
			}
			else { // menu can fit above calling element rect,
				this.#menu.style.top = "";
				this.#menu.style.bottom = (-callingRect.y) + "px"; // so position it to be above calling element's rect
			}
		}
		
		this.#commandCallback = commandCallback;
		
		// if user clicks away...
		setTimeout(() => {
			document.body.addEventListener('mousedown', this.#clearMenusMouseDown);
			document.body.addEventListener('mouseup', this.#clearMenusMouseUp);
		}, 0);
	}
	
	close(command) {
		if(!this.#menu) // already closed
			return;
		this.#selectedSubs = [];
		this.#menu.remove();
		this.#menu = null;
		document.body.removeEventListener('mousedown', this.#clearMenusMouseDown);
		document.body.removeEventListener('mouseup', this.#clearMenusMouseUp);
		
		if(this.#commandCallback) {
			if(command !== undefined)
				this.#commandCallback(command);
			this.#commandCallback = null;
		}
	}
	#clearMenusMouseDown = () => {
		this.close(null);
	};
	#clearMenusMouseUp = (ev) => {
		if(ev.button !== 0) // ignore clicks other than primary button
			return;
		if(!this.#triggeredFromMouseDown || (this.#triggeredFromMouseDown && !this.#firstClick)) {
			this.#firstClick = false;
			this.close(null);
		}
	};
	#constructMenu(items, depth) {
		var menuEl = document.createElement("div");
		
		// root menu container
		if(depth === 1)
		{
			menuEl.classList.add("menu");
			// don't let mousedown/mouseup leak to document event handlers and close the menu...
			// todo - use ev.ignore
			menuEl.addEventListener("mousedown", (ev) => {
				ev.stopPropagation();
			});
			menuEl.addEventListener("mouseup", (ev) => {
				ev.stopPropagation();
			});
		}
		// submenu container
		else
			menuEl.classList.add("submenu");
		
		// add items to menu/submenu container
		items.forEach((item) => {
			var itemEl = document.createElement("div");
			
			// skip...
			if(item.visible === false) { }
			
			// separator
			else if(item.separator)
				itemEl.classList.add("separator");
			
			// normal menu item or item with submenu
			else {
				itemEl.append(item.name);
				if(item.enabled === false)
					itemEl.classList.add("disabled");
				if(item.leftText)
					itemEl.setAttribute("data-before", item.leftText);
				if(item.shortcut)
					itemEl.setAttribute("data-after", item.shortcut);
				if(item.icon)
					itemEl.style.backgroundImage = "url('" + UI.Icons[item.icon] + "')";
				
				if(!item.children || !item.children.length) { // normal menu item
					itemEl.classList.add("item");
					// when selecting (hovering), close any sub menus that need closing:
					itemEl.addEventListener('mouseover', (ev) => {
						ev.stopPropagation(); // don't trigger mouseover handler for parent menu(s)
						if(ev.button !== 0) // ignore clicks other than primary button
							return;
						// destroy any open submenus...
						while(this.#selectedSubs.length >= depth) {
							var oldSubMenu = this.#selectedSubs.pop();
							oldSubMenu.parentElement.classList.remove("selected");
							oldSubMenu.remove();
						}
					});
					
					// handler for menu command being clicked:
					itemEl.addEventListener('mouseup', (ev) => {
						if(itemEl.classList.contains("disabled"))
							return;
						this.close(item.command);
					});
				}
				else { // menu item with submenu
					itemEl.classList.add("sub");
					// construct, and open, the submenu when hovering over it:
					itemEl.addEventListener('mouseover', (ev) => {
						if(itemEl.children.length > 0) // this submenu already open
							return;
						if(item.enabled === false)
							return;
						// destroy any other open submenus...
						while(this.#selectedSubs.length >= depth) {
							var oldSubMenu = this.#selectedSubs.pop();
							oldSubMenu.parentElement.classList.remove("selected");
							oldSubMenu.remove();
						}
						var subMenuEl = this.#constructMenu(item.children, depth + 1);
						// don't triger sub menu entry item on sub menu frame/container mouseover...
						subMenuEl.addEventListener("mouseover", (ev) => {
							ev.stopPropagation();
						});
						this.#selectedSubs.push(subMenuEl);
						itemEl.classList.add("selected");
						itemEl.appendChild(subMenuEl);
						
						var itemElRect = itemEl.getBoundingClientRect();
						var callingRect = {x: itemElRect.x, y: itemElRect.y, w: itemElRect.width, h: itemElRect.height};								
						var menuRect = subMenuEl.getBoundingClientRect();
						var screenWidth = UI.GetScreenWidth();
						var screenHeight = UI.GetScreenHeight();
						// (note: in following positioning calculatoins: submenu has style.translate:100% to right, hence need to move left by menuRect.w
						if(menuRect.bottom > screenHeight) {
							if(menuRect.height > screenHeight) { // too tall to fit on screen, put at top of screen
								subMenuEl.style.top = (-callingRect.y) + "px";
							}
							else { // menu is going to go off bottom edge of screen, bring it back into view
								subMenuEl.style.top = "unset";
								subMenuEl.style.bottom = -(screenHeight - callingRect.y - callingRect.h) + "px";
							}
						}
						if(menuRect.right > screenWidth) { // menu is going to go off right edge of screen:
							if(menuRect.width > screenWidth) { // if because menu too wide for screen, just put it at left of screen,
								subMenuEl.style.left =  (-menuRect.width - callingRect.x) + "px";
								subMenuEl.style.right = "unset";
							}
							else if(callingRect.x < menuRect.width) { // else, if menu can't fit to left of calling element rect, just put it at left or right of screen.
								var parentCenterX = callingRect.x + (callingRect.w / 2);
								if(parentCenterX > (screenWidth / 2)) { // put at left of screen
									subMenuEl.style.left = (-menuRect.width - callingRect.x) + "px";
									subMenuEl.style.right = "unset";
								}
								else { // put at right of screen
									subMenuEl.style.left = "unset";
									subMenuEl.style.right = (-screenWidth + callingRect.x + callingRect.w + menuRect.width) + "px";
								}
							}
							else { // menu can fit to left of calling element rect,
								subMenuEl.style.left = "";
								subMenuEl.style.right = (callingRect.w + menuRect.width) + "px"; // so position it to be to left of calling element's rect
							}
						}
						
					});
				}
			}
			menuEl.appendChild(itemEl);
		});
		return menuEl;
	}
}

customElements.define("menu-pane", MenuPane);
