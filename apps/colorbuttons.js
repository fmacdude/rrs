
import { UI, WindowHandle, ContainerHandle, WidgetHandle } from './workerlib.js';

let winDef = {
    id:"win1",
	config: {
		title: "Color buttons",
		icon: "Color",
		containerLayout: {
			//border: [1,1,1,1],
			//paddingPx: [20,20,20,20],
			//flexDirection: "column", // column is default....

            /*position:'absolute';
                    top:0;
                    bottom:0;
                    left:0;
                    right:0;*/
		},
	},
	data: { items: [
        {
            widget: "iconview",
            id: "the_icons",
            config: {
                orientation:"row",
                layout: {
                    border: [2,1,1,2],
                    marginPx: [10,10,10,10],
                },
                contextMenu:[
                    {
                        "icon": "Mail",
                        "name": "New",
                        "command": "new",
                    },
                    {
                        "icon": "Camera",
                        "name": "Refresh",
                        "command": "refresh",
                    },
                ],
                itemContextMenu:[
                    {
                        "icon": "Add",
                        "name": "Open",
                        "command": "open",
                    },
                    {
                        "icon": "Mic",
                        "name": "Delete",
                        "command": "delete",
                    },
                ],
                multipleItemsContextMenu:[
                    {
                        "icon": "Folder",
                        "name": "Open all",
                        "command": "openall",
                    },
                    {
                        "icon": "Laptop",
                        "name": "Zip",
                        "command": "zip",
                    },
                    {
                        "icon": "Trash",
                        "name": "Delete all",
                        "command": "deleteall",
                    },
                ],
            },
            data: [
                {id: "floppies", icon:"SaveAll", label: "Floppies"},
                {id: "question", icon: "Question", label: "Ask question"},
                {id: "get_software", icon: "Setup", label: "Get software"},
                {id: "warning", icon: "Warning", label: "Warnings"},
                {id: "info", icon: "Info", label: "Information center for PC settings and help"},

                {id: "floppies", icon:"SaveAll", label: "Floppies"},
                {id: "question", icon: "Question", label: "Ask question"},
                {id: "get_software", icon: "Setup", label: "Get software"},
                {id: "warning", icon: "Warning", label: "Warnings"},
                {id: "info", icon: "Info", label: "Information center for PC settings and help"},
                {id: "floppies", icon:"SaveAll", label: "Floppies"},
                {id: "question", icon: "Question", label: "Ask question"},
                {id: "get_software", icon: "Setup", label: "Get software"},
                {id: "warning", icon: "Warning", label: "Warnings"},
                {id: "info", icon: "Info", label: "Information center for PC settings and help"},
            ],
            events: ["contextMenuCommand", "itemContextMenuCommand", "selectionChanged", "open"],
        },
	], },
	events: ["minimize", "maximize", "close", "quit"]
}
let containerDef = {
	widget:"container",
	config: {
		layout: {
			border: [1,1,1,1],
			marginPx: [10,10,10,10],
		},
		containerLayout: {
			border: [2,2,2,2],
			paddingPx: [10,10,10,10],
		},
	},
	data: [
		{ widget: "uilabel", id: "lbl", data: { text: "LABEL", }, },
	],
};
let dropdownDef = {
	widget:"dropdown",
	id: "widgets_dropdown",
	config: {
		layout: {
			border: [2,0,1,2],
			marginPx: [0,0,0,0],
			positionFlex: {
				basis: "",
			}
		}
	},
	data: {items: [
		{ name: "Menu bar",  id: "menubar" },
		{ name: "Toolbar", id: "toolbar" },
		{ name: "Tabs", id: "tabs" },
		{ name: "Split pane", id: "splitpane" },
		{ name: "List view", id: "listview" },
		{ name: "Dropdown", id: "dropdown" },
		{ name: "Container", id: "container" },
		{ name: "Label", id: "uilabel" },
		{ name: "Text input",   id: "textinput" },
		{ name: "Checkbox", id: "uicheckbox" },
		{ name: "Button", id: "uibutton" },
		{ name: "Color buttons", id: "colorbuttons" },
	], },
	events: ["select",],
};
let buttonDef = {
	widget: "uibutton",
	id: "add_remove_btn",
	config: {
		mode: "normal",
		width: "40px",
		height: "40px",
	},
	data: {text: "+"},
	events: ["command", "toggleOn", "toggleOff"],
};
let tabsDef = {
	widget: "tabs",
	id: "tabs_id",
	config: {
		initialTabId: "tab_config",
		layout: {
			positionFlex: {
				basis: "100%",
				minWidth:0,
			},
			marginPx: [0,0,0,0],
		}
	},
	data: [
		{
			name: "Layout",
			id: "tab_layout",
			contents: [buttonDef,buttonDef,buttonDef],
		},
		{
			name: "Config",
			id: "tab_config",
			containerLayout: {
				border: [1,0,0,0],
				paddingPx: [0,0,0,0],
				overflowX: "auto",
				overflowY: "auto",
				flexDirection:"cloumn",
			},
			contents: [dropdownDef,dropdownDef,dropdownDef],
		},
		{
			name: "Data",
			id: "tab_data",
			contents: [containerDef,containerDef,containerDef],
		},
		{
			name: "State",
			id: "tab_state",
			contents: [],
		},
		
	],
	events: ["select"]
};

