import { UI, WindowHandle, ContainerHandle, WidgetHandle } from '../lib/workerlib.js';
import { FieldTypeEnum, WidgetDefs, WindowPropsFormDef, IconsFormDef, _widgetLayoutObjectDef, _containerLayoutObjectDef } from './widgetdefs.js';
import { mainWindowDef } from './designer_main_window_def.js';

console.log("designer: started app thread");
let win = await UI.NewWindowAsync(mainWindowDef);

UI.SetBufferDomUpdates(true);
let widgetsDropdown = await win.WidgetAsync("widgets_dropdown");
let rootContainerWidget = await win.WidgetAsync("root");
let rootContainer = await rootContainerWidget.ChildContainerAsync();
let rootContainerDescriptor = await rootContainer.GetDescriptorAsync();
let addRemoveBtn = await win.WidgetAsync("add_remove_btn");
let widgetsTree = await win.WidgetAsync("widgets_tree");
let mainToolbar = await win.WidgetAsync("main_toolbar");
// set root uid...
// need to add GetUid to widgethandle/containerhandle
// need to add GetWidgetByUidAsync and GetContainerByUidAsync workerlib functions

win.On("maximize", UI.OtherEventsEnum.Queue, (data) => {
    //console.log("maximize event received: data=", data);
});
win.On("minimize", UI.OtherEventsEnum.Queue, (data) => {
    //console.log("minimize event received: data=", data);
});
win.On("requestClose", UI.OtherEventsEnum.Cull, (data) => {
    //console.log("requestClose event received: data=", data);
    UI.QuitApp();
});

let treeData = [];//[ { uid: rootContainer.GetUid(), name: "Root container", what: "container", children: [], parent: null } ];

let getTreeItemFromUid = (uid) => { return searchTree(treeData, uid); };

let searchTree = (node, targetUid) => {
    if(node.uid + "" === targetUid + "")
        return node;
    if(!node.children || node.children.length === 0)
        return null;
    for(let i = 0; i < node.children.length; i++) {
        let matchedNode = searchTree(node.children[i], targetUid);
        if(matchedNode)
            return matchedNode;
    }
    return null;
};

rebuildWidgetsTree();
widgetsTree.SetState({selectedId: rootContainer.GetUid()});

async function buildTreeViewItemFromContainerDescriptorAsync(containerDescriptor, parent) {
	let item = {
		uid: containerDescriptor.container.GetUid(),
		containerDescriptor: containerDescriptor,
		name: "Container: " + (containerDescriptor.id ? containerDescriptor.id : "") + " (" + (containerDescriptor.name ? containerDescriptor.name : "") + ")",
		what: "container",
		parent: (parent ? parent : null),
		children: [],
	};
	let widgetDescriptors = await containerDescriptor.container.GetWidgetDescriptorsAsync();
	if(widgetDescriptors.length) {
		for(let i = 0; i < widgetDescriptors.length; i++) {
			let childItem = await buildTreeViewItemFromWidgetDescriptorAsync(widgetDescriptors[i], item);
			item.children.push(childItem);
		}
		// todo why won't this work? returns array of promises instead of resolved values.
		//item.children = await widgetDescriptors.map(async (wd) => {
		//	return await buildTreeViewItemFromWidgetDescriptorAsync(wd, item);
		//});
	}
	return item;
}
async function buildTreeViewItemFromWidgetDescriptorAsync(widgetDescriptor, parent) {
	let item = {
		uid: widgetDescriptor.widget.GetUid(),
		name: widgetDescriptor.widgetType + " widget: " + (widgetDescriptor.id ? widgetDescriptor.id : ""),
		what: "widget",
        widgetDescriptor: widgetDescriptor,
		parent: (parent ? parent : null),
	};
	let containerDescriptors = await widgetDescriptor.widget.ChildContainerDescriptorsAsync();
	if(containerDescriptors.length) {
		item.children = [];
		for(let i = 0; i < containerDescriptors.length; i++) {
			let childItem = await buildTreeViewItemFromContainerDescriptorAsync(containerDescriptors[i], item);
			item.children.push(childItem);
		}
	}
	return item;
}

function copyAndStripTreeItem(treeItem) {
	let newItem = {
		id: treeItem.uid,
		name: treeItem.name,
	};
	if(treeItem.children) {
		newItem.children = [];
		for(let i = 0; i < treeItem.children.length; i++)
			newItem.children.push(copyAndStripTreeItem(treeItem.children[i]));
	}
	return newItem;
}

//loadFromWidgetDataArray() {
//	//todo
//}

