class WorkerCom {
	static Connect(process) {
		var worker = process.GetWorker();
		worker.addEventListener("message", (ev) => {
			console.log("message, data = ", ev.data);
			var msgData = ev.data;
			var cmd = msgData.cmd;
			var data = msgData.data;
			var props = {
				process: process,
				worker: worker,
				uid: msgData.uid,
				returnId: msgData.returnId,
			};
			if(cmd === "setBufferCommands" || cmd === "flushCommands")
				this["_cmd_" + cmd](props, data);
			else
				process.BufferCommand(() => { this["_cmd_" + cmd](props, data); });
		});
	}
	
	static #sendReturnVal(returnVal, props, transfer) {
		let msg = {
			cmd: "return",
			returnId: props.returnId,
			data: returnVal,
		}
		var deadUids = UI.PopRemovedUids();
		if(deadUids.length)
			msg.deadUids = deadUids;
		if(transfer)
			props.worker.postMessage(msg, transfer);
		else
			props.worker.postMessage(msg);
	}
	
	static _cmd_freezeUi(props) {
		let windows = props.process.GetWindows();
		windows.forEach(w => {
			w.FreezeInput();
		});
	}
	static _cmd_unfreezeUi(props) {
		let windows = props.process.GetWindows();
		windows.forEach(w => {
			w.UnfreezeInput();
		});
	}
	static _cmd_window_newChildModalWin(props, windowData) {
		let parentWin = UiWindow.GetWindowByUid(props.uid);
		let win = parentWin.CreateModalChildWin(windowData);
		this.#sendReturnVal(win.GetUid(), props);
	}
	static _cmd_window_getWidgetUid(props, widgetId) {
		let win = UiWindow.GetWindowByUid(props.uid);
		let widget = win ? win.GetWidgetById(widgetId) : null;
		let widgetUid = widget ? widget.GetUid() : null;
		this.#sendReturnVal(widgetUid, props);
	}
	static _cmd_window_getContainer(props) {
		let win = UiWindow.GetWindowByUid(props.uid);
		let containerUid = win ? win.GetContainer().GetUid() : null;
		this.#sendReturnVal(containerUid, props);
	}
	static _cmd_window_close(props) {
		let win = UiWindow.GetWindowByUid(props.uid);
		win.Close();
	}
	
	static _cmd_container_getDescriptor(props) {
		let container = Container.GetContainerByUid(props.uid);
		let descriptor = container ? {
			id: container.GetId(),
			name: container.GetName(),
		} : null;
		this.#sendReturnVal(descriptor, props);
	}
	static _cmd_container_getWidgets(props) {
		let container = Container.GetContainerByUid(props.uid);
		let widgets = container ? container.GetWidgets().map((w) => { return w.GetUid(); }) : null;
		this.#sendReturnVal(widgets, props);
	}
	static _cmd_container_getWidgetDescriptors(props) {
		let container = Container.GetContainerByUid(props.uid);
		let widgetDescriptors = container ? container.GetWidgets().map((widget) => {
			return {
					uid: widget.GetUid(),
					id: widget.GetId(),
					widgetType: widget.GetWidgetType(),
			};
		}) : null;
		this.#sendReturnVal(widgetDescriptors, props);
	}
	static _cmd_container_prependWidget(props, widgetData) {
		let container = Container.GetContainerByUid(props.uid);
		let widget = container ? container.PrependWidget(widgetData) : null;
		this.#sendReturnVal(widget ? widget.GetUid() : null, props);
	}
	static _cmd_container_appendWidget(props, widgetData) {
		let container = Container.GetContainerByUid(props.uid);
		let widget = container ? container.AppendWidget(widgetData) : null;
		this.#sendReturnVal(widget ? widget.GetUid() : null, props);
	}
	static _cmd_container_empty(props) {
		let container = Container.GetContainerByUid(props.uid);
		if(container)
			container.Empty();
	}
	static _cmd_container_getBoundingClientRect(props) {
		let container = Container.GetContainerByUid(props.uid);
		this.#sendReturnVal(container.GetElement().getBoundingClientRect(), props);
	}
	static _cmd_container_setStyle(props, style) {
		let container = Container.GetContainerByUid(props.uid);
		if(container)
			container.SetStyle(style);
	}
	
	static _cmd_widget_getDescriptor(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		let descriptor = widget ? {
			id: widget.GetId(),
			widgetType: widget.GetWidgetType(),
		} : null;
		this.#sendReturnVal(descriptor, props);
	}
	static _cmd_widget_getConfig(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		this.#sendReturnVal(widget ? widget.GetConfig() : null, props);
	}
	static _cmd_widget_getData(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		this.#sendReturnVal(widget ? widget.GetData() : null, props);
	}
	static _cmd_widget_getState(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		this.#sendReturnVal(widget ? widget.GetState() : null, props);
	}
	static _cmd_widget_getLayout(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		this.#sendReturnVal(widget ? widget.GetLayout() : null, props);
	}
	static _cmd_widget_setConfig(props, widgetConfig) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.SetConfig(widgetConfig);
	}
	static _cmd_widget_setData(props, widgetData) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.SetData(widgetData);
	}
	static _cmd_widget_setState(props, widgetState) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.SetState(widgetState);
	}
	static _cmd_widget_setLayout(props, widgetLayout) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.SetLayout(widgetLayout);
	}
	static _cmd_widget_setConfigAsync(props, widgetConfig) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.SetConfig(widgetConfig);
		this.#sendReturnVal(true, props);
	}
	static _cmd_widget_setDataAsync(props, widgetData) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.SetData(widgetData);
		this.#sendReturnVal(true, props);
	}
	static _cmd_widget_setStateAsync(props, widgetState) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.SetState(widgetState);
		this.#sendReturnVal(true, props);
	}
	static _cmd_widget_setLayoutAsync(props, widgetLayout) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.SetLayout(widgetLayout);
		this.#sendReturnVal(true, props);
	}
	static _cmd_widget_insertWidgetBefore(props, widgetData) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		let newWidget = widget ? widget.InsertWidgetBefore(widgetData) : null;
		this.#sendReturnVal(newWidget ? newWidget.GetUid() : null, props);
	}
	static _cmd_widget_insertWidgetAfter(props, widgetData) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		let newWidget = widget ? widget.InsertWidgetAfter(widgetData) : null;
		this.#sendReturnVal(newWidget ? newWidget.GetUid() : null, props);
	}
	static _cmd_widget_getParentContainer(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		this.#sendReturnVal(widget ? widget.GetParentContainer().GetUid() : null, props);
	}
	// get child container in widget with ID = containerId.
	// if no ID given, then get first child container of widget.
	static _cmd_widget_getChildContainerById(props, containerId) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		let childContainer = null;
		if(widget && containerId) {
			childContainer = widget.GetChildContainerById(containerId);
		}
		else if(widget && widget.GetChildContainers().length > 0)
			childContainer = widget.GetChildContainers()[0];
		this.#sendReturnVal(childContainer ? childContainer.GetUid() : null, props);
	}
	static _cmd_widget_getChildContainers(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		let containerUids = widget ? widget.GetChildContainers().map((container) => {
			return container.GetUid();
		}) : null;
		this.#sendReturnVal(containerUids, props);
	}
	static _cmd_widget_getChildContainerDescriptors(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		let containerDescriptors = widget ? widget.GetChildContainers().map((container) => {
			return {
					uid: container.GetUid(),
					id: container.GetId(),
					name: container.GetName(),
			};
		}) : null;
		this.#sendReturnVal(containerDescriptors, props);
	}
	static _cmd_widget_empty(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.Empty();
	}
	static _cmd_widget_remove(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.Remove();
	}
	static _cmd_widget_moveAbove(props, widgetToMoveAboveOfUid) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		let widgetToMoveAboveOf = WidgetBase.GetWidgetByUid(widgetToMoveAboveOfUid);
		if(widget && widgetToMoveAboveOf)
			widget.MoveAbove(widgetToMoveAboveOf);
	}
	static _cmd_widget_moveBelow(props, widgetToMoveBelowOfUid) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		let widgetToMoveBelowOf = WidgetBase.GetWidgetByUid(widgetToMoveBelowOfUid);
		if(widget && widgetToMoveBelowOf)
			widget.MoveBelow(widgetToMoveBelowOf);
	}
	static _cmd_widget_moveStartContainer(props, containerUid) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		let container = Container.GetContainerByUid(containerUid);
		if(widget && container)
			widget.MoveStartContainer(container);
	}
	static _cmd_widget_moveEndContainer(props, containerUid) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		let container = Container.GetContainerByUid(containerUid);
		if(widget && container)
			widget.MoveEndContainer(container);
	}
	
	static _cmd_widget_listenJsEvent(props, data) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		widget.addEventListener(data.eventName, (ev) => {
			let evData = null;
			if(data.eventFields) {
				evData = {};
				for(let i = 0; i < data.eventFields.length; i++) {
					let fieldName = data.eventFields[i];
					let segments = fieldName.split(".");
					let prop = ev[segments[0]];
					for(let j = 1; j < segments.length; j++)
						prop = prop[segments[j]];
					evData[fieldName] = prop;
				}
			}
			OS.FireEvent(widget, "js_" + data.eventName, evData);
		});
	}
	static _cmd_widget_getCanvas(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		let canvasStuff = widget && widget.GetCanvasOffscreen
			? widget.GetCanvasOffscreen()
			: null;
		if(canvasStuff)
			this.#sendReturnVal({canvas: canvasStuff.canvas, w: canvasStuff.w, h: canvasStuff.h}, props, [canvasStuff.canvas]);
		else
			this.#sendReturnVal(null, props);
	}
	
	static _cmd_widget_getBoundingClientRect(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		this.#sendReturnVal(widget.getBoundingClientRect(), props);
	}
	
	static _cmd_newWin(props, windowData) {
		var win = WM.NewWindow(props.process, windowData);
		win.Focus();
		this.#sendReturnVal(win.GetUid(), props);
	}

	static _cmd_setBufferDomUpdates(props, doBuffer) {
		props.process.SetBufferDomUpdates(doBuffer);
	}

	static _cmd_flushDomUpdates(props) {
		props.process.FlushDomUpdates();
	}
	
	static _cmd_setBufferCommands(props, doBuffer) {
		props.process.SetBufferCommands(doBuffer);
	}
	
	static _cmd_flushCommands(props) {
		props.process.FlushCommands();
	}

	static _cmd_quitApp(props) {
        props.process.Kill();
    }
	
	static _cmd_widget_lockCursor(props, cursorStyle) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.LockCursor(cursorStyle || null);
	}
	
	static _cmd_widget_unlockCursor(props) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.UnlockCursor();
	}
	
	static _cmd_widget_setStyle(props, style) {
		let widget = WidgetBase.GetWidgetByUid(props.uid);
		if(widget)
			widget.SetStyle(style);
	}
	
}