let win = await UI.NewWindowAsync(winDef);
console.log("colorbuttons...");
//let winContainer = await win.ContainerAsync();
let iconview = await win.WidgetAsync("the_icons");
console.log("iconview", iconview);
iconview.On("selectionChanged", async (ev) => {
    let selectedIds = ev.data;
    console.log("selection changed, currently selected IDs = ", selectedIds);
});

/*
let button1 = await winContainer.AppendWidgetAsync(buttonDef);
let dropdown1 = await winContainer.AppendWidgetAsync(dropdownDef);
let button2 = await winContainer.AppendWidgetAsync(buttonDef);
let container1 = await button2.InsertWidgetBeforeAsync(containerDef);
let container1_container = await container1.ChildContainerAsync();

// not removed
buttonDef.id = "b1";
let container1_button1 = await container1_container.PrependWidgetAsync(buttonDef);

buttonDef.id = "b2";
let container1_button2 = await container1_container.PrependWidgetAsync(buttonDef);

// not removed
buttonDef.id = "b3";
let container1_button3 = await container1_container.AppendWidgetAsync(buttonDef);

let container1_label = await win.WidgetAsync("lbl");
dropdownDef.id = "dd1";
let container1_dropdown1 = await container1_label.InsertWidgetAfterAsync(dropdownDef);
dropdownDef.id = "dd2";
let container1_dropdown2 = await container1_label.InsertWidgetAfterAsync(dropdownDef);

// not removed
dropdownDef.id = "dd3";
let container1_dropdown3 = await container1_label.InsertWidgetAfterAsync(dropdownDef);

console.log("container1", container1);
await container1.Remove();

container1 = await button2.InsertWidgetBeforeAsync(containerDef);
let conts = await container1.ChildContainersAsync();
console.log("conts", conts);
conts[0].AppendWidgetAsync(buttonDef);

let contsDescs = await container1.ChildContainerDescriptorsAsync();
console.log("contsDescs", contsDescs);

let tabs = await conts[0].AppendWidgetAsync(tabsDef);
let tabsContsDescs = await tabs.ChildContainerDescriptorsAsync();
console.log("tabsContsDescs", tabsContsDescs);
let tabbtn = await tabsContsDescs[1].container.AppendWidgetAsync(buttonDef);

let tabDataContainer = await tabs.ChildContainerAsync("tab_data");
let tabDataDropdown = await tabDataContainer.AppendWidgetAsync(dropdownDef);

let tconts = await tabs.ChildContainersAsync();
console.log("tconts", tconts);

let contOfTabs = await tabs.ParentContainerAsync();
contOfTabs.Empty();

let ddn = await contOfTabs.AppendWidgetAsync(dropdownDef);
ddn.SetConfig({
	layout: {
		border:[1,1,1,1],
		marginPx:[30,30,30,30],
	}
});
ddn.SetData([
	{ name: "OPTION 1", id: "opt1", },
	{ name: "OPTION 2", id: "opt2", },
	{ name: "OPTION 3", id: "opt3", },
]);
ddn.SetState({ selectedItemId: "opt3", });

let config = await ddn.GetConfigAsync();
let data = await ddn.GetDataAsync();
let state = await ddn.GetStateAsync();
console.log("config", config, "data", data, "state", state);


let btnn = await contOfTabs.PrependWidgetAsync(buttonDef);

btnn.SetConfig({mode:"toggle"});
btnn.On("toggleOn", (ev) => {
	console.log("btn toggle on", ev);
});
btnn.On("toggleOff", (ev) => {
	console.log("btn toggle off", ev);
});


//let cont1_widget = await cb1.InsertWidgetBeforeAsync(dd_cont);
//console.log("aa");
//let cont1_cont = await cont1_widget.ChildContainerAsync();
//console.log("bb");
//console.log("cont1_cont", cont1_cont);
//
//let cont2_widget = await cont1_cont.PrependWidgetAsync(dd_cont);
//
//var btns = [];
//for(var i = 0; i < 10; i++) {
//	btns.push(await );
//}
*/