mainToolbar.On("command", UI.OtherEventsEnum.FreezeUi, async (ev) => {
	if(ev.data === "loadself") { // load widgets of the app into app...
		for(let i = 0; i < mainWindowDef.data.length; i++) {
			await rootContainer.AppendWidgetAsync(mainWindowDef.data[i]);
		}
		rebuildWidgetsTree();
		widgetsTree.SetState({selectedId: rootContainer.GetUid()});
        UI.FlushDomUpdates();
	}
	else if(ev.data === "readconfigform") { // read config form
        let formData = await readForm(tabs_configForm);
        //console.log("\n\nconfig form data = ", formData);

        formData = await readForm(tabs_dataForm);
        //console.log("\n\nconfig form data = ", formData);

        formData = await readForm(tabs_stateForm);
        //console.log("\n\nconfig form data = ", formData);
		
        formData = await readForm(tabs_layoutForm);
        //console.log("\n\nconfig form data = ", formData);
    }
    else if(ev.data === "run") {
        let widgets = (await rootContainerWidget.GetDataAsync());
        let winDef = {
            config: {
                title: "My app",
                icon: "Laptop",
                containerLayout: {},
            },
            data: widgets,
        };
        let appWin = await UI.NewWindowAsync(winDef);
        UI.FlushDomUpdates(); //todo don't require calling this?
        appWin.On("requestClose", UI.OtherEventsEnum.Cull, () => {
            appWin.Close();
        });
    }
    else if(ev.data === "showdef") {
        let widgets = (await rootContainerWidget.GetDataAsync());
        let defObj = {
            "config": {
                "title": "Generic window",
                "icon": "Camera",
                "containerLayout": {
                    "flexDirection": "column"
                }
            },
            "data": widgets,
            "events": ["minimize", "maximize", "close", "quit"]
        };
        let jsonText = JSON.stringify(defObj);
        let defWinDef = {
            config: {
                title: "Form definition",
                icon: "Info",
                containerLayout: {},
            },
            data: [
                {
                    widget: "uilabel",
                    config: {
                        height: "400px",
                        selectable: true,
                        whiteBg: true
                    },
                    data: {
                        text: jsonText,
                    },
                },
            ],
        };
        let defWin = await UI.NewWindowAsync(defWinDef);
        UI.FlushDomUpdates();
        defWin.On("requestClose", UI.OtherEventsEnum.Cull, () => {
            defWin.Close();
        });
    }
    else if(ev.data === "loaddef") {
        let loadDefWinDef = {
            config: {
                title: "Load form definition",
                icon: "Hardware",
                containerLayout: {}
            },
            data: [{"widget":"uilabel","data":{"text":"Paste window definition JSON here (must be valid JSON)"},"layout":{"border":["0","0","0","0"],"margin":["10px","10px","10px","10px"]}},{"widget":"textinput","config":{"id":"text","height":"200px"},"state":{"text":""},"data":{},"layout":{"border":["2","1","1","2"],"margin":["0","10px","10px","10px"]}},{"widget":"uibutton","config":{"id":"okBtn"},"data":{"text":"OK"}},{"widget":"uibutton","config":{"id":"cancelBtn"},"data":{"text":"Cancel"}}]
        };
//		console.log(JSON.stringify(loadDefWinDef));
        let loadDefWin = await UI.NewWindowAsync(loadDefWinDef);
        UI.FlushDomUpdates();
        loadDefWin.On("requestClose", UI.OtherEventsEnum.Cull, () => {
            loadDefWin.Close();
        });
		let okBtn = await loadDefWin.WidgetAsync("okBtn");
		okBtn.On("click", UI.OtherEventsEnum.FreezeUi, async () => {
			let textWidget = await loadDefWin.WidgetAsync("text");
			let text = (await textWidget.GetStateAsync()).text;
			let theJson = JSON.parse(text);
			rootContainer.Empty();
			if(!Array.isArray((theJson || {}).data))
				return;
			for(let i = 0; i < theJson.data.length; i++) {
				await rootContainer.AppendWidgetAsync(theJson.data[i]);
			}
			rebuildWidgetsTree();
			widgetsTree.SetState({selectedId: rootContainer.GetUid()});
            loadDefWin.Close();
            UI.FlushDomUpdates();
			
		});
		let cancelBtn = await loadDefWin.WidgetAsync("cancelBtn");
		cancelBtn.On("click", UI.OtherEventsEnum.Cull, () => {
            loadDefWin.Close();
		});
    }
	else if(ev.data === "moveWidget") {
		let selectedUid = parseInt((await widgetsTree.GetStateAsync()).selectedId);
        if(!selectedUid) // something else that is not a widget may be selected? or no selection
            return;
		let treeItem = getTreeItemFromUid(selectedUid);
		if(!treeItem || treeItem.what !== "widget")
			return;
		if(isNaN(selectedUid)) { // need to select a widget first...
			widgetToMove = null;
			mainToolbar.SetState({});
		}
		else
			widgetToMove = new WidgetHandle(selectedUid);
	}
	else if(ev.data === "moveWidgetOff") {
		if(!widgetToMove)
			return;
		// actually move the widget.
		// If selected container as target, move to first place in container.
		// If selected widget as target, move to directly after it.
		let selectedUid = parseInt((await widgetsTree.GetStateAsync()).selectedId);
		let targetTreeItem = getTreeItemFromUid(selectedUid);
		if(targetTreeItem.what === "widget") {
			let targetWidget = new WidgetHandle(selectedUid);
			widgetToMove.MoveBelow(targetWidget);
            UI.FlushDomUpdates();
			rebuildWidgetsTree();
		}
		else if(targetTreeItem.what === "container") {
			let targetContainer = new WidgetHandle(selectedUid);
			widgetToMove.MoveStartContainer(targetContainer);
            UI.FlushDomUpdates();
			rebuildWidgetsTree();
		}
		else {
			// maybe something else was selected... in that case, do nothing.
		}
		// clean up...
		widgetToMove = null;
	}
});

