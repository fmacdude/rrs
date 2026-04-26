class Container {
	static #containersByUid = {};
	static _addContainer(container) {
		this.#containersByUid[container.GetUid()] = container;
	}
	static GetContainerByUid(uid) {
		return this.#containersByUid[uid];
	}
	static _removeContainerUid(uid) {
		delete this.#containersByUid[uid];
		UI.MarkRemovedUid(uid);
	}
	
	#uid = UI.GetNextUid();		GetUid() 		{ return this.#uid; }
	#id = null;					GetId() 		{ return this.#id; }
                                SetId(newId)    {
                                                    if(this.#parentWidget)
                                                        this.#parentWidget._changeContainerId(this.#id, newId);
                                                    this.#id = newId;
                                                }
	#name = null;				GetName() 		{ return this.#name; }
                                SetName(name)   { this.#name = name; }
	#element = null;			GetElement() 	{ return this.#element; }
	#widgets = [];				GetWidgets() 	{ return this.#widgets; }
	#parentWidget = null;		GetParentWidget() { return this.#parentWidget; }
	#win = null;				GetWin()		{ return this.#win; }
	
	BufferDomUpdate(callback) {
		this.#win.GetProcess().BufferDomUpdate(callback);
	}
	FlushDomUpdates() {
		this.#win.GetProcess().FlushDomUpdates();
	}

	constructor(element, id, name, parentWidget, win) {
		this.#element = element;
		if(id)
			this.#id = id;
		if(name)
			this.#name = name;
		if(parentWidget)
			this.#parentWidget = parentWidget;
		this.#win = win;
		Container._addContainer(this);
	}
	PrependWidget(data) {
		let widget = WidgetBase.CreateWidget(data, this, this.#parentWidget, this.#win);
		this.#widgets.unshift(widget);
		this.BufferDomUpdate(() => {
			this.#element.prepend(widget);
		});
		return widget;
	}
	AppendWidget(data) {
		let widget = WidgetBase.CreateWidget(data, this, this.#parentWidget, this.#win);
		this.#widgets.push(widget);
		this.BufferDomUpdate(() => {
			this.#element.append(widget);
		});
		return widget;
	}
	AddWidgetAlreadyPlacedBeforeWidget(widget, existingWidget) {
        let existingIdx = this.#widgets.indexOf(existingWidget);
        if(existingIdx < 0) {
            console.error("can't find widget to insert before");
            return;
        }
		this.#widgets.splice(existingIdx, 0, widget);
	}
	AddWidgetAlreadyPlacedAfterWidget(widget, existingWidget) {
        let existingIdx = this.#widgets.indexOf(existingWidget);
        if(existingIdx < 0) {
            console.error("can't find widget to insert after");
            return;
        }
		this.#widgets.splice(existingIdx + 1, 0, widget);
	}
	_markWidgetRemoved(widget) {
		let index = this.#widgets.indexOf(widget);
		if(index >= 0)
			this.#widgets.splice(index, 1);
	}
	Empty() {
		while(this.#widgets.length)
			this.#widgets[this.#widgets.length - 1].Remove();
	}
	// only call when destroying parent widget.
	// (because container ID will not be removed from parent widget container ID store.)
	// you should (from inside the widget) call this._removeContainer(...) to remove the
	// container but keep the widget.
	RemoveOnParentWidgetRemove() {
		// remove children
		while(this.#widgets.length)
			this.#widgets[this.#widgets.length - 1].Remove();
		// remove self
		Container._removeContainerUid(this.#uid);
		//this.#element.remove(); //todo remove //will be removed anyway with parent widget
		
		// if want to use this function stand-alone, when keeping parent widget alive,
		// need to do some code like this:
		//if(this.#id && this.#parentWidget)
		//	delete this.#parentWidget.#containersById[container.GetId()];
	}
	SetStyle(style) {
		this.BufferDomUpdate(() => {
			UI.SetStyle(this.#element, style);
		});
	}
}
