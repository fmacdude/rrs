
export class WindowHandle {
	#uid = null;
	GetUid() {
		return this.#uid;
	}
	
	constructor(uid) {
		this.#uid = uid;
	}

	//todo test: ensure correct events are triggered on maximize/minimize/close/etc...
	On(eventName, otherEvents, callback) {
		UI._listenEvent(this.#uid, eventName, otherEvents, callback);
	}
	async NewChildModalWindowAsync(windowData) {
		let windowUid = await UI._sendCommand(this.#uid, "window_newChildModalWin", windowData, true);
		return new WindowHandle(windowUid);
	}
	async WidgetAsync(widgetId) {
		let widgetUid = await UI._sendCommand(this.#uid, "window_getWidgetUid", widgetId, true);
		return new WidgetHandle(widgetUid);
	}
	async ContainerAsync() {
		let containerUid = await UI._sendCommand(this.#uid, "window_getContainer", null, true);
		return new ContainerHandle(containerUid);
	}
	Close() {
		UI._sendCommand(this.#uid, "window_close", null, false);
    }
}

export class ContainerHandle {
	#uid = null;
	GetUid() {
		return this.#uid;
	}
	
	constructor(uid) {
		this.#uid = uid;
	}
	//tested?
	async GetDescriptorAsync() {
		let descriptor = await UI._sendCommand(this.#uid, "container_getDescriptor", null, true);
		descriptor.container = this;
		return descriptor;
	}
	async GetWidgetsAsync() {
		let widgetUids = await UI._sendCommand(this.#uid, "container_getWidgets", null, true);
		return widgetUids ? widgetUids.map((uid) => { return new WidgetHandle(uid); }) : null;
	}
	//tested?
	async GetWidgetDescriptorsAsync() {		
		let widgetDescriptors = await UI._sendCommand(this.#uid, "container_getWidgetDescriptors", null, true);
		(widgetDescriptors || []).forEach((descriptor) => {
			descriptor.widget = new WidgetHandle(descriptor.uid);
			delete descriptor.uid;
		});
		return widgetDescriptors;
	}
	async PrependWidgetAsync(widgetData) {
		let widgetUid = await UI._sendCommand(this.#uid, "container_prependWidget", widgetData, true);
		return new WidgetHandle(widgetUid);
	}
	async AppendWidgetAsync(widgetData) {
		let widgetUid = await UI._sendCommand(this.#uid, "container_appendWidget", widgetData, true);
		return new WidgetHandle(widgetUid);
	}
	Empty() {
		UI._sendCommand(this.#uid, "container_empty", null, false);
	}
	async GetBoundingClientRectAsync() {
		let boundingClientRect = await UI._sendCommand(this.#uid, "container_getBoundingClientRect", null, true);
		return boundingClientRect;
	}
	SetStyle(style) {
		UI._sendCommand(this.#uid, "widget_setStyle", style, false);
	}
}

export class WidgetHandle {
	#uid = null;
	GetUid() {
		return this.#uid;
	}
	
	constructor(uid) {
		this.#uid = uid;
	}
	On(eventName, otherEvents, callback) {
		UI._listenEvent(this.#uid, eventName, otherEvents, callback);
	}
	OnJsEvent(eventName, otherEvents, eventFields, callback) {
		UI._listenJsEvent(this.#uid, eventName, otherEvents, eventFields, callback);
	}
	async GetDescriptorAsync() {
		let descriptor = await UI._sendCommand(this.#uid, "widget_getDescriptor", null, true);
		descriptor.widget = this;
		return descriptor;
	}
	async GetConfigAsync() {
		return await UI._sendCommand(this.#uid, "widget_getConfig", null, true);
	}
	async GetDataAsync() {
		return await UI._sendCommand(this.#uid, "widget_getData", null, true);
	}
	async GetStateAsync() {
		return await UI._sendCommand(this.#uid, "widget_getState", null, true);
	}
	async GetLayoutAsync() {
		return await UI._sendCommand(this.#uid, "widget_getLayout", null, true);
	}
	SetConfig(config) {
		UI._sendCommand(this.#uid, "widget_setConfig", config, false);
	}
	SetData(data) {
		UI._sendCommand(this.#uid, "widget_setData", data, false);
	}
	SetState(state) {
		UI._sendCommand(this.#uid, "widget_setState", state, false);
	}
	SetLayout(layout) {
		UI._sendCommand(this.#uid, "widget_setLayout", layout, false);
	}
	async SetConfigAsync(config) {
		return await UI._sendCommand(this.#uid, "widget_setConfigAsync", config, true);
	}
	async SetDataAsync(data) {
		return await UI._sendCommand(this.#uid, "widget_setDataAsync", data, true);
	}
	async SetStateAsync(state) {
		return await UI._sendCommand(this.#uid, "widget_setStateAsync", state, true);
	}
	async SetLayoutAsync(layout) {
		return await UI._sendCommand(this.#uid, "widget_setLayoutAsync", layout, true);
	}
	async InsertWidgetBeforeAsync(widgetData) {
		let widgetUid = null;
		widgetUid = await UI._sendCommand(this.#uid, "widget_insertWidgetBefore", widgetData, true);
		return new WidgetHandle(widgetUid);
	}
	async InsertWidgetAfterAsync(widgetData) {
		let widgetUid = await UI._sendCommand(this.#uid, "widget_insertWidgetAfter", widgetData, true);
		return new WidgetHandle(widgetUid);
	}
	async ParentContainerAsync(containerId) {
		let containerUid = await UI._sendCommand(this.#uid, "widget_getParentContainer", containerId, true);
		return new ContainerHandle(containerUid);
	}
	async ChildContainerAsync(containerId) { // should this method be called ChildContainerByIdAsync...?
		let containerUid = await UI._sendCommand(this.#uid, "widget_getChildContainerById", containerId, true);
		return new ContainerHandle(containerUid);
	}
	async ChildContainersAsync() {
		let containerUids = await UI._sendCommand(this.#uid, "widget_getChildContainers", null, true);
		return containerUids ? containerUids.map((uid) => {
			return new ContainerHandle(uid);
		}) : null;
	}
	async ChildContainerDescriptorsAsync() {
		let containerDescriptors = await UI._sendCommand(this.#uid, "widget_getChildContainerDescriptors", null, true);
		(containerDescriptors || []).forEach((descriptor) => {
			descriptor.container = new ContainerHandle(descriptor.uid);
			delete descriptor.uid;
		});
		return containerDescriptors;
	}
	Empty() {
		UI._sendCommand(this.#uid, "widget_empty", null, false);
	}
	Remove() {
		UI._sendCommand(this.#uid, "widget_remove", null, false);
	}
	MoveAbove(widgetHandle) {
		UI._sendCommand(this.#uid, "widget_moveAbove", widgetHandle.GetUid(), false);
	}
	MoveBelow(widgetHandle) {
		UI._sendCommand(this.#uid, "widget_moveBelow", widgetHandle.GetUid(), false);
	}
	MoveStartContainer(containerHandle) {
		UI._sendCommand(this.#uid, "widget_moveStartContainer", containerHandle.GetUid(), false);
	}
	MoveEndContainer(containerHandle) {
		UI._sendCommand(this.#uid, "widget_moveEndContainer", containerHandle.GetUid(), false);
	}
	
	async GetCanvas() {
		return await UI._sendCommand(this.#uid, "widget_getCanvas", null, true);
	}
	LockCursor(cursorStyle) {
		UI._sendCommand(this.#uid, "widget_lockCursor", cursorStyle || null, false);
	}
	UnlockCursor() {
		UI._sendCommand(this.#uid, "widget_unlockCursor", null, false);
	}
	SetStyle(style) {
		UI._sendCommand(this.#uid, "widget_setStyle", style, false);
	}
	async GetBoundingClientRectAsync() {
		let boundingClientRect = await UI._sendCommand(this.#uid, "widget_getBoundingClientRect", null, true);
		return boundingClientRect;
	}
}

export class UI {
	static OtherEventsEnum = {
		All: 0,
		Queue: 1,
		Cull: 2,
		FreezeUi: 3,
	};
	static #cullEvents = false;
	static #eventQueue = [];
	static #queueingEvents = false;
	
	static #eventHandlers = {};
	static #pendingReturns = {};
	static #nextReturnId = 0;
	
	static Init() {
		addEventListener("message", async (msg) => {
			if(msg.data.deadUids)
				for(const uid of msg.data.deadUids)
					delete this.#eventHandlers[uid];
			if(msg.data.cmd === "event")
				await this.#eventHandler(msg.data);
			else if(msg.data.cmd === "return")
				this.#returnHandler(msg.data);
		});
	}
	
	static async #eventHandler(data) {
		if(this.#cullEvents)
			return;
		if(this.#queueingEvents) {
			this.#eventQueue.unshift(data);
			return;
		}
		
		var uid = data.widgetUid;
		var uidEventHandlers = this.#eventHandlers[uid];
		if(!uidEventHandlers)
			return;
		
		var handlerInfo = uidEventHandlers[data.eventName];
		if(handlerInfo && handlerInfo.callback) {
			if(handlerInfo.otherEvents === this.OtherEventsEnum.Cull)
				this.#cullEvents = true;
			else if(handlerInfo.otherEvents === this.OtherEventsEnum.Queue)
				this.#queueingEvents = true;
			else if(handlerInfo.otherEvents === this.OtherEventsEnum.FreezeUi) {
				//this.#queueingEvents = true; // still receive events like close window / maximise / etc
				this._sendCommand(null, "freezeUi", null, false);
			}
			await handlerInfo.callback(data);
			this.#queueingEvents = false;
			this.#cullEvents = false;
			if(handlerInfo.otherEvents === this.OtherEventsEnum.FreezeUi) {
				this._sendCommand(null, "unfreezeUi", null, false);
			}
			while(this.#eventQueue.length)
				await this.#eventHandler(this.#eventQueue.pop());
		}
	}
	
	static #returnHandler(msgData) {
		var resolveFunc = this.#pendingReturns[msgData.returnId];
		resolveFunc(msgData.data);
		delete this.#pendingReturns[msgData.returnId];
	}
	
	// todo - multiple event listeners for same event (currently, if try to add another handler, will overwrite first one)
	// todo - ability to remove previously registered event listener
	// todo - register event with main thread, so main thread only sends events it needs to
	static _listenEvent(widgetUid, eventName, otherEvents, callback) {
		this.#eventHandlers[widgetUid] = this.#eventHandlers[widgetUid] || {};
		this.#eventHandlers[widgetUid][eventName] = {
			otherEvents: otherEvents,
			callback: callback,
		};
	}
	static _listenJsEvent(widgetUid, eventName, otherEvents, eventFields, callback) {
		this.#eventHandlers[widgetUid] = this.#eventHandlers[widgetUid] || {};
		this.#eventHandlers[widgetUid]["js_" + eventName] = {
			otherEvents: otherEvents,
			callback: callback,
		};
		UI._sendCommand(widgetUid, "widget_listenJsEvent", {eventName: eventName, eventFields: eventFields}, false);
	}
	
	static async _sendCommand(uid, commandName, commandData, hasReturnVal) {
		let data = {
			cmd: commandName,
		};
		if(uid)
			data.uid = uid;
		if(commandData)
			data.data = commandData;
		if(hasReturnVal)
			data.returnId = this.#nextReturnId++;
		postMessage(data);
		if(hasReturnVal)
			return new Promise((resolve, reject) => {
				this.#pendingReturns[data.returnId] = resolve;
			});
	}
	
	static async NewWindowAsync(windowData) {
		let windowUid = await this._sendCommand(null, "newWin", windowData, true);
		return new WindowHandle(windowUid);
	}

	static SetBufferDomUpdates(doBuffer) {
		this._sendCommand(null, "setBufferDomUpdates", doBuffer, false);
	}

	static FlushDomUpdates() {
		this._sendCommand(null, "flushDomUpdates", null, false);
	}
	
	static SetBufferCommands(doBuffer) {
		this._sendCommand(null, "setBufferCommands", doBuffer, false);
	}
	
	static FlushCommands() {
		this._sendCommand(null, "flushCommands", null, false);
	}

	static QuitApp() {
		this._sendCommand(null, "quitApp", null, false);
    }
	
	static async ShowMessageAsync(modalParentWin, winTitle, message) {
		let winDef = {"config":{"title":winTitle,"icon":"Camera","containerLayout":{"flexDirection":"column"}},"data":[{"widget":"uilabel","data":{"text":message},"layout":{"positionFlex":{"alignSelf":"center"},"margin":["30px","10px","30px","10px"]}},{"widget":"uibutton","config":{"id":"okbtn"},"data":{"text":"OK"},"layout":{"positionFlex":{"alignSelf":"flex-end"},"margin":["","20px","20px","20px"]}}],"events":["minimize","maximize","close","quit"]};
		let win = null;
		if(!modalParentWin)
			win = await UI.NewWindowAsync(winDef);
		else
			win = await modalParentWin.NewChildModalWindowAsync(winDef);
		
		let okbtn = await win.WidgetAsync("okbtn");
		okbtn.On("click", UI.OtherEventsEnum.Cull, (ev) => {
			win.Close();
		});
		win.On("requestClose", UI.OtherEventsEnum.Cull, (ev) => {
			win.Close();
		});
	}
	
	static async GetConfirmationFromUserAsync(modalParentWin, winTitle, message, okText, cancelText, icon) {
		let winDef = {"config":{"title":winTitle,"icon":icon,fitInitialContent:true,resizable:false,x:"center",y:"center","containerLayout":{"flexDirection":"column"}},"data":[{"widget":"uilabel",config:{width:"350px",},"data":{"text":message},"layout":{"positionFlex":{"alignSelf":"left"},"margin":["20px","20px","5px","20px"]}},{"widget":"container","config":{"containerLayout":{"flexDirection":"row","justifyContent":"right"}},"data":[{"widget":"uibutton","config":{"id":"ok"},"data":{"text":okText},"layout":{"positionFlex":{"alignSelf":"flex-end"},"margin":["","20px","20px","20px"]}},{"widget":"uibutton","config":{"mode":"normal","id":"cancel"},"data":{"text":cancelText},"layout":{"margin":["","20px","20px",""]}}]}],"events":["minimize","maximize","close","quit"]};
		let win = null;
		if(!modalParentWin)
			win = await UI.NewWindowAsync(winDef);
		else
			win = await modalParentWin.NewChildModalWindowAsync(winDef);
		
		let ok = await win.WidgetAsync("ok");
		let cancel = await win.WidgetAsync("cancel");
		let resolveFunc = null;
		ok.On("click", UI.OtherEventsEnum.Cull, async (ev) => {
			resolveFunc(true);
			win.Close();
		});
		cancel.On("click", UI.OtherEventsEnum.Cull, (ev) => {
			resolveFunc(false);
			win.Close();
		});
		win.On("requestClose", UI.OtherEventsEnum.Cull, (ev) => {
			resolveFunc(false);
			win.Close();
		});
		return new Promise((resolve, reject) => {
			resolveFunc = resolve;
		});
	}
	
	static async GetTextFromUserAsync(modalParentWin, winTitle, message, existingText) {
		let winDef = {"config":{"title":winTitle,"icon":"Camera",fitInitialContent:true,resizable:false,x:"center",y:"center","containerLayout":{"flexDirection":"column"}},"data":[{"widget":"uilabel",config:{width:"350px",},"data":{"text":message},"layout":{"positionFlex":{"alignSelf":"left"},"margin":["20px","20px","5px","20px"]}},{"widget":"textinput","config":{"id":"text"},"state":{"text":(existingText ? existingText : "")},"layout":{"border":["2","1","1","2"],"margin":["","20px","20px","20px"]}},{"widget":"container","config":{"containerLayout":{"flexDirection":"row","justifyContent":"right"}},"data":[{"widget":"uibutton","config":{"id":"ok"},"data":{"text":"OK"},"layout":{"positionFlex":{"alignSelf":"flex-end"},"margin":["","20px","20px","20px"]}},{"widget":"uibutton","config":{"mode":"normal","id":"cancel"},"data":{"text":"Cancel"},"layout":{"margin":["","20px","20px",""]}}]}],"events":["minimize","maximize","close","quit"]};
		let win = null;
		if(!modalParentWin)
			win = await UI.NewWindowAsync(winDef);
		else
			win = await modalParentWin.NewChildModalWindowAsync(winDef);
		
		let text = await win.WidgetAsync("text");
		let ok = await win.WidgetAsync("ok");
		let cancel = await win.WidgetAsync("cancel");
		let resolveFunc = null;
		ok.On("click", UI.OtherEventsEnum.Cull, async (ev) => {
			let textStr = (await text.GetStateAsync()).text;
			if(!textStr)
				textStr = null;
			resolveFunc(textStr);
			win.Close();
		});
		cancel.On("click", UI.OtherEventsEnum.Cull, (ev) => {
			resolveFunc(null);
			win.Close();
		});
		win.On("requestClose", UI.OtherEventsEnum.Cull, (ev) => {
			resolveFunc(null);
			win.Close();
		});
		return new Promise((resolve, reject) => {
			resolveFunc = resolve;
		});
	}
	
	
	
	
	static #fileChooserFormDef =

{"config":{"title":"Save file","icon":"Camera","width":610,"height":440,"containerLayout":{"flexDirection":"column"}},"data":[{"widget":"container","config":{"containerLayout":{"flexDirection":"row"}},"data":[{"widget":"uilabel","data":{"text":"Save in:"},"layout":{"positionFlex":{"shrink":"0","alignSelf":"center"},"margin":["","10px","",""]}},{"widget":"textinput","config":{"id":"path"},"state":{"text":""},"layout":{"border":["2","1","1","2"],"positionFlex":{"basis":"100%","alignSelf":"center"},"margin":["","10px","",""]}},{"widget":"toolbar","config":{"id":"toolbar"},"data":{"items":[{"name":"Up","command":"up","icon":"svg-actions-go-up"},{"name":"Back","command":"back","icon":"svg-actions-go-previous"},{"name":"Forward","command":"forward","icon":"svg-actions-go-next"},{"name":"New folder","command":"newFolder","icon":"svg-actions-folder-new"}]}}],"layout":{"margin":["10px","10px","10px","10px"]}},{"widget":"splitpane","config":{"pxMode":true,"width":180,"snapOpen":false,"pane1ContainerLayout":{"border":["2","1","1","2"],"flexDirection":"row"},"pane2ContainerLayout":{"border":["2","1","1","2"],"flexDirection":"row"}},"data":{"pane1":[{"widget":"treeview","config":{"id":"tree"},"layout":{"positionAbsolute":{"top":"0","right":"0","bottom":"0","left":"0"}}}],"pane2":[{"widget":"iconview","config":{"id":"icons"},"state":{"selectedItemIds":[]}}]},"layout":{"positionFlex":{"basis":"100%","alignSelf":"stretch"},"margin":["","10px","10px","10px"]}},{"widget":"container","config":{"containerLayout":{"flexDirection":"row"}},"data":[{"widget":"uilabel","data":{"text":"File name:"},"layout":{"positionFlex":{"shrink":"0","alignSelf":"center"},"margin":["","10px","",""]}},{"widget":"textinput","config":{"id":"filename"},"state":{"text":""},"layout":{"border":["2","1","1","2"],"positionFlex":{"basis":"100%"}}}],"layout":{"margin":["","10px","10px","10px"]}},{"widget":"container","config":{"containerLayout":{"flexDirection":"row","justifyContent":"flex-end"}},"data":[{"widget":"uibutton","config":{"mode":"normal","id":"ok"},"data":{"text":"Save"},"layout":{"margin":["","10px","",""]}},{"widget":"uibutton","config":{"mode":"normal","id":"cancel"},"data":{"text":"Cancel"}}],"layout":{"margin":["","10px","10px","10px"]}}],"events":["minimize","maximize","close","quit"]};

;
/* widget IDs:
	toolbar
		back
		forward
		up
		newFolder
	path
	tree
	icons
	filename
	ok
	cancel
*/
	static FileChooserModeEnum = {
		ChooseExistingFile:0,
		ChooseExistingOrNewFile:1,
		//ChooseExistingDir:2, //todo implement this
	}
	
	// options: {
	//     modalParentWin: <window> - if not null, make the dialog box a modal dialog of specified window
	//     mode: <FileChooserModeEnum> - see enum definition
	//     titleText: <string> - text to put on window titlebar
	//     buttonText: <string> - text to put on "OK" button (usually "Save" or "Open")
	//     existingWarnMessage: <string> - if saving over existing file, warn user first with this message
	//     startPath: <string> - path to start in
	//     fileName: <string> - file to pre select
	//     icon: <string> - icon for window
	// }
	//todo - implement existingWarnMessage, startPath. select file in icon pane if filename specified.
	//     - catch all possible exceptions
	//	   - when navigating via path textbox / back / forward / up buttons, select folder in treeview
	//	   - "type"/"types" options when opening/saving file
	static async ShowFileChooserDialogAsync(options) {
		options = options || {};
		let folderIcon = "32-places-folder";
		let fileIcon = "32-mimetypes-x-office-document";
		let resolveFunc = null;
		let opfsRoot = await navigator.storage.getDirectory();
		
		if(options.icon)
			this.#fileChooserFormDef.config.icon = options.icon;// || "svg-actions-document-save";
		else
			this.#fileChooserFormDef.config.icon = "";
		
		if(options.titleText)
			this.#fileChooserFormDef.config.title = options.titleText;
		else
			this.#fileChooserFormDef.config.title = "";
		
		
		let win = null;
		if(options.modalParentWin)
			win = await options.modalParentWin.NewChildModalWindowAsync(this.#fileChooserFormDef);
		else
			win = await UI.NewWindowAsync(this.#fileChooserFormDef);
		
		let toolbarWidget = await win.WidgetAsync("toolbar");
		let pathWidget = await win.WidgetAsync("path");
		let treeWidget = await win.WidgetAsync("tree");
		let iconsWidget = await win.WidgetAsync("icons");
		let fileNameWidget = await win.WidgetAsync("filename");
		let okWidget = await win.WidgetAsync("ok");
		let cancelWidget = await win.WidgetAsync("cancel");
		
		if(options.buttonText)
			okWidget.SetData({ text: options.titleText });
		else
			okWidget.SetData({ text: "OK" });
				
		win.On("requestClose", UI.OtherEventsEnum.Cull, (data) => {
			win.Close();
			resolveFunc(null);
		});
		
		let treeviewItems = [];
		let nextItemId = 0; //todo - check for bugs if use id=0
		let itemLookup = []; //by id - { item:item, parentItem:parentItem }
		
		let item = {
			name: "/",
			id: nextItemId++,
			icon: "svg-devices-drive-harddisk",
			children: [],
		};
		itemLookup.push({ item: item, parent: null, });
		treeviewItems.push(item);
		
		let currentPathText = "-";
		let currentPathHandle = opfsRoot;
		
		let pathTextHistory = ["/"];
		let pathTextHistoryIndex = 0;
		
		await openDir(opfsRoot, true);
		
		async function scanAndAddSubDirectories(dirHandle, dirTreeItem) {
			if(!dirTreeItem.children)
				dirTreeItem.children = [];
			let treeItems = dirTreeItem.children;
			let itemInfo = itemLookup[dirTreeItem.id];
			if(itemInfo.scanned)
				return;
			itemInfo.scanned = true;
			
			if(!dirHandle) {
				let pathText = itemInfoToPathText(itemInfo);
				dirHandle = await FS.PathTextToDirHandleAsync(pathText);
			}

			let didAdd = false;
			for await (const [name, handle] of dirHandle.entries()) {
				if(handle.kind !== "directory")
					continue;
				
				let treeItem = null;
				treeItem = treeItems.find((e) => { return e.name === name; });
				if(!treeItem) {
					treeItem = {
						name: name,
						id: nextItemId++,
						icon: folderIcon,
					};
					didAdd = true;
					itemLookup.push({ item: treeItem, parent: itemInfo });
					treeItems.push(treeItem);
				}
			}
			return didAdd;
		}
		
		async function openDir(dirHandle, ignoreHistory) {
			// 1. show path text
			let pathArray = await opfsRoot.resolve(dirHandle);
			let pathText = "/" + pathArray.join("/");
			if(pathText ===  currentPathText)
				return;
			currentPathText = pathText;
			currentPathHandle = dirHandle;
			pathWidget.SetState({text:pathText});
			
			// deal with back/forward history
			if(!ignoreHistory) {
				if(pathTextHistoryIndex !== pathTextHistory.length - 1) // need to invalidate previous forward history.
					pathTextHistory.splice(pathTextHistoryIndex + 1, Infinity);
				pathTextHistory.push(pathText);
				pathTextHistoryIndex++;
			}
			// disable/enable up/back/forward buttons as appropriate
			let toolbarData = (await toolbarWidget.GetDataAsync());
			let up = toolbarData.items.find((e) => e.command === "up");
			up.disabled = pathText === "/";
			let back = toolbarData.items.find((e) => e.command === "back");
			back.disabled = pathTextHistoryIndex === 0;
			let forward = toolbarData.items.find((e) => e.command === "forward");
			forward.disabled = pathTextHistoryIndex === pathTextHistory.length - 1;
			toolbarWidget.SetData(toolbarData);
			
			// 2. get list of files/folders for icon pane
			let icons = [];
			for await (const [key, value] of dirHandle.entries()) {
				let name = key; // or: name = value.name;
				let handle = value;
				if(value.kind === "file")
					icons.push({label:name, id:name, icon: fileIcon });
				else if(value.kind === "directory")
					icons.push({label:name, id:name, icon: folderIcon });
			}
			iconsWidget.SetData({items:icons});
			
			// 3. get list of folders at each level...
			// 3.1 iterate through pathArray, if doesn't currently exist in treeviewItems then add
			// 3.1.1 scan each folder added, if has subdirectories then add them (in contracted state) to parent treeviewItem
			// (also, see treeWidget.On("expanded") eventhandler below - on folder expand, scan each subfolder for folders - if so, show [+]...)
			let currentTreeviewItems = itemLookup[0].item.children;
			let currentDirHandle = opfsRoot;
			let currentItemLookupParent = itemLookup[0];
			let selectedId = null;
			for(let depth = 0; depth <= pathArray.length; depth++) {
				let childItem = null;
				let childHandle = null;
				for await (const [name, handle] of currentDirHandle.entries()) {
					if(handle.kind !== "directory")
						continue;
					
					let treeItem = currentTreeviewItems.find((e) => { return e.name === name; });
					if(treeItem)
						await scanAndAddSubDirectories(handle, treeItem);
					else {
						treeItem = {
							name: name,
							id: nextItemId++,
							icon: folderIcon,
						};
						itemLookup.push({ item: treeItem, parent: currentItemLookupParent });
						currentTreeviewItems.push(treeItem);
						
						await scanAndAddSubDirectories(handle, treeItem); // scan for subdirectories, add to tree...
					}
					
					if(await handle.isSameEntry(dirHandle))
						selectedId = treeItem.id;
					if(depth < pathArray.length && pathArray[depth] === name) {
						childItem = treeItem;
						childHandle = handle;
					}
				}
				if(depth < pathArray.length) {
					if(!childItem) {
						console.error("this is very bad"); // maybe was deleted in the mean time?
						break;
					}
					currentDirHandle = childHandle;
					childItem.children = childItem.children || [];
					currentTreeviewItems = childItem.children;
					currentItemLookupParent = {item:childItem, parent:currentItemLookupParent};
				}
			}
			
			treeWidget.SetData({items:treeviewItems});
		}
		
		treeWidget.On("expanded", UI.OtherEventsEnum.All, async (ev) => {
			let itemId = ev.data;
			let itemInfo = itemLookup[itemId];
			(itemInfo.item.children || []).forEach(async (childItem) => {
				if(await scanAndAddSubDirectories(null, childItem)) {
					treeWidget.SetData({ items: treeviewItems, });
				}
			});
		});
		
		toolbarWidget.On("command", UI.OtherEventsEnum.FreezeUi, async (ev) => {
			if(ev.data === "up") {
				let parentPathText = FS.PathTextGetParentPathText(currentPathText);
				let dirHandle = parentPathText ? await FS.PathTextToDirHandleAsync(parentPathText) : null;
				if(dirHandle === null) // if parent folder was deleted... just open root dir instead
					dirHandle = opfsRoot;
				openDir(dirHandle);
			}
			else if(ev.data === "back") {
				if(pathTextHistoryIndex === 0)
					return; // can't go back any  more
				let prevDirHandle = await FS.PathTextToDirHandleAsync(pathTextHistory[pathTextHistoryIndex - 1]);
				if(prevDirHandle === null) {
					// maybe directory was deleted in the mean time.
					return;
				}
				pathTextHistoryIndex--;
				openDir(prevDirHandle, true);
			}
			else if(ev.data === "forward") {
				if(pathTextHistoryIndex === pathTextHistory.length - 1)
					return; // can't go forward any more
				let nextDirHandle = await FS.PathTextToDirHandleAsync(pathTextHistory[pathTextHistoryIndex + 1]);
				if(nextDirHandle === null) {
					// maybe directory was deleted in the mean time.
					return;
				}
				pathTextHistoryIndex++;
				openDir(nextDirHandle, true);
			}
			else if(ev.data === "newFolder") {
				let name = await UI.GetTextFromUserAsync(win, "New folder", "Enter name for new folder:");
				if(!name)
					return;
				let newHandle = await currentPathHandle.getDirectoryHandle(name, {create: true,});
				await openDir(currentPathHandle);
				iconsWidget.SetState({selectedItemIds:[name]});
			}
		});
		
		pathWidget.On("change", UI.OtherEventsEnum.FreezeUi, async (ev) => {
			let pathText = ev.data;
			
			// if empty string:
			//      do nothing
			if(!pathText)
				return;
			
			// if subpath (string with no leading "/", eg, "myfiles" or "config/images"):
			//		append to current path
			if(!pathText.startsWith("/"))
				pathText = currentPathText + (currentPathText.endsWith("/") ? "" : "/") + pathText;
			
			// open path... If directory doesnt exist, show error message: Path "..." not found
			let dirHandle = await FS.PathTextToDirHandleAsync(pathText);
			if(dirHandle === null)
				UI.ShowMessageAsync(win, "Path not found", "Sorry, the path \"" + pathText + "\" was not found.");
			else
				openDir(dirHandle);
		});
		
		function itemInfoToPathText(itemInfo) {
			let pathText = "";
			do {
				pathText = "/" + itemInfo.item.name + pathText;
				itemInfo = itemInfo.parent;
			}
			while(itemInfo && itemInfo.item.name !== "/");
			return pathText;
		}
		
		treeWidget.On("selected", UI.OtherEventsEnum.FreezeUi, async (ev) => {
			// 1. retrieve info about the folder just selected
			let itemIdx = ev.data;
			let itemInfo = itemLookup[itemIdx];
			
			//console.log("select - itemIdx", ev.data, "itemInfo", itemInfo);
			
			// 2. construct pathText
			let pathText = itemInfoToPathText(itemInfo);
			
			// 3. get dirHandle, then load dir...
			let dirHandle = await FS.PathTextToDirHandleAsync(pathText);
			if(dirHandle === null) // maybe was deleted in the mean time
				UI.ShowMessageAsync(win, "Path not found", "Sorry, the path \"" + pathText + "\" was not found.");
			else
				openDir(dirHandle);
			UI.FlushDomUpdates();
		});
		
		iconsWidget.On("selectionChanged", UI.OtherEventsEnum.FreezeUi, async (ev) => {
			let itemIds = ev.data;
			if(!itemIds.length)
				return;
			// itemIds = file names
			fileNameWidget.SetState({text:itemIds[0]});
		});
		
		iconsWidget.On("open", UI.OtherEventsEnum.FreezeUi, async (ev) => {
			let itemId = ev.data;
			// itemId = file name
			fileNameWidget.SetState({text:itemId});
			// todo - click OK button or otherwise actually return file to app...
		});
		okWidget.On("click", UI.OtherEventsEnum.FreezeUi, async (ev) => {
			let fileNameText = (await fileNameWidget.GetStateAsync()).text;
			if(!fileNameText)
				return;
			
			let path = currentPathText + "/" + fileNameText;
			let createIfNeeded = options.mode === UI.FileChooserModeEnum.ChooseExistingOrNewFile;
			let fileHandle = await FS.PathTextToFileHandleAsync(path, createIfNeeded);
			if(fileHandle) {
				win.Close();
				resolveFunc(fileHandle);
				return;
			}
			// ok, not found or some error... maybe selected file is directory, let's open it.
			let dirHandle = await FS.PathTextToDirHandleAsync(path, false);
			if(dirHandle) {
				openDir(dirHandle);
				return;
			}
			UI.ShowMessageAsync(win, "File not found", "The file \"" + path + "\" was not found.");
			
		});
		cancelWidget.On("click", UI.OtherEventsEnum.Cull, async (ev) => {
			win.Close();
			resolveFunc(null);
		});
		
		return new Promise((resolve, reject) => {
			resolveFunc = resolve;
		});
	}
}

UI.Init();

export class FS {
	static #opfsRoot = null;
	
	static async InitAsync() {
		this.#opfsRoot = await navigator.storage.getDirectory();
		
		// Create a hierarchy of files and folders
		let opfsRoot = this.#opfsRoot;
		const pageFH = await opfsRoot.getFileHandle("page.sys", {create: true,});
		const diskinfoFH = await opfsRoot.getFileHandle("diskinfo.dat", {create: true,});
		const etcDH = await opfsRoot.getDirectoryHandle("etc", {create: true,});
			const fstabFH = await etcDH.getFileHandle("fstab", { create: true, });
			const hostsFH = await etcDH.getFileHandle("hosts", { create: true, });
			const init1FH = await etcDH.getFileHandle("init.1", { create: true, });
			const init2FH = await etcDH.getFileHandle("init.2", { create: true, });
			const init3FH = await etcDH.getFileHandle("init.3", { create: true, });
			const apacheDH = await etcDH.getDirectoryHandle("apache", { create: true },);
				const httpdconfFH = await apacheDH.getFileHandle("httpd.conf", { create: true, });
				const spamrulesFH = await apacheDH.getFileHandle("spamrules", { create: true, });
				const site1DH = await apacheDH.getDirectoryHandle("site1", { create: true },);
				const site2DH = await apacheDH.getDirectoryHandle("site2", { create: true },);
					const indexhtmlFH = await site2DH.getFileHandle("index.html", { create: true, });
					const bannerjpgFH = await site2DH.getFileHandle("banner.jpg", { create: true, });
					const httpdconfFH_2 = await site2DH.getFileHandle("httpd.conf", { create: true, });
									      await site2DH.getFileHandle("httpd1.conf", { create: true, });
									      await site2DH.getFileHandle("httpd2.conf", { create: true, });
									      await site2DH.getFileHandle("httpd3.conf", { create: true, });
									      await site2DH.getFileHandle("httpd4.conf", { create: true, });
									      await site2DH.getFileHandle("httpd5.conf", { create: true, });
									      await site2DH.getFileHandle("httpd6.conf", { create: true, });
									      await site2DH.getFileHandle("httpd7.conf", { create: true, });
									      await site2DH.getFileHandle("httpd8.conf", { create: true, });
									      await site2DH.getFileHandle("httpd9.conf", { create: true, });
									      await site2DH.getFileHandle("httpd10.conf", { create: true, });
									      await site2DH.getFileHandle("httpd11.conf", { create: true, });
									      await site2DH.getFileHandle("httpd12.conf", { create: true, });
									      await site2DH.getFileHandle("httpd13.conf", { create: true, });
									      await site2DH.getFileHandle("httpd14.conf", { create: true, });
									      await site2DH.getFileHandle("httpd15.conf", { create: true, });
									      await site2DH.getFileHandle("httpd16.conf", { create: true, });
									      await site2DH.getFileHandle("httpd17.conf", { create: true, });
									      await site2DH.getFileHandle("httpd18.conf", { create: true, });
									      await site2DH.getFileHandle("httpd19.conf", { create: true, });
									      await site2DH.getFileHandle("httpd20.conf", { create: true, });
									      await site2DH.getFileHandle("httpd21.conf", { create: true, });
									      await site2DH.getFileHandle("httpd22.conf", { create: true, });
									      await site2DH.getFileHandle("httpd23.conf", { create: true, });
									      await site2DH.getFileHandle("httpd24.conf", { create: true, });
									      await site2DH.getFileHandle("httpd25.conf", { create: true, });
									      await site2DH.getFileHandle("httpd26.conf", { create: true, });
									      await site2DH.getFileHandle("httpd27.conf", { create: true, });
									      await site2DH.getFileHandle("httpd28.conf", { create: true, });
									      await site2DH.getFileHandle("httpd29.conf", { create: true, });
									      await site2DH.getFileHandle("httpd30.conf", { create: true, });
									      await site2DH.getFileHandle("httpd31.conf", { create: true, });
									      await site2DH.getFileHandle("httpd32.conf", { create: true, });
									      await site2DH.getFileHandle("httpd33.conf", { create: true, });
									      await site2DH.getFileHandle("httpd34.conf", { create: true, });
									      await site2DH.getFileHandle("httpd35.conf", { create: true, });
									      await site2DH.getFileHandle("httpd36.conf", { create: true, });
									      await site2DH.getFileHandle("httpd37.conf", { create: true, });
									      await site2DH.getFileHandle("httpd38.conf", { create: true, });
									      await site2DH.getFileHandle("httpd39.conf", { create: true, });
									      await site2DH.getFileHandle("httpd40.conf", { create: true, });
									      await site2DH.getFileHandle("httpd41.conf", { create: true, });
									      await site2DH.getFileHandle("httpd42.conf", { create: true, });
									      await site2DH.getFileHandle("httpd43.conf", { create: true, });
									      await site2DH.getFileHandle("httpd44.conf", { create: true, });
									      await site2DH.getFileHandle("httpd45.conf", { create: true, });
									      await site2DH.getFileHandle("httpd46.conf", { create: true, });
									      await site2DH.getFileHandle("httpd47.conf", { create: true, });
									      await site2DH.getFileHandle("httpd48.conf", { create: true, });
									      await site2DH.getFileHandle("httpd49.conf", { create: true, });
									      await site2DH.getFileHandle("httpd50.conf", { create: true, });
									      await site2DH.getFileHandle("httpd51.conf", { create: true, });
									      await site2DH.getFileHandle("httpd52.conf", { create: true, });
									      await site2DH.getFileHandle("httpd53.conf", { create: true, });
									      await site2DH.getFileHandle("httpd54.conf", { create: true, });
									      await site2DH.getFileHandle("httpd55.conf", { create: true, });
									      await site2DH.getFileHandle("httpd56.conf", { create: true, });
									      await site2DH.getFileHandle("httpd57.conf", { create: true, });
									      await site2DH.getFileHandle("httpd1_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd2_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd3_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd4_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd5_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd6_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd7_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd8_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd9_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd10_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd11_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd12_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd13_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd14_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd15_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd16_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd17_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd18_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd19_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd20_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd21_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd22_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd23_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd24_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd25_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd26_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd27_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd28_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd29_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd30_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd31_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd32_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd33_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd34_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd35_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd36_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd37_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd38_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd39_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd40_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd41_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd42_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd43_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd44_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd45_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd46_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd47_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd48_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd49_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd50_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd51_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd52_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd53_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd54_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd55_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd56_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd57_bak.conf", { create: true, });
									      await site2DH.getFileHandle("httpd1_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd2_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd3_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd4_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd5_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd6_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd7_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd8_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd9_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd10_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd11_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd12_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd13_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd14_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd15_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd16_bak.conf.gz", { create: true, });
									      await site2DH.getFileHandle("httpd17_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd18_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd19_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd20_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd21_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd22_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd23_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd24_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd25_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd26_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd27_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd28_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd29_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd30_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd31_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd32_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd33_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd34_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd35_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd36_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd37_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd38_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd39_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd40_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd41_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd42_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd43_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd44_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd45_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd46_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd47_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd48_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd49_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd50_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd51_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd52_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd53_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd54_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd55_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd56_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("httpd57_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd1_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd2_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd3_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd4_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd5_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd6_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd7_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd8_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd9_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd10_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd11_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd12_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd13_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd14_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd15_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd16_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd17_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd18_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd19_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd20_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd21_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd22_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd23_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd24_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd25_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd26_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd27_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd28_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd29_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd30_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd31_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd32_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd33_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd34_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd35_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd36_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd37_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd38_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd39_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd40_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd41_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd42_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd43_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd44_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd45_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd46_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd47_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd48_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd49_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd50_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd51_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd52_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd53_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd54_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd55_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd56_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("_old_httpd57_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd1.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd2.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd3.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd4.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd5.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd6.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd7.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd8.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd9.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd10.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd11.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd12.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd13.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd14.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd15.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd16.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd17.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd18.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd19.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd20.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd21.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd22.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd23.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd24.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd25.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd26.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd27.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd28.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd29.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd30.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd31.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd32.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd33.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd34.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd35.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd36.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd37.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd38.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd39.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd40.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd41.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd42.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd43.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd44.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd45.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd46.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd47.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd48.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd49.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd50.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd51.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd52.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd53.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd54.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd55.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd56.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd57.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd1_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd2_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd3_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd4_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd5_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd6_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd7_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd8_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd9_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd10_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd11_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd12_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd13_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd14_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd15_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd16_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd17_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd18_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd19_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd20_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd21_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd22_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd23_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd24_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd25_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd26_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd27_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd28_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd29_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd30_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd31_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd32_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd33_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd34_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd35_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd36_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd37_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd38_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd39_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd40_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd41_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd42_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd43_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd44_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd45_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd46_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd47_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd48_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd49_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd50_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd51_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd52_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd53_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd54_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd55_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd56_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd57_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("1httpd1_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd2_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd3_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd4_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd5_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd6_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd7_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd8_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd9_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd10_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd11_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd12_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd13_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd14_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd15_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd16_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd17_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd18_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd19_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd20_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd21_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd22_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd23_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd24_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd25_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd26_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd27_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd28_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd29_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd30_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd31_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd32_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd33_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd34_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd35_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd36_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd37_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd38_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd39_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd40_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd41_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd42_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd43_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd44_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd45_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd46_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd47_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd48_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd49_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd50_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd51_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd52_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd53_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd54_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd55_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd56_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1httpd57_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd1_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd2_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd3_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd4_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd5_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd6_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd7_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd8_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd9_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd10_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd11_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd12_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd13_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd14_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd15_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd16_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd17_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd18_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd19_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd20_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd21_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd22_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd23_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd24_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd25_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd26_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd27_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd28_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd29_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd30_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd31_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd32_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd33_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd34_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd35_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd36_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd37_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd38_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd39_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd40_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd41_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd42_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd43_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd44_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd45_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd46_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd47_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd48_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd49_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd50_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd51_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd52_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd53_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd54_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd55_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd56_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("1_old_httpd57_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd1.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd2.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd3.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd4.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd5.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd6.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd7.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd8.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd9.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd10.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd11.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd12.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd13.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd14.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd15.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd16.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd17.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd18.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd19.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd20.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd21.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd22.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd23.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd24.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd25.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd26.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd27.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd28.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd29.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd30.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd31.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd32.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd33.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd34.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd35.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd36.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd37.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd38.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd39.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd40.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd41.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd42.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd43.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd44.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd45.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd46.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd47.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd48.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd49.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd50.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd51.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd52.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd53.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd54.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd55.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd56.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd57.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd1_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd2_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd3_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd4_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd5_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd6_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd7_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd8_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd9_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd10_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd11_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd12_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd13_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd14_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd15_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd16_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd17_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd18_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd19_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd20_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd21_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd22_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd23_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd24_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd25_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd26_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd27_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd28_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd29_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd30_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd31_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd32_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd33_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd34_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd35_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd36_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd37_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd38_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd39_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd40_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd41_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd42_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd43_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd44_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd45_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd46_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd47_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd48_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd49_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd50_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd51_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd52_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd53_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd54_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd55_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd56_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd57_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("2httpd1_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd2_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd3_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd4_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd5_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd6_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd7_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd8_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd9_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd10_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd11_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd12_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd13_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd14_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd15_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd16_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd17_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd18_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd19_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd20_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd21_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd22_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd23_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd24_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd25_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd26_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd27_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd28_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd29_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd30_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd31_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd32_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd33_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd34_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd35_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd36_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd37_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd38_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd39_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd40_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd41_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd42_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd43_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd44_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd45_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd46_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd47_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd48_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd49_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd50_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd51_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd52_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd53_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd54_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd55_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd56_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2httpd57_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd1_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd2_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd3_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd4_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd5_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd6_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd7_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd8_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd9_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd10_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd11_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd12_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd13_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd14_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd15_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd16_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd17_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd18_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd19_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd20_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd21_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd22_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd23_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd24_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd25_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd26_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd27_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd28_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd29_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd30_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd31_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd32_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd33_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd34_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd35_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd36_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd37_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd38_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd39_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd40_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd41_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd42_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd43_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd44_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd45_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd46_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd47_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd48_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd49_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd50_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd51_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd52_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd53_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd54_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd55_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd56_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("2_old_httpd57_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd1.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd2.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd3.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd4.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd5.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd6.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd7.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd8.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd9.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd10.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd11.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd12.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd13.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd14.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd15.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd16.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd17.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd18.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd19.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd20.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd21.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd22.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd23.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd24.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd25.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd26.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd27.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd28.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd29.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd30.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd31.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd32.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd33.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd34.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd35.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd36.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd37.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd38.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd39.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd40.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd41.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd42.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd43.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd44.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd45.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd46.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd47.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd48.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd49.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd50.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd51.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd52.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd53.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd54.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd55.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd56.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd57.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd1_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd2_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd3_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd4_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd5_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd6_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd7_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd8_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd9_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd10_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd11_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd12_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd13_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd14_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd15_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd16_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd17_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd18_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd19_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd20_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd21_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd22_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd23_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd24_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd25_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd26_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd27_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd28_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd29_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd30_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd31_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd32_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd33_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd34_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd35_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd36_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd37_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd38_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd39_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd40_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd41_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd42_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd43_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd44_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd45_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd46_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd47_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd48_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd49_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd50_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd51_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd52_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd53_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd54_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd55_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd56_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd57_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("3httpd1_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd2_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd3_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd4_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd5_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd6_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd7_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd8_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd9_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd10_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd11_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd12_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd13_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd14_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd15_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd16_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd17_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd18_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd19_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd20_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd21_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd22_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd23_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd24_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd25_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd26_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd27_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd28_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd29_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd30_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd31_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd32_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd33_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd34_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd35_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd36_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd37_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd38_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd39_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd40_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd41_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd42_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd43_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd44_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd45_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd46_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd47_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd48_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd49_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd50_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd51_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd52_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd53_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd54_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd55_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd56_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3httpd57_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd1_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd2_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd3_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd4_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd5_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd6_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd7_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd8_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd9_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd10_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd11_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd12_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd13_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd14_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd15_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd16_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd17_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd18_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd19_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd20_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd21_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd22_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd23_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd24_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd25_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd26_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd27_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd28_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd29_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd30_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd31_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd32_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd33_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd34_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd35_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd36_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd37_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd38_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd39_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd40_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd41_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd42_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd43_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd44_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd45_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd46_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd47_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd48_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd49_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd50_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd51_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd52_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd53_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd54_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd55_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd56_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("3_old_httpd57_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd1.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd2.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd3.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd4.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd5.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd6.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd7.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd8.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd9.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd10.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd11.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd12.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd13.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd14.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd15.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd16.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd17.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd18.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd19.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd20.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd21.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd22.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd23.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd24.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd25.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd26.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd27.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd28.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd29.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd30.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd31.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd32.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd33.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd34.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd35.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd36.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd37.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd38.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd39.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd40.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd41.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd42.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd43.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd44.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd45.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd46.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd47.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd48.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd49.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd50.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd51.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd52.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd53.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd54.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd55.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd56.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd57.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd1_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd2_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd3_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd4_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd5_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd6_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd7_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd8_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd9_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd10_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd11_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd12_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd13_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd14_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd15_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd16_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd17_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd18_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd19_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd20_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd21_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd22_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd23_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd24_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd25_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd26_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd27_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd28_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd29_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd30_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd31_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd32_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd33_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd34_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd35_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd36_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd37_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd38_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd39_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd40_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd41_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd42_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd43_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd44_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd45_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd46_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd47_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd48_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd49_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd50_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd51_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd52_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd53_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd54_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd55_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd56_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd57_bak.conf", { create: true, });
									      //await site2DH.getFileHandle("4httpd1_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd2_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd3_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd4_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd5_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd6_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd7_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd8_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd9_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd10_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd11_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd12_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd13_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd14_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd15_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd16_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd17_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd18_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd19_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd20_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd21_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd22_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd23_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd24_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd25_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd26_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd27_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd28_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd29_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd30_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd31_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd32_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd33_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd34_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd35_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd36_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd37_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd38_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd39_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd40_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd41_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd42_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd43_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd44_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd45_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd46_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd47_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd48_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd49_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd50_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd51_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd52_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd53_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd54_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd55_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd56_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4httpd57_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd1_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd2_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd3_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd4_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd5_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd6_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd7_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd8_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd9_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd10_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd11_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd12_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd13_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd14_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd15_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd16_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd17_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd18_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd19_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd20_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd21_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd22_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd23_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd24_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd25_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd26_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd27_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd28_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd29_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd30_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd31_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd32_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd33_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd34_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd35_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd36_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd37_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd38_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd39_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd40_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd41_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd42_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd43_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd44_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd45_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd46_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd47_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd48_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd49_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd50_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd51_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd52_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd53_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd54_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd55_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd56_bak.conf.gz", { create: true, });
									      //await site2DH.getFileHandle("4_old_httpd57_bak.conf.gz", { create: true, });
				const site3DH = await apacheDH.getDirectoryHandle("site3", { create: true },);
				
									      await site3DH.getDirectoryHandle("httpd1.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd2.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd3.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd4.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd5.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd6.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd7.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd8.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd9.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd10.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd11.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd12.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd13.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd14.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd15.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd16.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd17.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd18.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd19.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd20.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd21.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd22.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd23.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd24.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd25.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd26.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd27.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd28.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd29.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd30.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd31.conf", { create: true, });
									      await site3DH.getDirectoryHandle("httpd32.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd33.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd34.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd35.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd36.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd37.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd38.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd39.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd40.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd41.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd42.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd43.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd44.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd45.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd46.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd47.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd48.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd49.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd50.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd51.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd52.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd53.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd54.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd55.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd56.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd57.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd1_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd2_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd3_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd4_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd5_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd6_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd7_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd8_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd9_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd10_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd11_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd12_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd13_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd14_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd15_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd16_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd17_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd18_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd19_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd20_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd21_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd22_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd23_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd24_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd25_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd26_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd27_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd28_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd29_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd30_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd31_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd32_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd33_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd34_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd35_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd36_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd37_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd38_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd39_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd40_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd41_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd42_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd43_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd44_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd45_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd46_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd47_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd48_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd49_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd50_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd51_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd52_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd53_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd54_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd55_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd56_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd57_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd1_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd2_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd3_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd4_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd5_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd6_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd7_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd8_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd9_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd10_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd11_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd12_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd13_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd14_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd15_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd16_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd17_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd18_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd19_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd20_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd21_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd22_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd23_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd24_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd25_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd26_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd27_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd28_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd29_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd30_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd31_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd32_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd33_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd34_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd35_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd36_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd37_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd38_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd39_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd40_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd41_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd42_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd43_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd44_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd45_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd46_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd47_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd48_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd49_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd50_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd51_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd52_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd53_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd54_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd55_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd56_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("httpd57_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd1_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd2_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd3_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd4_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd5_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd6_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd7_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd8_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd9_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd10_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd11_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd12_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd13_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd14_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd15_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd16_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd17_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd18_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd19_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd20_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd21_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd22_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd23_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd24_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd25_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd26_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd27_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd28_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd29_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd30_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd31_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd32_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd33_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd34_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd35_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd36_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd37_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd38_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd39_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd40_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd41_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd42_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd43_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd44_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd45_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd46_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd47_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd48_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd49_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd50_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd51_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd52_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd53_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd54_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd55_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd56_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("_old_httpd57_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd1.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd2.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd3.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd4.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd5.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd6.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd7.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd8.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd9.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd10.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd11.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd12.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd13.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd14.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd15.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd16.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd17.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd18.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd19.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd20.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd21.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd22.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd23.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd24.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd25.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd26.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd27.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd28.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd29.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd30.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd31.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd32.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd33.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd34.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd35.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd36.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd37.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd38.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd39.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd40.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd41.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd42.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd43.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd44.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd45.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd46.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd47.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd48.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd49.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd50.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd51.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd52.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd53.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd54.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd55.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd56.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd57.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd1_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd2_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd3_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd4_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd5_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd6_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd7_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd8_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd9_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd10_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd11_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd12_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd13_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd14_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd15_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd16_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd17_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd18_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd19_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd20_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd21_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd22_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd23_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd24_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd25_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd26_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd27_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd28_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd29_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd30_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd31_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd32_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd33_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd34_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd35_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd36_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd37_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd38_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd39_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd40_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd41_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd42_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd43_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd44_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd45_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd46_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd47_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd48_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd49_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd50_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd51_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd52_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd53_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd54_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd55_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd56_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd57_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd1_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd2_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd3_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd4_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd5_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd6_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd7_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd8_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd9_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd10_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd11_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd12_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd13_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd14_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd15_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd16_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd17_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd18_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd19_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd20_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd21_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd22_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd23_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd24_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd25_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd26_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd27_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd28_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd29_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd30_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd31_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd32_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd33_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd34_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd35_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd36_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd37_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd38_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd39_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd40_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd41_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd42_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd43_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd44_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd45_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd46_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd47_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd48_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd49_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd50_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd51_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd52_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd53_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd54_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd55_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd56_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1httpd57_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd1_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd2_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd3_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd4_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd5_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd6_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd7_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd8_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd9_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd10_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd11_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd12_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd13_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd14_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd15_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd16_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd17_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd18_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd19_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd20_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd21_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd22_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd23_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd24_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd25_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd26_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd27_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd28_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd29_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd30_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd31_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd32_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd33_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd34_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd35_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd36_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd37_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd38_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd39_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd40_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd41_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd42_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd43_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd44_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd45_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd46_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd47_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd48_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd49_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd50_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd51_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd52_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd53_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd54_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd55_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd56_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("1_old_httpd57_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd1.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd2.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd3.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd4.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd5.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd6.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd7.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd8.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd9.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd10.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd11.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd12.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd13.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd14.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd15.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd16.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd17.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd18.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd19.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd20.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd21.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd22.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd23.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd24.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd25.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd26.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd27.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd28.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd29.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd30.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd31.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd32.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd33.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd34.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd35.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd36.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd37.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd38.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd39.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd40.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd41.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd42.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd43.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd44.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd45.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd46.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd47.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd48.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd49.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd50.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd51.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd52.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd53.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd54.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd55.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd56.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd57.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd1_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd2_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd3_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd4_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd5_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd6_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd7_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd8_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd9_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd10_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd11_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd12_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd13_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd14_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd15_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd16_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd17_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd18_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd19_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd20_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd21_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd22_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd23_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd24_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd25_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd26_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd27_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd28_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd29_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd30_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd31_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd32_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd33_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd34_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd35_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd36_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd37_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd38_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd39_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd40_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd41_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd42_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd43_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd44_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd45_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd46_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd47_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd48_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd49_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd50_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd51_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd52_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd53_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd54_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd55_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd56_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd57_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd1_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd2_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd3_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd4_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd5_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd6_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd7_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd8_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd9_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd10_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd11_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd12_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd13_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd14_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd15_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd16_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd17_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd18_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd19_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd20_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd21_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd22_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd23_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd24_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd25_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd26_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd27_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd28_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd29_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd30_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd31_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd32_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd33_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd34_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd35_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd36_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd37_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd38_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd39_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd40_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd41_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd42_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd43_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd44_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd45_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd46_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd47_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd48_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd49_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd50_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd51_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd52_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd53_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd54_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd55_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd56_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2httpd57_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd1_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd2_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd3_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd4_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd5_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd6_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd7_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd8_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd9_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd10_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd11_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd12_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd13_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd14_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd15_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd16_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd17_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd18_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd19_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd20_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd21_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd22_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd23_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd24_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd25_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd26_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd27_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd28_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd29_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd30_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd31_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd32_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd33_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd34_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd35_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd36_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd37_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd38_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd39_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd40_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd41_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd42_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd43_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd44_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd45_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd46_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd47_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd48_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd49_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd50_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd51_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd52_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd53_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd54_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd55_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd56_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("2_old_httpd57_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd1.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd2.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd3.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd4.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd5.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd6.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd7.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd8.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd9.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd10.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd11.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd12.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd13.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd14.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd15.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd16.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd17.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd18.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd19.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd20.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd21.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd22.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd23.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd24.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd25.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd26.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd27.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd28.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd29.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd30.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd31.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd32.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd33.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd34.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd35.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd36.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd37.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd38.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd39.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd40.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd41.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd42.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd43.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd44.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd45.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd46.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd47.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd48.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd49.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd50.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd51.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd52.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd53.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd54.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd55.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd56.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd57.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd1_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd2_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd3_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd4_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd5_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd6_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd7_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd8_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd9_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd10_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd11_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd12_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd13_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd14_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd15_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd16_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd17_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd18_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd19_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd20_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd21_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd22_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd23_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd24_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd25_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd26_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd27_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd28_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd29_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd30_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd31_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd32_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd33_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd34_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd35_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd36_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd37_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd38_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd39_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd40_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd41_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd42_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd43_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd44_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd45_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd46_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd47_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd48_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd49_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd50_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd51_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd52_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd53_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd54_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd55_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd56_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd57_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd1_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd2_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd3_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd4_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd5_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd6_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd7_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd8_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd9_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd10_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd11_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd12_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd13_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd14_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd15_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd16_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd17_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd18_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd19_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd20_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd21_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd22_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd23_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd24_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd25_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd26_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd27_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd28_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd29_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd30_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd31_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd32_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd33_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd34_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd35_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd36_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd37_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd38_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd39_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd40_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd41_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd42_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd43_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd44_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd45_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd46_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd47_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd48_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd49_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd50_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd51_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd52_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd53_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd54_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd55_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd56_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3httpd57_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd1_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd2_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd3_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd4_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd5_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd6_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd7_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd8_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd9_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd10_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd11_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd12_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd13_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd14_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd15_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd16_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd17_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd18_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd19_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd20_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd21_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd22_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd23_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd24_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd25_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd26_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd27_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd28_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd29_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd30_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd31_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd32_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd33_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd34_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd35_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd36_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd37_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd38_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd39_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd40_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd41_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd42_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd43_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd44_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd45_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd46_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd47_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd48_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd49_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd50_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd51_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd52_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd53_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd54_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd55_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd56_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("3_old_httpd57_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd1.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd2.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd3.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd4.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd5.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd6.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd7.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd8.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd9.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd10.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd11.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd12.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd13.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd14.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd15.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd16.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd17.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd18.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd19.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd20.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd21.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd22.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd23.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd24.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd25.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd26.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd27.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd28.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd29.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd30.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd31.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd32.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd33.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd34.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd35.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd36.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd37.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd38.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd39.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd40.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd41.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd42.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd43.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd44.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd45.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd46.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd47.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd48.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd49.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd50.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd51.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd52.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd53.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd54.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd55.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd56.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd57.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd1_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd2_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd3_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd4_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd5_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd6_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd7_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd8_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd9_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd10_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd11_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd12_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd13_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd14_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd15_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd16_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd17_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd18_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd19_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd20_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd21_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd22_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd23_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd24_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd25_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd26_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd27_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd28_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd29_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd30_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd31_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd32_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd33_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd34_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd35_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd36_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd37_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd38_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd39_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd40_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd41_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd42_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd43_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd44_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd45_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd46_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd47_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd48_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd49_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd50_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd51_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd52_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd53_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd54_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd55_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd56_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd57_bak.conf", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd1_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd2_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd3_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd4_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd5_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd6_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd7_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd8_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd9_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd10_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd11_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd12_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd13_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd14_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd15_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd16_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd17_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd18_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd19_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd20_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd21_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd22_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd23_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd24_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd25_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd26_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd27_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd28_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd29_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd30_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd31_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd32_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd33_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd34_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd35_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd36_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd37_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd38_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd39_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd40_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd41_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd42_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd43_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd44_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd45_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd46_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd47_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd48_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd49_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd50_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd51_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd52_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd53_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd54_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd55_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd56_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4httpd57_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd1_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd2_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd3_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd4_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd5_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd6_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd7_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd8_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd9_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd10_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd11_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd12_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd13_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd14_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd15_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd16_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd17_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd18_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd19_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd20_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd21_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd22_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd23_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd24_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd25_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd26_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd27_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd28_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd29_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd30_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd31_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd32_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd33_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd34_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd35_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd36_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd37_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd38_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd39_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd40_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd41_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd42_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd43_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd44_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd45_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd46_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd47_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd48_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd49_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd50_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd51_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd52_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd53_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd54_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd55_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd56_bak.conf.gz", { create: true, });
									      //await site3DH.getDirectoryHandle("4_old_httpd57_bak.conf.gz", { create: true, });
			const python_settingsDH = await etcDH.getDirectoryHandle("python_settings", { create: true },);
		const homeDH = await opfsRoot.getDirectoryHandle("home", {create: true,});
			const user1DH = await homeDH.getDirectoryHandle("user1", {create: true,});
			const user2DH = await homeDH.getDirectoryHandle("user2", {create: true,});
			const user3DH = await homeDH.getDirectoryHandle("user3", {create: true,});
			const user4DH = await homeDH.getDirectoryHandle("user4", {create: true,});
			const user5DH = await homeDH.getDirectoryHandle("user5", {create: true,});
		const mntDH = await opfsRoot.getDirectoryHandle("mnt", {create: true,});

		// Access existing files and folders via their names
		//const existingFileHandle = await opfsRoot.getFileHandle("my first file");
		//const existingDirectoryHandle = await opfsRoot.getDirectoryHandle("my first folder");
	}
	
	static async #pathArrayToHandle(pathArray, isFile, createIfNeeded) {
		let dirHandle = this.#opfsRoot;
		for(let i = 0; i < pathArray.length && dirHandle !== null; i++) {
			try {
				if(isFile && i === pathArray.length - 1) {
					dirHandle = await dirHandle.getFileHandle(pathArray[i], {create: createIfNeeded ? true : false});
					if(dirHandle.kind !== "file")
						dirHandle = null;
				}
				else {
					dirHandle = await dirHandle.getDirectoryHandle(pathArray[i]);
					if(dirHandle.kind !== "directory")
						dirHandle = null;
				}
			}
			catch(exception) {
				dirHandle = null;
			}
		}
		return dirHandle;
	}
	
	static async PathTextToDirHandleAsync(pathText, createIfNeeded) {
		let pathArray = pathText.split("/")
								.filter((segment) => { return segment !== ""; }); // clean up any multiple, leading, or trailing slashes
		return await this.#pathArrayToHandle(pathArray, false, createIfNeeded);
	}
	
	static async PathTextToFileHandleAsync(pathText, createIfNeeded) {
		let pathArray = pathText.split("/")
								.filter((segment) => { return segment !== ""; }); // clean up any multiple, leading, or trailing slashes
		return await this.#pathArrayToHandle(pathArray, true, createIfNeeded);
	}
	
	static PathTextGetParentPathText(pathText) {
		let pathArray = pathText.split("/")
								.filter((segment) => { return segment !== ""; }); // clean up any multiple, leading, or trailing slashes
		if(!pathArray.length)
			return null; // if pass in "/" - parent = null...
		pathArray.pop();
		return "/" + pathArray.join("/");
	}
	
	static async HandleToPathTextAsync(handle) {
		let pathArray = await this.#opfsRoot.resolve(handle);
		return "/" + pathArray.join("/");
	}
	
	static async DirHandleGetParentDirHandleAsync(dirHandle) {
		let pathArray = await this.#opfsRoot.resolve(dirHandle);
		if(!pathArray.length)
			return null;
		pathArray.pop();
		return await this.#pathArrayToHandle(pathArray);
	}
}

await FS.InitAsync();