let widgetToMove = null;

addRemoveBtn.On("menuCommand", UI.OtherEventsEnum.FreezeUi, async (ev) => {
	let selectedWidgetName = (await widgetsDropdown.GetStateAsync()).selectedItemId;
	let selectedUid = parseInt((await widgetsTree.GetStateAsync()).selectedId);
    if(isNaN(selectedUid))
        return; // must have selected window properties or icons
	let treeItem = getTreeItemFromUid(selectedUid);
    let treeItemIndex = -1;
    if(treeItem.parent)
        treeItemIndex = treeItem.parent.children.indexOf(treeItem);
	let newWidget = null;
	let newTreeItem = null;
	let didRemoveWidget = false;
	if(ev.data === "addBefore" && treeItem.what === "widget") {
		// check if widget selected, if so, add widget before it, both in design view and tree view
		let widget = new WidgetHandle(selectedUid);
		newWidget = await widget.InsertWidgetBeforeAsync({ widget: selectedWidgetName });
		newTreeItem = { uid: newWidget.GetUid(), name: selectedWidgetName, what: "widget", parent: treeItem.parent, widgetDescriptor: await newWidget.GetDescriptorAsync(), };
		treeItem.parent.children.splice(treeItemIndex, 0, newTreeItem);
	}
	else if(ev.data === "addAfter" && treeItem.what === "widget") {
		// check if widget selected, if so, add widget after it, both in design view and tree view
		let widget = new WidgetHandle(selectedUid);
		newWidget = await widget.InsertWidgetAfterAsync({ widget: selectedWidgetName });
		newTreeItem = { uid: newWidget.GetUid(), name: selectedWidgetName, what: "widget", parent: treeItem.parent, widgetDescriptor: await newWidget.GetDescriptorAsync(), };
		treeItem.parent.children.splice(treeItemIndex + 1, 0, newTreeItem);
	}
	else if(ev.data === "addInside" && treeItem.what === "container") {
		// check if container is selected, if so, add widget inside it, both in design view and tree view
		treeItem.children = treeItem.children || [];
		let container = new ContainerHandle(selectedUid);
		newWidget = await container.AppendWidgetAsync({ widget: selectedWidgetName });
		newTreeItem = { uid: newWidget.GetUid(), name: selectedWidgetName, what: "widget", parent: treeItem, widgetDescriptor: await newWidget.GetDescriptorAsync(), };
		treeItem.children.push(newTreeItem);
	}
	else if(ev.data === "remove" && treeItem.what === "widget") {
		let widget = new WidgetHandle(selectedUid);
		widget.Remove();
		treeItem.parent.children.splice(treeItemIndex, 1);
		didRemoveWidget = true;
	}
	if(newWidget) {
		let containerDescriptors = await newWidget.ChildContainerDescriptorsAsync();
		newTreeItem.children = newTreeItem.children || [];
		containerDescriptors.forEach((cd) => {
			newTreeItem.children.push({
				uid: cd.container.GetUid(),
				name: cd.id + ": " + cd.name,
				what: "container",
			});
		});
	}
	if(newWidget || didRemoveWidget) {
        UI.FlushDomUpdates();
		await rebuildWidgetsTree();
		if(newWidget) // state is destroyed when altering treeview, need to set selected item again
			widgetsTree.SetState({selectedId: selectedUid});
		else // removed selected widget, select parent in treeview
			widgetsTree.SetState({selectedId: treeItem.parent.uid });
	}
});

async function rebuildWidgetsTree() {
    _updateWidgetsTreeRequired = false;
    treeData = await buildTreeViewItemFromContainerDescriptorAsync(rootContainerDescriptor);

    //let item = {
	//	uid: widgetDescriptor.widget.GetUid(),
	//	name: widgetDescriptor.widgetType + " widget: " + (widgetDescriptor.id ? widgetDescriptor.id : ""),
	//	what: "widget",
    //    widgetDescriptor: widgetDescriptor,
	//	parent: (parent ? parent : null),
	//};
    let windowPropsItem = {
        uid: "windowProps",
        id: "windowProps",
        name: "Window properties",
        //what: "windowProps",
        parent: null,
    };
    let iconsItem = {
        uid: "icons",
        id: "icons",
        name: "Icons",
        what: "icons",
        parent: null,
    };
    let widgetsTreeData = {
        items: [
            windowPropsItem,
            iconsItem,
            copyAndStripTreeItem(treeData),
        ],
    };
    widgetsTree.SetData(widgetsTreeData);
}

