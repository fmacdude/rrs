import { OS } from './workerlib.js';

var win1 = {
	id: "win1",
	config: {
		title: "Calculator",
		icon: "Folder",
		containerLayout: {
			//border: [1,1,1,1],
			//paddingPx: [20,20,20,20],
			//flexDirection: "column", // column is default....
		},
	},
	data: [
		{
			widget: "menubar",
			id: "mbar1",
			config: {
				//  widgetLayout: {
				//    border: [0|1|2, 0|1|2, 0|1|2, 0|1|2]
				//    positionAbsolutePx: {left, top, right, bottom, width, height}
				//	  positionFlex: {basis, grow, shrink, minWidth/height, maxWidth/height, alignSelf}
				//    marginPx: [top, right, bottom, left]
				//	}
				layout: {
					//border:[0,0,2,0]
				}
			},
			data: [
			  {
				"id": "filemenu",
				"visible": true,
				"name": "File",
				"children": [
				  {
					"visible": false,
					"id": "abc",
					"name": "-New",
					"command": "new",
					"shortcut": "Ctrl + N",
					"enabled": false,
					"leftText": "*"
				  },
				  {
					"id": 1,
					"name": "Open",
					"command": "new",
					"shortcut": "Ctrl + N",
					"enabled": false,
					"leftText": "*"
				  },
				  {
					"name": "Save",
					"command": "new",
					"shortcut": "Ctrl + N",
					"enabled": true,
					"leftText": "*",
					"icon": "Network"
				  }
				]
			  },
			  {
				"name": "Edit",
				"children": [
				  {
					"name": "Cut",
					"command": "cut",
					"shortcut": "Ctrl + x",
					"enabled": true,
					"leftText": "",
					"icon": "Mouse"
				  },
				  {
					"separator": true
				  },
				  {
					"name": "Copy",
					"command": "copy",
					"shortcut": "Ctrl + v",
					"enabled": true,
					"leftText": ""
				  },
				]
			  },
			  {
				"name": "Tools",
				"children": [
				  {
					"name": "Options window",
					"command": "optswin",
					"shortcut": "Ctrl + O",
					"enabled": true,
					"leftText": ""
				  },
				  {
					"name": "Encoding",
					"command": "encoding",
					"shortcut": "",
					"enabled": true,
					"leftText": ""
				  },
				  {
					"name": "Settings",
					"children": [
					  {
						"name": "Theme options",
						"command": "themeoptions",
						"shortcut": "",
						"enabled": true,
						"leftText": ""
					  },
					  {
						"name": "Performance mode",
						"command": "perfmode",
						"shortcut": "Winkey+P",
						"enabled": true,
						"leftText": ""
					  }
					]
				  }
				]
			  }
			],
			events: ["command"]
		},
		{
			widget: "toolbar",
			id: "main_toolbar",
			config: {
				layout: {
					border: [0,0,0,0]
				},
				iconSize: "small",
				textPosition: "beside",
				overflowMode: "wrap",
				contextMenu: [
					{ name: "Large icons", command: "largeIcons" },
					{ name: "Small icons", command: "smallIcons" },
					{separator: true},
					{ name: "Text beside icons", command: "textBeside" },
					{ name: "Text under icons", command: "textUnder" },
					{ name: "No text", command: "textNone" },
				]
			},
			data: [
				{separator: true},
				{name: "New", 	command: "new", icon: "Mail", toggleOffCommand: "newOff", disabled: false, id: "t1", },
				{name: "Open",	command: "open", icon: "Save",  menu: [
					{
						"icon": "Folder",
						"id": "abc",
						"name": "-New",
						"command": "newX",
						"shortcut": "Ctrl + N",
						"enabled": false,
						"leftText": "*"
					},
					{
						"id": 1,
						"name": "Open",
						"command": "newY",
						"shortcut": "Ctrl + N",
						"enabled": true,
						"leftText": "*"
					},
					{
						"name": "Save",
						"command": "newZ",
						"shortcut": "Ctrl + N",
						"enabled": true,
						"leftText": "*",
						"icon": "Network"
					}
				]  },
				{name: "Save", 	command: "save", icon: "Search", disabled: true, },
				{separator: true},
				{name: "Save", 	command: "save", icon: "Search" },
				{name: "Print", command: "print", icon: "Refresh", toggleOffCommand: "printOff"  },
				{name: "Copy", command: "copy", icon: "User", disabled: true, menu: [
					{
						"icon": "Folder",
						"id": "abc",
						"name": "-New",
						"command": "newX",
						"shortcut": "Ctrl + N",
						"enabled": false,
						"leftText": "*"
					},
					{
						"id": 1,
						"name": "Open",
						"command": "newY",
						"shortcut": "Ctrl + N",
						"enabled": true,
						"leftText": "*"
					},
					{
						"name": "Save",
						"command": "newZ",
						"shortcut": "Ctrl + N",
						"enabled": true,
						"leftText": "*",
						"icon": "Network"
					}
				] },
				{separator: true},
				{name: "Paste", command: "paste", icon: "Camera" },
				{name: "Settings", command: "settings", icon: "Lock", toggleOffCommand: "settingsOff", id: "s1" },
			],
			state: {
				pressedToggleButtonIds: ["t1", "s1"],
			},
			events: ["command", "contextMenuCommand"]
		},
		{
			widget: "splitpane",
			id: "splitpane1",
			
			config: {
				layout: {
					
				},
				//  containerLayout: {
				//    border: [0|1|2, 0|1|2, 0|1|2, 0|1|2]
				//	  flexDirection: row|column
				//    paddingPx: [top, right, bottom, left]
				//	  overflowX: clip|scroll|auto
				//	  overflowY: clip|scroll|auto
				//	}
				pane1ContainerLayout: {
					border: [0,0,0,0],
					flexDirection:"column",
					overflowX: "auto",
					overflowY: "clip"
				},
				pane2ContainerLayout: {
					border: [2,1,1,0],
					paddingPx: [20,20,20,20],
					overflowY: "scroll",
					flexDirection:"row",
				},
				//visible: true,
				pxMode: true,
				focusLeftPane: true,
				width: 250,
				//row: false,
				//separatorWidth: 50,
				snapOriginal: true,
				snapClose: false,
				snapOpen: true,
				//snapZoneWidth: 10,
				minWidth: 0,
				//maxWidth: 50
			},
			data: {
				pane1: [
					{
						widget:"textinput",
						id:"ti1",
						config: {
							layout: {
								border:[2,1,1,2],
							}
						},
						data:{},
						events:[],
					},
					{
						widget:"dropdown",
						id: "pane1_dropdown2",
						config: {
							layout: {
								border: [2,0,1,2],
								marginPx: [0,0,0,0],
							}
						},
						data: [
							{ name: "Apple",  id: "apple" },
							{ name: "Orange", id: "orange" },
							{ name: "Pear",   id: "pear" },
							{ name: "Banana", id: "banana" },
							{ name: "Tarap",  id: "tarap" },
						],
						events: ["select",],
					},
					{
						widget:"container",
						id:"dd_cont",
						config: {
							layout: {
								marginPx: [0,0,0,0],
								border:[0,0,0,0],
							},
							containerLayout: {
								border: [0,0,0,0],
								paddingPx: [0,0,0,0],
								//overflowY: "scroll",
								flexDirection:"row",
							},
						},
						data: [
						{
							widget: "uibutton",
							id: "dd_cont_btn",
							config: {
								mode: "menu",
								width: "40px",
								height: "100%",
								menuData: [
									{
										"icon": "Folder",
										"id": "abc",
										"name": "-New",
										"command": "newX",
										"shortcut": "Ctrl + N",
										"enabled": true,
										"leftText": "*"
									},
									{
										"id": 1,
										"name": "Open",
										"command": "newY",
										"shortcut": "Ctrl + N",
										"enabled": true,
										"leftText": "*"
									},
									{
										"name": "Save",
										"command": "newZ",
										"shortcut": "Ctrl + N",
										"enabled": true,
										"leftText": "*",
										"icon": "Network"
									}
								]
							},
							data: {text:"Go"},
							events: ["menuCommand"]
						},
						{
							widget:"dropdown",
							id: "pane1_dropdown",
							config: {
								layout: {
									border: [2,0,1,2],
									marginPx: [0,0,0,0],
									positionFlex: {
										basis: "100%",
									}
								}
							},
							data: [
								{ name: "Apple",  id: "apple" },
								{ name: "Orange", id: "orange" },
								{ name: "Pear",   id: "pear" },
								{ name: "Banana", id: "banana" },
								{ name: "Tarap",  id: "tarap" },
							],
							events: ["select",],
						},],
					},
					{
						widget: "treeview",
						id: "pane1_treeview",
						config: {
							layout: {
								border: [2,0,1,2],
								positionFlex: {basis: "100%",},
							}
						},
						data: [
							{name: "Junk", 	id: "junk", children: [
								{name: "Cake", id: "cake",},
								{name: "Cookies", id: "cookies", children: [
									{name: "Anzac", id: "anzac"},
								]},
								{name: "Candy", id: "candy"}
							]},
							{name: "Veges",	id: "veges"},
							{name: "Fruit", id: "fruit"},
						],
						state: {
							selectedId: "anzac",
						},
						events: ["selected"]
					},
					{
						widget: "toolbar",
						id: "bottom_toolbar",
						config: {
							layout: {
								border: [0,0,0,0],
								marginPx: [0,0,0,0],
							},
							iconSize: "small",
							textPosition: "beside",
							overflowMode: "wrap",
							orientation: "horizontal",
							contextMenu: [
								{ name: "Large icons", command: "largeIcons" },
								{ name: "Small icons", command: "smallIcons" },
								{separator: true},
								{ name: "Text beside icons", command: "textBeside" },
								{ name: "Text under icons", command: "textUnder" },
								{ name: "No text", command: "textNone" },
							]
						},
						data: [
							{name: "New", 	command: "new", icon: "Pc" },
							{name: "Open",	command: "open", icon: "Hdd" },
							{name: "Save", 	command: "save", icon: "Mouse" },
							{name: "Save", 	command: "save", icon: "Keyboard" },
							{name: "Copy", command: "copy", icon: "Monitor" },
							{name: "Paste", command: "paste", icon: "AppearanceSettings" },
							{name: "Settings", command: "settings", icon: "Users" },
						],
						events: ["command", "contextMenuCommand"]
					},
					{
						widget: "listview",
						id: "pane1_listview",
						config: {
							layout: {
								positionFlex: {
									basis:"100%",
								},
								border: [2,0,1,2],
							}
						},
						data:[
							{ name: "Soccer", id: "soccer" },
							{ name: "Cricket", id: "cricket" },
							{ name: "Basketball", id: "basketball" },
							{ name: "Rowing", id: "rowing" },
							{ name: "Darts", id: "darts" },
						],
						events:["select"],
						
					},
				],
				pane2: [
					{
						widget: "toolbar",
						id: "pane2_toolbar",
						config: {
							layout: {
								border: [1,2,2,1],
								positionFlex: {
									basis: "",
								}
							},
							overflowMode: "wrap",
							orientation: "vertical",
							iconSize: "large",
							textPosition: "none",
							contextMenu: [
								{ name: "Large icons", command: "largeIcons" },
								{ name: "Small icons", command: "smallIcons" },
								{separator: true},
								{ name: "Text beside icons", command: "textBeside" },
								{ name: "Text under icons", command: "textUnder" },
								{ name: "No text", command: "textNone" },
							]
						},
						data: [
							{name: "New", 	command: "new", icon: "Mail", toggleOffCommand: "newOff", disabled: true },
							{name: "Open all the mail",	command: "open", icon: "Save",  menu: [
								{
									"icon": "Folder",
									"id": "abc",
									"name": "-New",
									"command": "newX",
									"shortcut": "Ctrl + N",
									"enabled": false,
									"leftText": "*"
								},
								{
									"id": 1,
									"name": "Open",
									"command": "newY",
									"shortcut": "Ctrl + N",
									"enabled": true,
									"leftText": "*"
								},
								{
									"name": "Save",
									"command": "newZ",
									"shortcut": "Ctrl + N",
									"enabled": true,
									"leftText": "*",
									"icon": "Network"
								}
							]  },
							{name: "Save", 	command: "save", icon: "Search", disabled: true, },
							{separator: true},
							{name: "Save", 	command: "save", icon: "Search" },
							{name: "Print", command: "print", icon: "Refresh", toggleOffCommand: "printOff"  },
							{name: "Copy", command: "copy", icon: "User", disabled: true, menu: [
								{
									"icon": "Folder",
									"id": "abc",
									"name": "-New",
									"command": "newX",
									"shortcut": "Ctrl + N",
									"enabled": false,
									"leftText": "*"
								},
								{
									"id": 1,
									"name": "Open",
									"command": "newY",
									"shortcut": "Ctrl + N",
									"enabled": true,
									"leftText": "*"
								},
								{
									"name": "Save",
									"command": "newZ",
									"shortcut": "Ctrl + N",
									"enabled": true,
									"leftText": "*",
									"icon": "Network"
								}
							] },
							{separator: true},
							{name: "Paste", command: "paste", icon: "Camera" },
							{name: "Settings", command: "settings", icon: "Lock" },
						],
						events: ["command", "contextMenuCommand"]
					},
					{
						widget: "tabs",
						id: "tabs1",
						config: {
							initialTabId: "tab1",
							layout: {
								positionFlex: {
									basis: "100%",
									minWidth:0,
								},
								marginPx: [0,0,0,20],
							}
						},
						data: [
							{
								title: "1. RAM",
								id: "tab1",
								contents: [
									{
										widget: "toolbar",
										id: "tab1_toolbar",
										config: {
											overflowMode: "menu",
											textPosition: "beside",
										},
										data: [
											{separator:true,},
											{name: "New3", 	command: "new3"},
											{name: "Open3",	command: "open3"},
											{name: "Save3", command: "save3"},
											{name: "Print", command: "print", icon: "Refresh" },
											{name: "Copy", command: "copy", icon: "User" },
											{name: "Paste", command: "paste", icon: "Camera" },
											{name: "Settings", command: "settings", icon: "Lock" },
											{name: "New", 	command: "new", icon: "Mail" },
											{name: "Open",	command: "open", icon: "Save" },
											{name: "Copy", command: "copy", icon: "User" },
											{name: "Paste", command: "paste", icon: "Camera" },
										],
										events: ["command"]
									}
								]
							},
							{
								title: "2. Mouse",
								id: "tab2",
								contents: [
									{
										widget: "uilabel",
										id:"uilabel1",
										config: {
											layout: {
												border:[1,1,1,1],
												positionAbsolute: {
													top:"30px",
													right:"200px",
												}
											},
											width:"70px",
											height:"70px",
											selectable:true,
											whiteBg:true,
										},
										data: {text: "This is the button to click"}
									},
									
									{
										widget: "uicheckbox",
										id: "check1",
										config: {
											layout: {
												positionAbsolute: {
													top:"70px",
													right:"20px",
												}
											},
										},
										data: {},
									},
									{
										widget: "uicheckbox",
										id: "check2",
										config: {
											layout: {
												positionFlex: {
												
												}
											},
										},
										data: {},
									},
									{
										widget: "uibutton",
										id: "tab2_btn1",
										config: {
											mode: "normal",
											layout: {
												positionAbsolute: {
													top:"30px",
													right:"80px",
												}
											}
										},
										data: {text:"Click me!"},
										events: ["click", "toggleOn", "toggleOff"]
									},
									{
										widget: "uibutton",
										id: "tab2_btn2",
										config: {
											mode: "toggle",
										},
										data: {text:"Toggle me!"},
										events: ["click", "toggleOn", "toggleOff"]
									},
									{
										widget: "uibutton",
										id: "tab2_btn3",
										config: {
											mode: "menu",
											menuData: [
												{
													"icon": "Folder",
													"id": "abc",
													"name": "-New",
													"command": "newX",
													"shortcut": "Ctrl + N",
													"enabled": true,
													"leftText": "*"
												},
												{
													"id": 1,
													"name": "Open",
													"command": "newY",
													"shortcut": "Ctrl + N",
													"enabled": true,
													"leftText": "*"
												},
												{
													"name": "Save",
													"command": "newZ",
													"shortcut": "Ctrl + N",
													"enabled": true,
													"leftText": "*",
													"icon": "Network"
												}
											]
										},
										data: {text:"Menu!"},
										events: ["menuCommand"]
									}
								]
							},
							{
								title: "7. Scanner",
								id: "tab3",
								contents: [
									{
										widget: "toolbar",
										id: "tab3_toolbar",
										config: {},
										data: [
											{name: "New5", 	command: "new5"},
											{name: "Open5",	command: "open5"},
											{name: "Save5", command: "save5"},
										],
										events: ["command"]
									}
								]
							},
							{
								title: "8. Power button",
								id: "tab4",
								contents: [
									{
										widget: "toolbar",
										id: "tab3_toolbar",
										config: {},
										data: [
											{name: "New5", 	command: "new5"},
											{name: "Open5",	command: "open5"},
											{name: "Save5", command: "save5"},
										],
										events: ["command"]
									}
								]
							},
							{
								title: "11. MIDI",
								id: "tab5",
								contents: [
									{
										widget: "toolbar",
										id: "tab3_toolbar",
										config: {
											layout: {
												border: [1,1,1,1],
												marginPx: [20,20,20,20],
											}
										},
										data: [
											{name: "New5", 	command: "new5"},
											{name: "Open5",	command: "open5"},
											{name: "Save5", command: "save5"},
										],
										events: ["command"]
									}
								]
							}
						],
						events: ["select"]
					}
				]
			},
			events: []
		}
	],
	events: ["minimize", "maximize", "close", "quit"]
}

