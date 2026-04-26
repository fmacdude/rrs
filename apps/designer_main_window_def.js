
export const mainWindowDef = 
{"config":{"title":"Designer","icon":"ImageFile","containerLayout":{"flexDirection":"column"}},"data":[{"widget":"toolbar","config":{"iconSize":"small","textPosition":"beside","overflowMode":"menu","id":"main_toolbar"},"data":{"items":[{"name":"Load self","command":"loadself","icon":"Mail","id":"t1"},{"name":"Read config form","command":"readconfigform","icon":"Search"},{"name":"Run","command":"run","icon":"App"},{"name":"Show def","command":"showdef","icon":"Laptop"},{"name":"Load def","command":"loaddef","icon":"Hardware"},{"name":"Move widget","command":"moveWidget","icon":"User","toggleOffCommand":"moveWidgetOff"},{"separator":true},{"name":"Print","command":"print","icon":"Refresh","toggleOffCommand":"printOff"},{"name":"Paste","command":"paste","icon":"Camera"},{"name":"Settings","command":"settings","icon":"Lock","toggleOffCommand":"settingsOff","id":"s1"}]},"state":{"pressedToggleButtonIds":[null]},"layout":{"border":[0,0,0,0]}},{"widget":"splitpane","config":{"pxMode":true,"width":200,"snapClose":false,"snapOpen":false,"snapOriginal":true,"snapZoneWidth":25,"pane1ContainerLayout":{"flexDirection":"column","overflowX":"auto","overflowY":"clip"},"pane2ContainerLayout":{"border":["2","1","1","2"],"flexDirection":"row","padding":"20px,20px,20px,20px","overflowX":"auto","overflowY":"auto"},"id":"splitpane1"},"data":{"pane1":[{"widget":"splitpane","config":{"snapClose":false,"snapOpen":false,"snapOriginal":true,"snapZoneWidth":25,"row":false,"pane1ContainerLayout":{"flexDirection":"column","overflowX":"auto","overflowY":"clip"},"pane2ContainerLayout":{"border":["6","0","0","0"],"flexDirection":"row"},"id":"splitpane2"},"data":{"pane1":[{"widget":"container","config":{"containerLayout":{"border":[0,0,0,0],"flexDirection":"row"},"id":"dd_cont"},"data":[{"widget":"dropdown","config":{"id":"widgets_dropdown"},"data":{"items":[{"name":"Menu bar","id":"menubar"},{"name":"Toolbar","id":"toolbar"},{"name":"Tabs","id":"tabs"},{"name":"Split pane","id":"splitpane"},{"name":"List view","id":"listview"},{"name":"Dropdown","id":"dropdown"},{"name":"Container","id":"container"},{"name":"Label","id":"uilabel"},{"name":"Text input","id":"textinput"},{"name":"Checkbox","id":"uicheckbox"},{"name":"Button","id":"uibutton"},{"name":"Color buttons","id":"colorbuttons"},{"name":"Tree view","id":"treeview"},{"name":"Icon view","id":"iconview"},{"name":"Canvas","id":"uicanvas"},{"name":"Color input","id":"colorinput"},{"name":"Resizer thumb","id":"resizer"}]},"state":{"selectedItemId":"menubar"},"layout":{"positionFlex":{"basis":"100%"}}},{"widget":"uibutton","config":{"mode":"menu","width":"40px","height":"100%","menuData":[{"icon":"Add","name":"Add before","command":"addBefore"},{"icon":"Add","name":"Add after","command":"addAfter"},{"icon":"Add","name":"Add inside","command":"addInside"},{"icon":"TrashEmpty","name":"Remove","command":"remove"}],"id":"add_remove_btn"},"data":{"text":"+"}}],"layout":{"border":["2","1","1","2"]}},{"widget":"treeview","config":{"id":"widgets_tree"},"data":{"items":[]},"layout":{"border":["2","1","1","2"],"positionFlex":{"basis":"100%"}}}],"pane2":[{"widget":"tabs","config":{"initialTabId":"tab_config","id":"widgetOptionTabs"},"data":{"items":[{"name":"Config","id":"tab_config","containerLayout":{"border":[null,0,0,0],"padding":["0","0","0","0"],"overflowX":"auto","overflowY":"auto","flexDirection":"cloumn"},"contents":[],"_containerFid":"0.19793724011663016"},{"name":"Data","id":"tab_data","containerLayout":{"border":[null,0,0,0],"padding":["0","0","0","0"],"overflowX":"auto","overflowY":"auto","flexDirection":"cloumn"},"contents":[],"_containerFid":"0.35568526064566885"},{"name":"State","id":"tab_state","containerLayout":{"border":[null,0,0,0],"padding":["0","0","0","0"],"overflowX":"auto","overflowY":"auto","flexDirection":"cloumn"},"contents":[],"_containerFid":"0.17727187497752017"},{"name":"Layout","id":"tab_layout","containerLayout":{"border":[null,0,0,0],"padding":["0","0","0","0"],"overflowX":"auto","overflowY":"auto","flexDirection":"cloumn"},"contents":[],"_containerFid":"0.37476648838317006"},{"name":"Events","id":"tab_events","containerLayout":{"border":[null,0,0,0],"padding":["0","0","0","0"],"overflowX":"auto","overflowY":"auto","flexDirection":"cloumn"},"contents":[],"_containerFid":"0.06289975463557518"}]},"state":{"selectedTabId":"tab_config"},"layout":{"positionFlex":{"basis":"100%","minWidth":"0"}}}]},"state":{"width":50},"layout":{"positionFlex":{"basis":"100%","alignSelf":"stretch"}}}],"pane2":[{"widget":"container","config":{"containerLayout":{"flexDirection":"column","width":"100%","height":"100%"},"id":"root"},"layout":{"border":[1,2,2,1],"positionAbsolute":{"top":"18px","bottom":"18px","left":"18px","right":"18px"}}}]},"state":{"width":200},"layout":{"positionFlex":{"basis":"100%","alignSelf":"stretch"}}}],"events":["minimize","maximize","close","quit"]}
;