let tabs_configForm = null;
let tabs_dataForm = null;
let tabs_stateForm = null;
let tabs_layoutForm = null;
let tabs = await win.WidgetAsync("widgetOptionTabs");
const tabs_configContainer = await tabs.ChildContainerAsync("tab_config");
const tabs_dataContainer = await tabs.ChildContainerAsync("tab_data");
const tabs_stateContainer = await tabs.ChildContainerAsync("tab_state");
const tabs_layoutContainer = await tabs.ChildContainerAsync("tab_layout");
const tabs_eventsContainer = await tabs.ChildContainerAsync("tab_events");

widgetsTree.On("selected", UI.OtherEventsEnum.FreezeUi, async (ev) => {
    if(ev.data === "windowProps") {
        let form = {};
        let onFormChange = async () => {
            let formData = await readForm(form);
        };
        let initialData = {
            title: "My window",
            icon: "Laptop",
            resizable: true,
            initialSizeX: 600,
            initialSizeY: 500,
        };
        await constructFormAsync(WindowPropsFormDef, tabs_configContainer, "_", form, initialData, onFormChange);
        UI.FlushDomUpdates();
        tabs.SetState({ selectedTabId: "tab_config", });
        return;
    }
    else if(ev.data === "icons") {


        return;
    }
    let treeItem = getTreeItemFromUid(ev.data);
    let widgetType = null;
    let targetWidget = null;
    tabs_configContainer.Empty();
    tabs_dataContainer.Empty();
    tabs_stateContainer.Empty();
    tabs_layoutContainer.Empty();
    tabs_eventsContainer.Empty();
    if(treeItem.widgetDescriptor) {
        widgetType = treeItem.widgetDescriptor.widgetType;
        targetWidget = treeItem.widgetDescriptor.widget;
    }
    else {
        // probably selected a container...
        // todo - put label above data/config/state tabs and update it with what item is selected
        return;
    }

    tabs_configForm = {};
    tabs_dataForm = {};
    tabs_stateForm = {};
    tabs_layoutForm = {};

    let onConfigChange = async () => {
        let formData = await readForm(tabs_configForm);
        await targetWidget.SetConfigAsync(formData);
        if(_updateWidgetsTreeRequired)
            await rebuildWidgetsTree();
    };
    let onDataChange = async () => {
        let formData = await readForm(tabs_dataForm);
        await targetWidget.SetDataAsync(formData);
        if(_updateWidgetsTreeRequired)
            await rebuildWidgetsTree();
    };
    let onStateChange = async () => {
        let formData = await readForm(tabs_stateForm);
        await targetWidget.SetStateAsync(formData);
        if(_updateWidgetsTreeRequired)
            await rebuildWidgetsTree();
    };
    let onLayoutChange = async () => {
        let formData = await readForm(tabs_layoutForm);
        await targetWidget.SetLayoutAsync(formData);
        if(_updateWidgetsTreeRequired)
            await rebuildWidgetsTree();
    };
    let initialConfig = await targetWidget.GetConfigAsync();
    let initialData = await targetWidget.GetDataAsync();
    let initialState = await targetWidget.GetStateAsync();
    let initialLayout = await targetWidget.GetLayoutAsync();
    let widgetDef = WidgetDefs[widgetType];
	
	// shallow copy widgetDef.configDef, adding new "id" property at start of object
	let configDef = {
		id: {
			Label: "ID",
			Type: FieldTypeEnum.String,
			WidgetsTreeUpdateRequired: true,
		},
		...widgetDef.ConfigDef,
	};
	
	
	let layoutDef = _widgetLayoutObjectDef;
	//{
	//	layout: {
	//		Label: "Layout",
	//		Type: FieldTypeEnum.Object,
	//		ObjectDef: _widgetLayoutObjectDef,
	//	},
	//};
	
    await constructFormAsync(configDef, tabs_configContainer, "config:", tabs_configForm, initialConfig, onConfigChange);
    await constructFormAsync(widgetDef.DataDef, tabs_dataContainer, "data:", tabs_dataForm, initialData, onDataChange);
    await constructFormAsync(widgetDef.StateDef, tabs_stateContainer, "state:", tabs_stateForm, initialState, onStateChange);
    await constructFormAsync(layoutDef, tabs_layoutContainer, "layout:", tabs_layoutForm, initialLayout, onLayoutChange);
	
	let eventsLabel = {
		widget: "uilabel",
		config: {},
		data: { 
			text: "Available events:",
		},
		state: {},
		layout: {
			border: [0,0,0,0]
		},
	};
	await tabs_eventsContainer.AppendWidgetAsync(eventsLabel);
	let events = widgetDef.Events || [];
	for(let i = 0; i < events.length; i++) {
		let label = {
			widget: "uilabel",
			config: {
				whiteBg: true,
				selectable:true,
			},
			data: { 
				text: events[i],
			},
			state: {},
			layout: {
				border: [1,0,0,0]
			},
		};
		await tabs_eventsContainer.AppendWidgetAsync(label);
	}
	UI.FlushDomUpdates();
});

