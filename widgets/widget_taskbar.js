"use strict";

class TaskBar extends HTMLElement {
	#shadowRoot = null;
	#taskbar = null;
	#launcherMenu = null;
	#windowSwitcher = null;
	#tray = null;
	#clock = null;
	#height = 0;
	
	#launcherMenuData = [
		{name: "Applications", children: [
			{name: "Calculator", command: "calc", icon: "App"},
			{name: "Notepad", command: "notepad", icon: "App"},
			{name: "WebGL demo", command: "wgldemo", icon: "Settings"},
			{name: "P2P fileshare", command: "p2p", icon: "Network"},
			{name: "Paint", command: "paint", icon: "Camera"},
			{name: "Audio recorder", command: "arecord", icon: "Sound"},
			{name: "Appearance", command: "appearance"},
			{name: "Date & time", command: "datetime", icon: "Clock"},
			{name: "App manager", command: "appmanager", icon: "Setup"},
			{separator: true},
			{name: "Calculator", command: "calc", icon: "App"},
			{name: "Notepad", command: "notepad", icon: "App"},
			{name: "WebGL demo", command: "wgldemo", icon: "Settings"},
		]},
		{name: "Settings1", icon: "Settings", children: [
			{name: "Appearance", command: "appearance", icon: "AppearanceSettings"},
			{name: "Date & time", command: "datetime", icon: "Clock"},
			{name: "App manager", command: "appmanager", icon: "App"},
			{name: "Appearance", command: "appearance", icon: "AppearanceSettings"},
			{name: "Date & time", command: "datetime", icon: "Clock"},
			{name: "App manager", command: "appmanager", icon: "App"},
		]},
		{name:"System info", command: "sysinfo", icon: "Settings"},
		{separator: true},
		{name:"Calculator", command: "calc", icon: "App"},
		{name:"Small test window", command: "small", icon: "App"},
		{name: "Paint", command: "paint/paint", icon: "Color"},
		{name: "Designer", command: "designer", icon: "ImageFile"},
	];
	
	#commandProcessor(winButton, command) {
		switch(command) {
			case "appinfo":
			
			break;
			
			case "kill":
			winButton.win.GetProcess().Kill();
			break;
			
			case "maximize":
			winButton.win.Maximize();
			break;
			
			case "minimize":
			winButton.win.Minimize();
			break;
			
			case "close":
			winButton.win.Close();
			break;
		}
	}
	
	constructor() {
		super();
	}
	
	#init() {
		this.#taskbar = this.#shadowRoot.host;
		this.#launcherMenu = this.#shadowRoot.querySelector(".launchermenu");
		this.#windowSwitcher = this.#shadowRoot.querySelector(".windowswitcher");
		this.#tray = this.#shadowRoot.querySelector(".tray");
		this.#clock = this.#shadowRoot.querySelector(".clock");
		
		this.#launcherMenu.style.backgroundImage = "url('" + UI.Icons.Pc + "')";
		UI.SetAsMenuButton(this.#launcherMenu, this.#launcherMenuData, (app) => {
			OS.Launch(app);
		});
		
		var updateClock = () => {
			var d = new Date(); // note: some privacy-focused browsers such as LibreWolf give UTC time only
			var hours = d.getHours();
			var minutes = d.getMinutes();
			var ampm = "am";
			if(hours > 12) {
				ampm = "pm";
				hours -= 12;
			}
			var newtext = hours + ":" + (minutes + "").padStart(2, "0") + " " + ampm;
			if(this.#clock.innerText !== newtext)
				this.#clock.innerText = newtext;
		};
		updateClock();
		window.setInterval(updateClock, 1000);
		
		this.#windowSwitcher.querySelectorAll("img").forEach((img) => {img.setAttribute("src", UI.Icons.Print);})
		this.#tray.querySelectorAll("img")[0].setAttribute("src", UI.Icons.Info);
		this.#tray.querySelectorAll("img")[1].setAttribute("src", UI.Icons.Warning);
		this.#tray.querySelectorAll("img")[2].setAttribute("src", UI.Icons.Error);
		this.#height = this.#taskbar.getBoundingClientRect().height;
		
		// todo: this is only temp fix to allow stylesheets to load in first before reading width/height
		window.setTimeout(() => {
			this.#height = this.#taskbar.getBoundingClientRect().height;
		}, 300);
	}
	
	GetHeight() {
		return this.#height;
	}
	
	AddWindow(win) { // add to window switcher
		var winButton = document.createElement("button");
		winButton.classList.add("window");
		winButton.style.backgroundImage = "url('" + win.GetIcon() + "')";
		winButton.textContent = win.GetTitle();
		winButton.addEventListener("click", (ev) => {
			if(win.GetMinimized() || !win.GetFocused())
				win.Focus(); // bring window to focus
			else
				win.ToggleMinimized(); // minimize window
		});
		winButton.win = win;
		let contextMenu = win.GetAppOpsMenu().concat({separator:true,}, win.GetWinOpsMenu());
		winButton.addEventListener("mousedown", (ev) => {
			if(win.GetFurthestModalChildWin().GetFocused())
				ev.ignore = true;
			if(ev.button === 2) { // right click
				ev.preventDefault();
				console.log("ev", ev, "ev.cancelable", ev.cancelable);
				let winOpsMenu = win.GetWinOpsMenu();
				let contextMenu = winOpsMenu.length
					? win.GetAppOpsMenu()
					: win.GetAppOpsMenu().concat({separator:true,}, winOpsMenu);
				UI.OpenMenu(contextMenu, {x:ev.clientX,y:ev.clientY,w:0,h:0}, (command) => { win.ExecuteCommand(command); });
			}
		});
		this.#windowSwitcher.appendChild(winButton);
	}
	RemoveWindow(win) { // remove from window switcher
		var btns = this.#windowSwitcher.children;
		for(var i = 0; i < btns.length; i++) {
			if(btns[i].win !== win)
				continue;
			btns[i].remove();
			break;
		}
	}
	
	SelectWindow(win) {
		this.#windowSwitcher.querySelectorAll(".window").forEach((winButton) => {
			if(winButton.win === win)
				winButton.classList.add("pressed");
			else
				winButton.classList.remove("pressed");
		});
	}
	
	DeselectWindow(win) {
		this.#windowSwitcher.querySelectorAll(".window").forEach((winButton) => {
			if(winButton.win === win)
				winButton.classList.remove("pressed");
		});
	}
	
	// only specified fields are set/modified.
	// unspecified fields are left untouched (either defaults, or previous set value)
	SetConfig(config) {
		if(config.visible !== undefined)
		{
			if(config.visible === false)
				this.#shadowRoot.host.style.display = "none";
			else
				this.#shadowRoot.host.style.display = "block"; // todo may break some themes?
		}
	}
	
	connectedCallback() {
		this.#shadowRoot = this.attachShadow({mode:"closed"});
		this.#shadowRoot.appendChild(document.getElementById("taskbar-template").content.cloneNode(true));
		this.#taskbar = this.#shadowRoot.host;
		this.#launcherMenu = this.#shadowRoot.querySelector('.launchermenu');
		this.#windowSwitcher = this.#shadowRoot.querySelector('.windowswitcher');
		this.#tray = this.#shadowRoot.querySelector('.tray');
		
		this.#init();
		
		var config = this.#shadowRoot.host.getAttribute("config");
		if(config)
			this.SetConfig(JSON.parse(config));
			
		//var data = this.#shadowRoot.host.getAttribute("data");
		//if(data)
		//	this.#constructMenu(JSON.parse(data));
	}
}

customElements.define("ui-taskbar", TaskBar);