OS.NewWindow(win1);
OS.ListenEvent("win1", null, "maximize", (ev) => {console.log("calc: maximize event: ev = ", ev);});
OS.ListenEvent("win1", null, "minimize", (ev) => {console.log("calc: minimize event: ev = ", ev);});
OS.ListenEvent("win1", null, "close", (ev) => {console.log("calc: close event: ev = ", ev);});
OS.ListenEvent("win1", null, "quit", (ev) => {console.log("calc: quit event: ev = ", ev);});
OS.ListenEvent("win1", "mbar1", "command", (ev) => {console.log("calc: menubar: command event: ev = ", ev);});
OS.ListenEvent("win1", "main_toolbar", "command", (ev) => {console.log("calc: toolbar: command event: ev = ", ev);});
OS.ListenEvent("win1", "main_toolbar", "contextMenuCommand", (ev) => {console.log("calc: toolbar: context menu command event: ev = ", ev);});
OS.ListenEvent("win1", "pane1_treeview", "selected", (ev) => {console.log("calc: treeview: selected item with id = ", ev.data);});
OS.ListenEvent("win1", "pane1_dropdown", "select", (ev) => {console.log("calc: dropdown: select item with id = ", ev.data);});

OS.ListenEvent("win1", "tab2_btn2", "toggleOn", (ev) => {
	console.log("calc: tab2_btn2: toggleOn");
	OS.WidgetSetData("win1", "tab2_btn2", {text: "I'm pressed"});
});
OS.ListenEvent("win1", "tab2_btn2", "toggleOff", (ev) => {
	console.log("calc: tab2_btn2: toggleOff");
	OS.WidgetSetData("win1", "tab2_btn2", {text: "I'm un-pressed"});
});

console.log("calc: started app thread");