// fieldDef = object reference to field def (read only!)
// widget = widget handle
// form = {
//     field1: { fieldDef, widget }, // normal scalar
//     field2: { fieldDef, widget[] | object[] }
//     field3: { // object
//         field3_1: { fieldDef, widget },
//         field3_2: { fieldDef, widget },
//     }
// };
var _updateWidgetsTreeRequired = false;
async function readForm(form) {
    let data = {};
    for (const fieldName of Object.keys(form)) {
        let field = form[fieldName];

        // object scalar
        if(!field.fieldDef && !field.widget) {
			let objData = await readForm(field);
			function isEmpty(ob) {
				for(let i in ob)
					return false;
				return true;
			}
			if(!isEmpty(objData))
				data[fieldName] = objData;
            continue;
        }

		var fieldDef = field.fieldDef;
        if(fieldDef.WidgetsTreeUpdateRequired) //note - if this is defined on object definition: will skip (see above code block for object scalar).
            _updateWidgetsTreeRequired = true;

        var widget_ = field.widget;
        let widgets = [widget_];
        if(fieldDef.IsArray)
            widgets = widget_;
        let vals = [];

        for(let i = 0; i < widgets.length; i++) {
            let widget = widgets[i];
            let widgetState = {};
            if(fieldDef.Type === FieldTypeEnum.Object) {
                 vals.push(await readForm(widget));
                 continue;
            }
            widgetState = await widget.GetStateAsync() || {};
            switch(fieldDef.Type) {
                case FieldTypeEnum.Boolean: // checkbox
                    vals.push(widgetState.checked);
                    break;

                case FieldTypeEnum.String: // textinput
                    vals.push(widgetState.text);
                    break;

                case FieldTypeEnum.Number: // textinput
                    let num = null;
                    if((widgetState.text + "").length > 0)
                        num = +widgetState.text;
                    vals.push(num);
                    break;

                case FieldTypeEnum.Enum: // dropdown
                    vals.push(widgetState.selectedItemId);
                    break;
            }
        }
		
		function isDefault(val) {
			if(fieldDef.Default === undefined)
				return (val + "").length === 0;
            else
				return fieldDef.Default === val;
		}
		
        if(fieldDef.IsArray && vals.length) // only save array if it has values
		{
			if(!fieldDef.ArrayLength) // variable length array
				data[fieldName] = vals;
			else { // fixed length array
				// if all values are defaults, then don't save the array
				for(let i = 0; i < vals.length; i++) {
					if(!isDefault(vals[i])) {
						// at least one non-default array entry... so save array.
						data[fieldName] = vals;
						break;
					}
				}
			}
		}
        else if(vals.length) { // scalar
			if(!isDefault(vals[0]))
				data[fieldName] = vals[0];
        }
	}
    return data;
}

