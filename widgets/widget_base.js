
/*
Every widget should implement:

Minimal and easy-to-style DOM elements

SetConfig() - loading app / from app code / designer
SetData() - loading app / from app code / developer studio
SetState() - from app code

GetConfig() - ? from designer
GetData() - ? from designer
GetState() - from app code
GetContainers() - designer, app code maybe?

Example:
app - set disabled on element - SetConfig
app - add list view item - SetData
app - save UI state on quit - GetState
app - load UI state on start - SetState
app - select list view item - SetState 

*/

class WidgetBase extends HTMLElement {
	static #widgetsByUid = {};
	static _addWidget(widget) {
		this.#widgetsByUid[widget.GetUid()] = widget;
	}
	static GetWidgetByUid(uid) {
		return this.#widgetsByUid[uid];
	}
	static _removeWidgetUid(uid) {
		delete this.#widgetsByUid[uid];
		UI.MarkRemovedUid(uid);
	}
	
	#uid = UI.GetNextUid();
	GetUid() {
		return this.#uid;
	}
	
	#connected = false;
	#shadowRoot = null;
	#win = null;
	GetWin() {
		return this.#win;
	}
	ChangeWin(newWin) {
		if(this.#win === newWin)
			return;
		this.#win.RemoveWidgetId(this.#id);
		newWin.AddWidget(this);
	}
                            GetProcess()            { return this.#win.GetProcess(); }
	#parent = null;			GetParent()				{ return this.#parent; }
	#id = null; 			GetId()					{ return this.#id; }
	_setId(newId) {
		if(this.#id === newId)
			return;
		this.#id = newId;
		this.#win.ChangeWidgetId(this, this.#id, newId);
	}
	#parentContainer = null; GetParentContainer()	{ return this.#parentContainer; }
	#widgetType = null;		GetWidgetType()			{ return this.#widgetType; }
	
	// GetConfig - public method. _setConfig - intended only to be called by instance class.
	//		Intention is to use instance.SetConfig() which is internal to instance class, which then internally
	//		calls _setConfig(). Unfortunately cannot create protected method in js.
	#config = {};
	GetConfig() {
		if(this.#id === null)
			return this.#config;
		return { ...this.#config, id: this.#id };
	}
	_setConfig(config) {
		this.#config = config;
		let id = config.id || null;
		delete config.id;
		if(id)
			id = id + "";
		this._setId(id);
	}
	#data = {}; 	GetData() 	{ return this.#data; }   _setData(data) 	{ this.#data = data; }
	#state = {};	GetState()	{ return this.#state; }  _setState(state)	{ this.#state = state; }
	
	#layout = {};	
	GetLayout()	{
		return this.#layout;
	}
	SetLayout(layout) {
		this.#layout = layout;
		UI.ApplyWidgetLayout(this, layout);
	}
	                                                     
	#events = []; 	GetEvents() { return this.#events; }
	
	#containers = [];
	#containersById = {};
	_registerContainer(containerElement, id, name) {
		//console.log("widget ", this, ": registering new container - element =", containerElement, "id=", id, "name=", name);
		var container = new Container(containerElement, id, name, this, this.#win);
		if(id)
			this.#containersById[id] = container;
		this.#containers.push(container);
		return container;
	}
	_changeContainerId(container, oldId, newId) {
		if(oldId === newId)
			return;
        if(oldId)
			delete this.#containersById[oldId];
        if(newId)
            this.#containersById[newId] = container;
    }
	// only need to call when destroying container without destroying widget, eg
	// when deleting/creating tabs in Tabs widget
	_removeContainer(container) {
        container.Empty();
		var index = this.#containers.indexOf(container);
		this.#containers.splice(index, 1); // remove from array
		if(container.GetId())
			delete this.#containersById[container.GetId()];
		Container._removeContainerUid(container.GetUid());
        container.GetElement().remove();
	}
	GetChildContainers() {
		//console.log("widget ", this, ": getting child containers...", this.#containers);
		return this.#containers;
	}
	GetChildContainerById(id) {
		if(id)
			return this.#containersById[id];
	}
	
	constructor() {
		super();
		//console.log("RECONSTRUCTING this=",this);
	}
	static CreateWidget(data, parentContainer, parentWidget, win) {
		//data.win = win;
		//data.parent = parentWidget;
		//data.parentContainer = parentContainer;
		var widget = document.createElement("ui-" + data.widget.toLowerCase());
		widget.Init(data, parentContainer, parentWidget, win); //widget.Init(data)
		win.AddWidget(widget);
		this.#widgetsByUid[widget.GetUid()] = widget;
		widget.OnConnect();
		return widget;
	}
	// call Init() before connecting to DOM.
	Init(data, parentContainer, parentWidget, win) { //Init(data)
		WidgetBase._addWidget(this);
		this.#win = win; //data.win
		this.#parent = parentWidget; //data.parent
		this.#parentContainer = parentContainer; //data.parentContainer
		
		if(!!data.config) 	this._setConfig(data.config);
		if(!!data.data)		this.#data = data.data;
		if(!!data.state)	this.#state = data.state;
		if(!!data.layout)	this.#layout = data.layout;
	}
	// (overridden by some widgets, eg ToolBar)
	//disconnectedCallback() {
		//console.log("I've been disconected - ", this.GetFullDesc());
	//}
	connectedCallback() {
	}
	Connect(tagname, hasScrollBars) {
		//if(this.#connected)
		//	console.log("I'm REconnected? - ", this.GetFullDesc());
		if(!this.#win)
			throw new Error("must call Init() with win != null before connecting to DOM");
		this.#connected = true;
		this.#widgetType = tagname;
		
		this.#shadowRoot = this.attachShadow({mode:"closed"});
		UI.ApplyWidgetLayout(this.#shadowRoot.host, this.#layout);
        this.#shadowRoot.appendChild(document.getElementById(tagname + "-template").content.cloneNode(true));
		if(hasScrollBars)
            this.#shadowRoot.prepend(document.getElementById("webkit-scrollbar-style-template").content.cloneNode(true));

		// for debugging only
		this.setAttribute("uid", this.#uid);
		this.setAttribute("id_", this.#id);
		// instantiating classes must implement following methods/fields...
		//if(!this.SetConfig) console.error(tagname + ": SetConfig() method not implemented");
		//if(!this.SetData)   console.error(tagname + ": SetData() method not implemented");
		//if(!this.SetState)  console.error(tagname + ": SetState() method not implemented");
		return this.#shadowRoot;
	}
	
	InsertWidgetBefore(data) {
		let widget = WidgetBase.CreateWidget(data, this.#parentContainer, this.#parent, this.#win);
		this.BufferDomUpdate(() => {
			this.before(widget);
		});
		this.#parentContainer.AddWidgetAlreadyPlacedBeforeWidget(widget, this);
		return widget;
	}
	InsertWidgetAfter(data) {
		let widget = WidgetBase.CreateWidget(data, this.#parentContainer, this.#parent, this.#win);
		this.BufferDomUpdate(() => {
			this.after(widget);
		});
		this.#parentContainer.AddWidgetAlreadyPlacedAfterWidget(widget, this);
		return widget;
	}
	Empty() {
		// remove all child widgets
		this.#containers.forEach((container) => {
			container.Empty();
		});
	}
	Remove() {
		// remove containers and their children
		this.#containers.forEach((container) => {
			container.RemoveOnParentWidgetRemove(); // todo rename to something like MarkEnclosingWidgetRemoved()?
		});
		
		// remove self
		this.#parentContainer._markWidgetRemoved(this);
		WidgetBase._removeWidgetUid(this.#uid);
		this.#win.RemoveWidgetId(this.#id);
		this.BufferDomUpdate(() => {
			this.remove(); // actually remove from dom
		});
	}
	// todo - test these functions more? do moving widgets affect other parts of the code?
	MoveAbove(targetWidget) {
		let widgets = this.#parentContainer.GetWidgets();
		let myIndex = widgets.indexOf(this);		
		let targetContainerWidgets = targetWidget.GetParentContainer().GetWidgets();
		let targetWidgetIndex = targetContainerWidgets.indexOf(targetWidget);
		widgets.splice(myIndex, 1); // remove from current container widget array
		targetContainerWidgets.splice(targetWidgetIndex, 0, this); // insert into target widget's enclosing container, before target widget
		this.BufferDomUpdate(() => {
			targetWidget.before(this); // actually move DOM element //todo does .before() exist?
		});
		this.ChangeWin(targetWidget.GetWin());
	}
	MoveBelow(targetWidget) {
		let widgets = this.#parentContainer.GetWidgets();
		let myIndex = widgets.indexOf(this);		
		let targetContainerWidgets = targetWidget.GetParentContainer().GetWidgets();
		let targetWidgetIndex = targetContainerWidgets.indexOf(targetWidget);
		widgets.splice(myIndex, 1); // remove from current container widget array
		targetContainerWidgets.splice(targetWidgetIndex + 1, 0, this); // insert into target widget's enclosing container, after target widget
		this.BufferDomUpdate(() => {
			targetWidget.after(this); // actually move DOM element
		});
		this.ChangeWin(targetWidget.GetWin());
	}
	MoveStartContainer(container) {
		let widgets = this.#parentContainer.GetWidgets();
		let myIndex = widgets.indexOf(this);
		widgets.splice(myIndex, 1); // remove from current container
		container.GetWidgets().unshift(this); // add to start of target container
		this.BufferDomUpdate(() => {
			container.GetElement().prepend(this); // actually move DOM element
		});
		this.ChangeWin(container.GetWin());
	}
	MoveEndContainer(container) {
		let widgets = this.#parentContainer.GetWidgets();
		let myIndex = widgets.indexOf(this);
		widgets.splice(myIndex, 1); // remove from current container
		container.GetWidgets().push(this); // add to end of target container
		this.BufferDomUpdate(() => {
			container.GetElement().append(this); // actually move DOM element
		});
		this.ChangeWin(container.GetWin());
	}
	
	GetId() {
		return this.#id;
	}
	GetFullDesc() {
		let widgetObj = {
			widget: this.#widgetType
		};
		function isEmpty(obj) {
			for(let i in obj)
				return false;
			return true;
		}
		let config = this.GetConfig();
		let data = this.GetData();
		let state = this.GetState();
		let layout = this.#layout;
		if(!isEmpty(config)) widgetObj.config = config;
		if(!isEmpty(data  )) widgetObj.data   = data;
		if(!isEmpty(state )) widgetObj.state  = state;
		if(!isEmpty(layout)) widgetObj.layout = layout;
        return widgetObj;
    }
	//SetEvents(events) {
	//	this.#events = events;
	//}
	FireEvent(evName, data) {
		//console.log("WidgetBase: firing event: evName", evName, "data", data);
//		if(this.#events.includes(evName)) // todo... add from WorkerCom.receiveCommand("addevent"), don't specify in widget config.
			OS.FireEvent(this, evName, data);
	}
	
	BufferDomUpdate(callback) {
		this.#win.GetProcess().BufferDomUpdate(callback);
	}
	FlushDomUpdates() {
		this.#win.GetProcess().FlushDomUpdates();
	}

	#cursorPaneMousemoveHandler = null;
	#cursorPaneMouseupHandler = null;
	LockCursor(cursorStyle) {
		this.FlushDomUpdates();
		var cursorPane = UI.GetCursorPane();
		cursorPane.style.cursor  = cursorStyle || getComputedStyle(this).cursor;
		cursorPane.style.display = "block";
		
		if(this.#cursorPaneMousemoveHandler)
			cursorPane.removeEventListener("mousemove", this.#cursorPaneMousemoveHandler);
		this.#cursorPaneMousemoveHandler = (ev) => {
			this.dispatchEvent(new MouseEvent("mousemove", {
				clientX: ev.clientX,
				clientY: ev.clientY,
			}));
		};
		cursorPane.addEventListener("mousemove", this.#cursorPaneMousemoveHandler);
		
		if(this.#cursorPaneMouseupHandler)
			cursorPane.removeEventListener("mouseup", this.#cursorPaneMouseupHandler);
		this.#cursorPaneMouseupHandler = (ev) => {
			this.dispatchEvent(new MouseEvent("mouseup", {
				clientX: ev.clientX,
				clientY: ev.clientY,
				button:  ev.button,
			}));
		};
		cursorPane.addEventListener("mouseup", this.#cursorPaneMouseupHandler);
	}
	UnlockCursor() {
		this.FlushDomUpdates(); // needed?
		var cursorPane = UI.GetCursorPane();
		cursorPane.style.cursor = null;
		cursorPane.style.display = "none";
		
		if(this.#cursorPaneMousemoveHandler)
			cursorPane.removeEventListener("mousemove", this.#cursorPaneMousemoveHandler);
		this.#cursorPaneMousemoveHandler = null;
		if(this.#cursorPaneMouseupHandler)
			cursorPane.removeEventListener("mouseup", this.#cursorPaneMouseupHandler);
		this.#cursorPaneMouseupHandler = null;
	}
	
	// style = "background:red;"
	// or ["width:20px", "height:10px", ...]
	SetStyle(style) {
		this.BufferDomUpdate(() => {
			UI.SetStyle(this, style);
		});
	}
}