/*
{
	config: {
		title: "Designer",
		icon: "ImageFile",
		width: 1300,
		height: 800,
		containerLayout: {},
	},
	data: [
		{
			widget: "toolbar",
			config: {
				id: "main_toolbar",
				iconSize: "small",
				textPosition: "beside",
				overflowMode: "menu",
			},
			data: { items: [
				{name: "Load self", command: "loadself", icon: "Mail", id: "t1", },
				{name: "Read config form", command: "readconfigform", icon: "Search" },
				{name: "Run", command: "run", icon: "App",  },
				{name: "Show def", command: "showdef", icon: "Laptop",  },
				{name: "Load def", command: "loaddef", icon: "Hardware",  },
				{name: "Move widget", command: "moveWidget", icon: "User", toggleOffCommand: "moveWidgetOff" },
				{separator: true},
				{name: "Print", command: "print", icon: "Refresh", toggleOffCommand: "printOff"  },
				{name: "Paste", command: "paste", icon: "Camera" },
				{name: "Settings", command: "settings", icon: "Lock", toggleOffCommand: "settingsOff", id: "s1" },
			], },
			state: {},
			layout: {
				border: [0,0,0,0]
			},
			events: ["command", "contextMenuCommand"],
		},
		{
			widget: "splitpane",

			config: {
				id: "splitpane1",
				pane1ContainerLayout: {
					border: [0,0,0,0],
					flexDirection:"column",
					overflowX: "auto",
					overflowY: "clip"
				},
				pane2ContainerLayout: {
					border: [2,1,1,0],
					padding: ["20px","20px","20px","20px"],
					overflowX: "auto",
					overflowY: "auto",
					flexDirection:"row",
				},
				//visible: true,
				pxMode: true,
				focusLeftPane: true,
				width: 200,
				//row: false,
				//separatorWidth: 50,
				snapOriginal: true,
				snapClose: false,
				snapOpen: false,
				snapZoneWidth: 25,
				minWidth: 0,
				//maxWidth: 50
			},
			data: {
				pane1: [
					{
						widget: "splitpane",

						config: {
							id: "splitpane2",
							pane1ContainerLayout: {
								border: [0,0,0,0],
								flexDirection:"column",
								overflowX: "auto",
								overflowY: "clip"
							},
							pane2ContainerLayout: {
								border: [0,0,0,0],
								flexDirection:"row",
							},
							//visible: true,
							pxMode: false,
							focusLeftPane: true,
							width: 50,
							row: false,
							//separatorWidth: 50,
							snapOriginal: true,
							snapClose: false,
							snapOpen: false,
							snapZoneWidth: 25,
							minWidth: 0,
							//maxWidth: 50
						},
						data: {
							pane1: [
								{
									widget:"container",
									config: {
										id:"dd_cont",
										containerLayout: {
											border: [0,0,0,0],
											//overflowY: "scroll",
											flexDirection:"row",
										},
									},
									data: [
										{
											widget:"dropdown",
											config: {
												id: "widgets_dropdown",
											},
											data: { items: [
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
												{ name: "Tree view", id: "treeview" },
												{ name: "Icon view", id: "iconview" },
												{ name: "Canvas", id: "uicanvas" },
												{ name: "Color input", id: "colorinput" },
											], },
											layout: {
												border: [2,0,1,2],
												positionFlex: {
													basis: "100%",
												}
											},
											events: ["change",],
										},
										{
											widget: "uibutton",
											config: {
												id: "add_remove_btn",
												mode: "menu",
												width: "40px",
												height: "100%",
												menuData: [
													{
														"icon": "Add",
														"name": "Add before",
														"command": "addBefore",
													},
													{
														"icon": "Add",
														"name": "Add after",
														"command": "addAfter",
													},
													{
														"icon": "Add",
														"name": "Add inside",
														"command": "addInside",
													},
													{
														"icon": "TrashEmpty",
														"name": "Remove",
														"command": "remove",
													}
												]
											},
											data: {text:"+"},
											events: ["menuCommand"]
										},
									],
									layout: {
										border:[0,0,0,0],
									},
								},
								{
									widget: "treeview",
									config: {
										id: "widgets_tree",
									},
									data: {items:[]},
									state: {},
									layout: {
										border: [2,0,0,2],
										positionFlex: {basis: "100%",},
									},
									events: ["selected"],
								},

							],
							pane2: [
							{
									widget: "tabs",
									config: {
										id: "widgetOptionTabs",
										initialTabId: "tab_config",
									},
									data: {items:[
										{
											name: "Config",
											id: "tab_config",
											containerLayout: {
												border: [null,0,0,0],
												padding:["0","0","0","0"],
												overflowX: "auto",
												overflowY: "auto",
												flexDirection:"cloumn",
											},
											contents: [],
										},
										{
											name: "Data",
											id: "tab_data",
											containerLayout: {
												border: [null,0,0,0],
												padding:["0","0","0","0"],
												overflowX: "auto",
												overflowY: "auto",
												flexDirection:"cloumn",
											},
											contents: [],
										},
										{
											name: "State",
											id: "tab_state",
											containerLayout: {
												border: [null,0,0,0],
												padding:["0","0","0","0"],
												overflowX: "auto",
												overflowY: "auto",
												flexDirection:"cloumn",
											},
											contents: [],
										},
										{
											name: "Layout",
											id: "tab_layout",
											containerLayout: {
												border: [null,0,0,0],
												padding:["0","0","0","0"],
												overflowX: "auto",
												overflowY: "auto",
												flexDirection:"cloumn",
											},
											contents: [],
										},
										{
											name: "Events",
											id: "tab_events",
											containerLayout: {
												border: [null,0,0,0],
												padding:["0","0","0","0"],
												overflowX: "auto",
												overflowY: "auto",
												flexDirection:"cloumn",
											},
											contents: [],
										},
									],},
									layout: {
										positionFlex: {
											basis: "100%",
											minWidth:0,
										},
									},
									events: ["select"],
								}
							]
						},
						layout: {
							"positionFlex":{"basis":"100%","alignSelf":"stretch"}
						},
						events: [],
					}
				],
				pane2: [
					{
						widget:"container",
						config: {
							id:"root",
							containerLayout: {
								//border:[2,1,1,2],
								flexDirection:"column",
								width:"100%",
								height:"100%",
							},
						},
						data:[],
						state:null,
						layout: {
							border:[1,2,2,1],
							positionAbsolute:{
								top:"18px",
								bottom:"18px",
								left:"18px",
								right:"18px",
							},
						},
						events:[],
					},

				]
			},
			layout: {
				"positionFlex":{"basis":"100%","alignSelf":"stretch"}
			},
			events: [],
		}
	],
	events: ["minimize", "maximize", "close", "quit"]
};
*/