//todo make this function easier to understand
var nextWid = 0;
async function constructFormAsync(def, container, prefix, form, initialData, readAndApplyFormFunc) {
    if(!def)
        return null;
    if(!form)
        console.error("form needs to be object");
	prefix = prefix || "";

    for (const fieldName of Object.keys(def)) {
		let fieldDef = def[fieldName];
        let labelDef = {
            widget: "uilabel",
            config: { },
            data: { text: fieldDef.Label, },
			layout: { positionFlex: { basis: "100%", }, },
        };

		if(fieldDef.Type === FieldTypeEnum.Object && !fieldDef.IsArray) {
			await container.AppendWidgetAsync(labelDef);
			let objContId = "objcont_" + nextWid++; // needed?
			let subContainerWidget = await container.AppendWidgetAsync({
				widget: "container",
				config: {
					id: objContId, // needed?
					containerLayout: {
						//border: [2,2,2,2],
						padding: ["2px","2px","2px","2px"],
						flexDirection:"column",
					},
				},
				layout: {
					margin: ["0","0","0","20px"],
					border: [1,1,1,1],
				},
			});
            let subContainer = (await subContainerWidget.ChildContainersAsync())[0];
            let formObj = {};
            form[fieldName] = formObj;
			await constructFormAsync(fieldDef.ObjectDef, subContainer, prefix + fieldName + "__", formObj, initialData ? initialData[fieldName] : null, readAndApplyFormFunc);
			continue;
		}

		let rowContainerId = "row" + nextWid++;
        let rowContainerWidget = await container.AppendWidgetAsync({
			widget: "container",
			config: {
				containerLayout: {
					id: rowContainerId, //needed..?
					//border: [2,2,2,2],
					padding: ["2px","2px","2px","2px"],
					flexDirection:"row",
					flexAlignItems: "center",
				},
			},
			layout: {
				border:[2,0,0,0],
			},
		});
        let rowContainer = (await rowContainerWidget.ChildContainersAsync())[0]; //
        await rowContainer.AppendWidgetAsync(labelDef);
        let widgetDef = null;

        let arrayAddBtnId = null;
        let arrayItemsContainerId = null;
        let arrayItemsContainerDef = null;
        let arrayItemDef = null; // container definition
        let arrayItemWidgetDef = null; // item definition

        let initialVal = undefined;
        if(!fieldDef.IsArray) {
            if(initialData && initialData[fieldName] !== undefined)
                initialVal = initialData[fieldName];
            else if(fieldDef.Default !== undefined)
				initialVal = fieldDef.Default;
			else if(fieldDef.DefaultFunc)
				initialVal = fieldDef.DefaultFunc();
        }

		switch(fieldDef.Type) {
			case FieldTypeEnum.Boolean:
                widgetDef = {
                    widget: "uicheckbox",
                    config: {
						id: prefix + fieldName,
					},
                    data: {},
                    state: {},
                    layout: {},
                    events: ["change",],
                };
                if(initialVal !== undefined)
                    widgetDef.state.checked = initialVal;
                break;
			
			case FieldTypeEnum.String:
                widgetDef = {
                    widget: "textinput",
                    config: {
						id: prefix + fieldName,
					},
                    data: {},
                    state: {},
					layout: { positionFlex: { basis: "100%", }, },
                    events: ["change",],
                };
                if(initialVal !== undefined)
                    widgetDef.state.text = initialVal;
                break;
			
			case FieldTypeEnum.Number:
                widgetDef = {
                    widget: "textinput",
                    config: {
						id: prefix + fieldName,
					},
                    data: {},
                    state: {},
					layout: { positionFlex: { basis: "40px", },	},
                    events: ["change",],
                };
                if(initialVal !== undefined)
                    widgetDef.state.text = initialVal;
                break;
			
			case FieldTypeEnum.Enum:
                let options = [];
                Object.keys(fieldDef.EnumDef).forEach((ed) => {
                    options.push({
                        name: ed,
                        id: fieldDef.EnumDef[ed],
                    });
                });
                widgetDef = {
                    widget: "dropdown",
                    config: {
						id: prefix + fieldName,
					},
                    data: { items: options, },
                    state: {},
					layout: { positionFlex: { basis: "100%", },	},
                    events: ["change",],
                };
                if(initialVal !== undefined)
                    widgetDef.state.selectedItemId = initialVal;
                break;
        };

        if(fieldDef.IsArray) {
			if(!fieldDef.ArrayLength) { // resizable array
				arrayAddBtnId = "add_btn_" + nextWid++;
				widgetDef = {
					widget: "uibutton",
					config: {
						id: arrayAddBtnId,
						width: "40px",
						height: "100%",
					},
					data: {text:"+"},
					events: ["click"],
				};
			}
            arrayItemsContainerId = "arrayItemsContainer_" + nextWid++;
            arrayItemsContainerDef = {
                widget: "container",
                config: {
					id: arrayItemsContainerId,
                    containerLayout: {
                        border: [0,0,0,0],
                        padding: ["0","0","0","0"],
                        flexDirection:"column",
                    },
                },
                data: [],
				layout: {
					margin: ["0","0","0","0"],
					border:[0,0,0,0],
				},
            };
            arrayItemDef = {
                widget: "container",
                config: {
                    containerLayout: {
                        border: [0,0,0,0],
                        padding: ["0","0","0","0"],
                        flexDirection:"row",
                    },
                },
                data: fieldDef.ArrayLength
					? [] // fixed size, no need for delete button
					: [{
						widget: "uibutton",
						config: {
							width: "30px",
							height: "100%",
						},
						data: {text:"^"},
						events: ["click"]
					},{
						widget: "uibutton",
						config: {
							width: "30px",
							height: "100%",
						},
						data: {text:"v"},
						events: ["click"]
					},{
						widget: "uibutton",
						config: {
							width: "30px",
							height: "100%",
						},
						data: {text:"-"},
						events: ["click"]
					},],
				layout: {
					margin: ["0","0","0","0"],
					border:[0,0,0,0],
				},
            };
            switch(fieldDef.Type) { //todo can we reuse the widgetDef from above (non-array)?
                case FieldTypeEnum.Boolean:
                    arrayItemWidgetDef = {
                        widget:"uicheckbox",
						config: {
							id:"arr_item_" + nextWid++,
						},
                        data: {},
                        state: {},
                        events: ["change",],
                    }
                    break;
                case FieldTypeEnum.String:
                    arrayItemWidgetDef = {
                        widget: "textinput",
                        config: {
							id: "arr_item_" + nextWid++,
						},
                        data: {},
                        state: {},
						layout: { positionFlex: { basis: "80%", }, },
                        events: ["change",],
                    };
                    break;
                case FieldTypeEnum.Number:
                    arrayItemWidgetDef = {
                        widget: "textinput",
                        config: {
							id: "arr_item_" + nextWid++,
						},
                        data: {},
                        state: {},
						layout: { positionFlex: { basis: "80%", }, },
                        events: ["change",],
                    };
                    break;
                case FieldTypeEnum.Enum:
                    let options = [];
                    Object.keys(fieldDef.EnumDef).forEach((ed) => {
                        options.push({
                            name: ed,
                            id: fieldDef.EnumDef[ed],
                        });
                    });
                    arrayItemWidgetDef = {
                        widget: "dropdown",
                        config: {
							id: "arr_item_" + nextWid++,
						},
                        data: { items: options, },
                        state: {},
						layout: { positionFlex: { basis: "100%", },	},
                        events: ["change",],
                    };
                    break;
                case FieldTypeEnum.Object:
                    arrayItemWidgetDef = {
                        widget: "container",
                        config: {
							id: "arr_item_" + nextWid++,
						},
                        data: {},
                        state: {},
						layout: { positionFlex: { basis: "80%", }, },
                    };
                    break;

            }
            if(arrayItemWidgetDef)
                arrayItemDef.data.unshift(arrayItemWidgetDef); // put first in item container (to keep delete button last)
        }
        if(!widgetDef)
            continue;
		
		let widget = null;
		if(!fieldDef.IsArray || !fieldDef.ArrayLength) // add input widget to end of row container. (If array, widget = add button - don't want this for fixed size arrays.)
			widget = await rowContainer.AppendWidgetAsync(widgetDef);
        if(!fieldDef.IsArray) { // scalar
            widget.On("change", UI.OtherEventsEnum.FreezeUi, async (ev) => {
                if(readAndApplyFormFunc)
                    await readAndApplyFormFunc();
                UI.FlushDomUpdates();
            });
            form[fieldName] = { fieldDef: fieldDef, widget: widget };
        }
        else { // array
            form[fieldName] = { fieldDef: fieldDef, widget: [] };

            await container.AppendWidgetAsync(arrayItemsContainerDef);
            let itemsContainerWidget = await win.WidgetAsync(arrayItemsContainerId);
            let itemsContainer = (await itemsContainerWidget.ChildContainersAsync())[0]; //

            let addFunc = async (data) => {
                // arrayItemDef = item container def
                // arrayItemWidgetDef = actual text/dropdown/checkbox widget (or object container, if object array)

                // populate array item with initial data provided
                if((data !== undefined || fieldDef.Default !== undefined) && !fieldDef.Type !== FieldTypeEnum.Object) {
                    if(data === undefined)
                        data = fieldDef.Default;
                    switch(fieldDef.Type) {
                        case FieldTypeEnum.Boolean:
                            arrayItemWidgetDef.state.checked = data;
                            break;
                        case FieldTypeEnum.String:
                            arrayItemWidgetDef.state.text = data;
                            break;
                        case FieldTypeEnum.Number:
                            arrayItemWidgetDef.state.text = data + "";
                            break;
                        case FieldTypeEnum.Enum:
                            arrayItemWidgetDef.state.selectedItemId = data;
                            break;
                    }
                }

                // append new array item to array container
                let arrayItemId = "arrayItem_" + nextWid++;
                arrayItemDef.config.id = arrayItemId;
				let delBtnId = null;
				let upBtnId = null;
				let downBtnId = null;
				if(!fieldDef.ArrayLength) { // resizable array
					delBtnId = "arrayItemDelBtn_" + nextWid++;
					arrayItemDef.data[arrayItemDef.data.length - 1].config.id = delBtnId;
					upBtnId = "up" + nextWid++;
					arrayItemDef.data[arrayItemDef.data.length - 3].config.id = upBtnId;
					downBtnId = "down" + nextWid++;
					arrayItemDef.data[arrayItemDef.data.length - 2].config.id = downBtnId;
				}
                await itemsContainer.AppendWidgetAsync(arrayItemDef);
                let itemWidget = await win.WidgetAsync(arrayItemId);
				
				if(!fieldDef.ArrayLength) { // resizable array... set up move up / move down / remove buttons:
				
					let delBtnWidget = await win.WidgetAsync(delBtnId);
					delBtnWidget.On("click", UI.OtherEventsEnum.FreezeUi, async (ev) => {
						// remove from on screen
						itemWidget.Remove();
						
						// remove widget or subform from the constructed form object
						let obj = fieldDef.Type === FieldTypeEnum.Object ? formObj : valueWidget;
						let itemIdx = form[fieldName].widget.indexOf(obj);
						form[fieldName].widget.splice(itemIdx, 1);
						
						if(readAndApplyFormFunc)
							await readAndApplyFormFunc();
                        UI.FlushDomUpdates();
					});
					
					(await win.WidgetAsync(upBtnId)).On("click", UI.OtherEventsEnum.FreezeUi, async (ev) => {
						let currentArrayItems = await itemsContainer.GetWidgetsAsync();
						let myIndex = currentArrayItems.findIndex((item) => item.GetUid() === itemWidget.GetUid());
						if(myIndex === 0) // can't move up, item is already at start of array
							return;
						
						// change places on screen
						let widgetAboveMe = currentArrayItems[myIndex - 1];
						itemWidget.MoveAbove(widgetAboveMe);
						
						// change places in form object
						let obj = fieldDef.Type === FieldTypeEnum.Object ? formObj : valueWidget;
						//let itemIdx = form[fieldName].widget.indexOf(obj);
						//if(myIndex !== itemIdx)
						//	console.error("this is very bad?"); // todo - if this never triggers, can just use myIndex
                        let itemIdx = myIndex;
						let temp = form[fieldName].widget[itemIdx];
						form[fieldName].widget[itemIdx] = form[fieldName].widget[itemIdx - 1];
						form[fieldName].widget[itemIdx - 1] = temp;

						if(readAndApplyFormFunc)
							await readAndApplyFormFunc();
						UI.FlushDomUpdates();
						
					});
					
					(await win.WidgetAsync(downBtnId)).On("click", UI.OtherEventsEnum.FreezeUi, async (ev) => {
						let currentArrayItems = await itemsContainer.GetWidgetsAsync();
						let myIndex = currentArrayItems.findIndex((item) => item.GetUid() === itemWidget.GetUid());
						if(myIndex === currentArrayItems.length - 1) // can't move down, item is already at end of array
							return;
						
						// change places on screen
						let widgetBelowMe = currentArrayItems[myIndex + 1];
						itemWidget.MoveBelow(widgetBelowMe);
						
						// change places in form object
						let obj = fieldDef.Type === FieldTypeEnum.Object ? formObj : valueWidget;
						//let itemIdx = form[fieldName].widget.indexOf(obj);
						//if(myIndex !== itemIdx)
						//	console.error("this is very bad?"); // todo - if this never triggers, can just use myIndex
                        let itemIdx = myIndex;
						let temp = form[fieldName].widget[itemIdx];
						form[fieldName].widget[itemIdx] = form[fieldName].widget[itemIdx + 1];
						form[fieldName].widget[itemIdx + 1] = temp;

						if(readAndApplyFormFunc)
							await readAndApplyFormFunc();
						UI.FlushDomUpdates();
					});
					
				}
                let itemWidgetContainerHandle = (await itemWidget.ChildContainersAsync())[0];
                let valueWidget = (await itemWidgetContainerHandle.GetWidgetsAsync())[0];
                let formObj = {};
                if(fieldDef.Type !== FieldTypeEnum.Object) {
                    valueWidget.On("change", UI.OtherEventsEnum.FreezeUi, async (ev) => {
                        if(readAndApplyFormFunc)
                            await readAndApplyFormFunc();
                    });
                    form[fieldName].widget.push(valueWidget);
                }
                else { // object...
                    let objContainer = (await valueWidget.ChildContainersAsync())[0];
                    await constructFormAsync(fieldDef.ObjectDef || fieldDef.GetObjectDef(), objContainer, prefix + fieldName + "__", formObj, data, readAndApplyFormFunc);
                    form[fieldName].widget.push(formObj);
                }
                arrayItemDef.data[0].state = {};
            };// addFunc()

            if(fieldDef.ArrayLength) { // fixed length array
                for(let i = 0; i < fieldDef.ArrayLength; i++) {
                    let arrayItem = undefined;
                    if(initialData && Array.isArray(initialData[fieldName]) && i < initialData[fieldName].length)
                        arrayItem = initialData[fieldName][i];
                    await addFunc(arrayItem);
                }
            }
            else if(initialData && Array.isArray(initialData[fieldName])) {
                for(let i = 0; i < initialData[fieldName].length; i++)
                    await addFunc(initialData[fieldName][i]);
            }
			if(!fieldDef.ArrayLength) { // resizable array
				let addBtn = await win.WidgetAsync(arrayAddBtnId);
				addBtn.On("click", UI.OtherEventsEnum.FreezeUi, async (ev) => {
					if(fieldDef.ArrayLength)
						return;
					await addFunc();
					if(readAndApplyFormFunc)
						await readAndApplyFormFunc();
                    UI.FlushDomUpdates();
				});
			}
        }
	}
	return form;
}
