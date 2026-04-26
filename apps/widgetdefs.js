// note: setting default values for fields - user's value will not be saved if it matches default.
//		 Also need to ensure widget code uses same default. If changing default here, also need to
//		 change in widget code. This here should be a reflection of widget's default behaviour, not
//		 the definitive original spec for default values.

export const FieldTypeEnum = {
	Boolean: 1,
	Number: 2,
	String: 3,
	Enum: 4, // EnumDef: { "desc": "val1", "desc": val2", ... }
	MenuData: 5,
	Object: 6, // ObjectDef: _containerLayoutObjectDef,
};

const _menuDataObjectDef = {
    visible: {
        Label: "Visible",
        Type: FieldTypeEnum.Boolean,
        Default: true,
    },
    separator: {
        Label: "Is separator",
        Type: FieldTypeEnum.Boolean,
        Default: false,
    },
    name: {
        Label: "Name",
        Type: FieldTypeEnum.String,
    },
    enabled: {
        Label: "Enabled",
        Type: FieldTypeEnum.Boolean,
        Default: true,
    },
    leftText: {
        Label: "Text to left (eg, checkmark)",
        Type: FieldTypeEnum.String,
    },
    shortcut: {
        Label: "Text to right (eg, key shortcut)",
        Type: FieldTypeEnum.String,
    },
    icon: {
        Label: "Icon",
        Type: FieldTypeEnum.String,
    },
    command: {
        Label: "Command (received by widget event handler)",
        Type: FieldTypeEnum.String,
    },
    children: {
        Label: "Submenu",
        Type: FieldTypeEnum.Object,
        IsArray: true,
        GetObjectDef: () => {
            return _menuDataObjectDef;
        },
    },
}

const _borderEnumFieldDef = {
	Label: "Border (t,r,b,l)",
	Type: FieldTypeEnum.Enum,
	EnumDef: {
		"None": "0",
		"Highlight": "1",
		"Shadow": "2",
		"Background": "3",
		"White": "4",
		"Text color": "5",
		"Transparent": "6",
	},
	Default: "0",
    IsArray: true,
	ArrayLength: 4,
};

const _widgetPositionAbsoluteFieldDef = {
	Label: "Absolute positioning",
	Type: FieldTypeEnum.Object,
	ObjectDef: {
		top: {
			Label: "top",
			Type: FieldTypeEnum.String,
		},
		right: {
			Label: "right",
			Type: FieldTypeEnum.String,
		},
		bottom: {
			Label: "bottom",
			Type: FieldTypeEnum.String,
		},
		left: {
			Label: "left",
			Type: FieldTypeEnum.String,
		},
	},
};

const _widgetPositionFlexFieldDef = {
	Label: "Flex positioning",
	Type: FieldTypeEnum.Object,
	ObjectDef: {
		basis: {
			Label: "basis",
			Type: FieldTypeEnum.String,
		},
		shrink: {
			Label: "shrink",
			Type: FieldTypeEnum.String,
		},
		grow: {
			Label: "grow",
			Type: FieldTypeEnum.String,
		},
		minWidth: {
			Label: "min-width",
			Type: FieldTypeEnum.String,
		},
		maxWidth: {
			Label: "max-width",
			Type: FieldTypeEnum.String,
		},
		minHeight: {
			Label: "min-height",
			Type: FieldTypeEnum.String,
		},
		maxHeight: {
			Label: "max-height",
			Type: FieldTypeEnum.String,
		},
		alignSelf: {
			Label: "align-self",
			Type: FieldTypeEnum.String,
		},
	},
};

export const _widgetLayoutObjectDef = {
	border: _borderEnumFieldDef,
	width: {
		Label: "width",
		Type: FieldTypeEnum.String,
	},
	height: {
		Label: "height",
		Type: FieldTypeEnum.String,
	},
	positionAbsolute: _widgetPositionAbsoluteFieldDef,
	positionFlex: _widgetPositionFlexFieldDef,
	margin: {
		Label: "Margin (t,r,b,l)",
		Type: FieldTypeEnum.String,
        IsArray: true,
		ArrayLength: 4,
	},
	padding: {
		Label: "padding (t,r,b,l)",
		Type: FieldTypeEnum.String,
        IsArray: true,
		ArrayLength: 4,
	},
	styles: {
		Label: "CSS styles",
		Type: FieldTypeEnum.String,
		IsArray: true,
	},
};

export const _containerLayoutObjectDef = {
	border: _borderEnumFieldDef,
	flexDirection: {
		Label: "flex-direction",
		Type: FieldTypeEnum.Enum,
		EnumDef: {
			"row": "row",
			"column": "column",
		},
		Default: "column",
	},
	// todo make into enum with available CSS options
	
	width: {
		Label: "width",
		Type: FieldTypeEnum.String,
	},
	height: {
		Label: "height",
		Type: FieldTypeEnum.String,
	},
	minWidth: {
		Label: "min-width",
		Type: FieldTypeEnum.String,
	},
	minHeight: {
		Label: "min-height",
		Type: FieldTypeEnum.String,
	},
	maxWidth: {
		Label: "max-width",
		Type: FieldTypeEnum.String,
	},
	maxHeight: {
		Label: "max-height",
		Type: FieldTypeEnum.String,
	},
	flexWrap: {
		Label: "flex-wrap",
		Type: FieldTypeEnum.String,
	},
	justifyContent: {
		Label: "justify-content",
		Type: FieldTypeEnum.String,
	},
	padding: {
		Label: "Padding (t,r,b,l)",
		Type: FieldTypeEnum.String,
		ArrayLength: 4,
	},
	overflowX: {
		Label: "overflow-x",
		Type: FieldTypeEnum.String,
	},
	overflowY: {
		Label: "overflow-y",
		Type: FieldTypeEnum.String,
	},
	styles: {
		Label: "CSS styles",
		Type: FieldTypeEnum.String,
		IsArray: true,
	},
};

export const WindowPropsFormDef = {
    title: {
        Label: "title",
        Type: FieldTypeEnum.String,
    },
    icon: {
        Label: "Icon",
        Type: FieldTypeEnum.String,
    },
    containerLayout: {
        Label: "Container layout",
        Type: FieldTypeEnum.Object,
        ObjectDef: _containerLayoutObjectDef,
    },
    resizable: {
        Label: "Resizable",
        Type: FieldTypeEnum.Boolean,
    },
    initialSizeX: {
        Label: "Width (px)",
        Type: FieldTypeEnum.Number,
    },
    initialSizeY: {
        Label: "Height (px)",
        Type: FieldTypeEnum.Number,
    },
};

export const IconsFormDef = {
    icons: {
        Label: "Icons",
        Type: FieldTypeEnum.Object,
        IsArray: true,
        ObjectDef: {
            name: {
                Label: "Name",
                Type: FieldTypeEnum.String,
            },
            base64data: {
                Label: "Data (base64)",
                Type: FieldTypeEnum.String,
            },
        },
    },
};

export const WidgetDefs = {
    uibutton: {
        Name: "Button",
        ConfigDef: {
            mode: {
                Label: "Button type",
                Type: FieldTypeEnum.Enum,
                EnumDef: {
                    "Normal": "normal",
                    "Toggle button": "toggle",
                    "Menu button": "menu",
                },
            },
            menuData: {
                Label: "Menu",
                Type: FieldTypeEnum.MenuData,
            },
            width: {
                Label: "Width (css)",
                Type: FieldTypeEnum.String,
            },
            height: {
                Label: "Height (css)",
                Type: FieldTypeEnum.String,
            },
        },
        DataDef: {
            text: {
                Label: "Text",
                Type: FieldTypeEnum.String,
            },
        },
        StateDef: {
            pressed: {
                Label: "Pressed (if togglebutton)",
                Type: FieldTypeEnum.Boolean,
                Default: false,
            },
        },
		Events: [
			"click",
			"toggleOn",
			"toggleOff",
			"menuCommand",
		],
    },
    uicanvas: {
        Name: "Canvas",
        ConfigDef: {
            menuData: {
                Label: "Menu",
                Type: FieldTypeEnum.MenuData,
            },
            width: {
                Label: "width (px) (empty = auto fill shadow.host)",
                Type: FieldTypeEnum.Number,
				Default: 0,
            },
            height: {
                Label: "height (px) (empty = auto fill shadow.host)",
                Type: FieldTypeEnum.Number,
				Default: 0,
            },
			smoothScaling: {
                Label: "Smooth scaling",
                Type: FieldTypeEnum.Boolean,
				Default: true,
            },
        },
        DataDef: {
			
        },
        StateDef: {
			
        },
		Events: [
			"resize",
		],
    },
    uicheckbox: {
        Name: "Checkbox",
        ConfigDef: {

        },
        DataDef: {

        },
        StateDef: {
            checked: {
                Label: "Checked",
                Type: FieldTypeEnum.Boolean,
                Default: false,
            }
        },
		Events: [
			"change"
		],
    },
    colorbuttons: {
        Name: "Color buttons",
        ConfigDef: {

        },
        DataDef: {
            colors: {
                Label: "Colors",
                Type: FieldTypeEnum.String,
                IsArray: true,
            },
        },
        StateDef: {
            selectedColor: {
                Label: "Selected color",
                Type: FieldTypeEnum.String,
            },
        },
    },
    colorinput: {
        Name: "Color input",
        ConfigDef: {
			width: {
                Label: "Width (css)",
                Type: FieldTypeEnum.String,
			},
			height: {
                Label: "Width (css)",
                Type: FieldTypeEnum.String,
			},
        },
        DataDef: {
			
        },
        StateDef: {
			color: {
				Label: "Color",
                Type: FieldTypeEnum.String,
				Default: "blue",
			},
        },
		Events: [
			"changeColor",
		],
    },
    container: {
        Name: "Container",
        ConfigDef: {
            containerLayout: {
                Label: "Container layout",
                Type: FieldTypeEnum.Object,
                ObjectDef: _containerLayoutObjectDef,
            },
        },
        DataDef: {

        },
        StateDef: {
			scrollX: {
				Label: "Scroll X",
				Type: FieldTypeEnum.Number,
				Default: 0,
			},
			scrollY: {
				Label: "Scroll Y",
				Type: FieldTypeEnum.Number,
				Default: 0,
			},
			containerScrollX: {
				Label: "Container scroll x",
				Type: FieldTypeEnum.Number,
				Default: 0,
			},
			containerScrollY: {
				Label: "Container scroll y",
				Type: FieldTypeEnum.Number,
				Default: 0,
			},
        },
    },
    dropdown: {
        Name: "Dropdown",
        ConfigDef: {

        },
        DataDef: {
            items: {
                Label: "Items",
                Type: FieldTypeEnum.Object,
                IsArray: true,
                ObjectDef: {
                    name: {
                        Label: "Name",
                        Type: FieldTypeEnum.String,
                    },
                    id: {
                        Label: "ID",
                        Type: FieldTypeEnum.String,
                    },
                },
            },
        },
        StateDef: {
            selectedItemId: {
                Label: "Selected item ID",
                Type: FieldTypeEnum.String,
            },
        },
		Events: [
			"change",
		],
    },
    iconview: {
        Name: "Icon view",
        ConfigDef: {
            contextMenu: {
                Label: "Context menu",
                Type: FieldTypeEnum.Object,
                IsArray: true,
                ObjectDef: _menuDataObjectDef,
            },
            itemContextMenu: {
                Label: "Item context menu",
                Type: FieldTypeEnum.Object,
                IsArray: true,
                ObjectDef: _menuDataObjectDef,
            },
            multipleItemsContextMenu: {
                Label: "Multiple items context menu",
                Type: FieldTypeEnum.Object,
                IsArray: true,
                ObjectDef: _menuDataObjectDef,
            },
            orientation: {
                Label: "Orientation",
                Type: FieldTypeEnum.Enum,
                EnumDef: {
                    "Rows": "row",
                    "Columns": "column",
                },
                Default: "row",
            },
        },
        DataDef: {
            items: {
                Label: "Icons",
                Type: FieldTypeEnum.Object,
                IsArray: true,
                ObjectDef: {
                    label: {
                        Label: "Label",
                        Type: FieldTypeEnum.String,
                    },
                    icon: {
                        Label: "Icon",
                        Type: FieldTypeEnum.String,
                    },
                    id: {
                        Label: "ID",
                        Type: FieldTypeEnum.String,
                    },
                },
            },
        },
        StateDef: {
            selectedItemIds: {
                Label: "Selected icons IDs",
                Type: FieldTypeEnum.String,
                IsArray: true,
            }
        },
		Events: [
			"contextMenuCommand",
			"itemContextMenuCommand",
			"open",
			"selectionChanged",
		],
    },
    uilabel: {
        Name: "Label",
        ConfigDef: {
            width: {
                Label: "width (css)",
                Type: FieldTypeEnum.String,
            },
            height: {
                Label: "height (css)",
                Type: FieldTypeEnum.String,
            },
            selectable: {
                Label: "Selectable text",
                Type: FieldTypeEnum.Boolean,
				Default: false,
            },
            whiteBg: {
                Label: "White background",
                Type: FieldTypeEnum.Boolean,
				Default: false,
            },
            align: {
                Label: "Align",
                Type: FieldTypeEnum.Enum,
                EnumDef: {
                    "None": 		"none",
                    "Left": 		"l",
                    "Top left": 	"tl",
                    "Top": 			"t",
                    "Top right": 	"tr",
                    "Right": 		"r",
                    "Bottom right": "br",
                    "Bottom": 		"b",
                    "Bottom left": 	"bl",
                    "Center": 		"c",
                },
                Default: "none",
			}
        },
        DataDef: {
            text: {
                Label: "Text",
                Type: FieldTypeEnum.String,
            },
        },
        StateDef: {

        },
    },
    listview: {
        Name: "List view",
        ConfigDef: {

        },
        DataDef: {
            items: {
                Label: "Items",
                Type: FieldTypeEnum.Object,
                IsArray: true,
                ObjectDef: {
                    name: {
                        Label: "Name",
                        Type: FieldTypeEnum.String,
                    },
                    id: {
                        Label: "Name",
                        Type: FieldTypeEnum.String,
                    },
                },
            },
        },
        StateDef: {

        },
		Events: [
			"selected",
		],
    },
    menubar: {
        Name: "Menu bar",
        ConfigDef: {

        },
        DataDef: {
            items: {
                Label: "Menus",
                Type: FieldTypeEnum.Object,
                IsArray: true,
                ObjectDef: {
                    name: {
                        Label: "Name",
                        Type: FieldTypeEnum.String,
                    },
                    visible: {
                        Label: "Visible",
                        Type: FieldTypeEnum.Boolean,
                        Default: true,
                    },
                    children: {
                        Label: "Menu items",
                        Type: FieldTypeEnum.Object,
                        IsArray: true,
                        ObjectDef: _menuDataObjectDef,
                    },
                },
            },
        },
        StateDef: {

        },
		Events: [
			"command",
		],
    },
    resizer: {
        Name: "Resizer",
        ConfigDef: {
            
        },
        DataDef: {
            
        },
        StateDef: {

        },
    },
    splitpane: {
        Name: "Split pane",
        ConfigDef: {
            focusleftPane: {
                Label: "Focus left pane",
                Type: FieldTypeEnum.Boolean,
                Default: true,
            },
            pxMode: {
                Label: "Width in px (not %)",
                Type: FieldTypeEnum.Boolean,
				Default: false,
            },
            width: {
                Label: "Width (px or %)",
                Type: FieldTypeEnum.Number,
                Default: 50,
            },
            minWidth: {
                Label: "Min. width",
                Type: FieldTypeEnum.Number,
                Default: 0,
            },
            maxWidth: {
                Label: "Max. width",
                Type: FieldTypeEnum.Number,
                Default: null,
            },
            separatorWidth: {
                Label: "Separator width (px)",
                Type: FieldTypeEnum.Number,
                Default: 12,
            },
            snapClose: {
                Label: "Snap to 0 width",
                Type: FieldTypeEnum.Boolean,
				Default: true,
            },
            snapOpen: {
                Label: "Snap to full width",
                Type: FieldTypeEnum.Boolean,
				Default: true,
            },
            snapOriginal: {
                Label: "Snap to original width",
                Type: FieldTypeEnum.Boolean,
                Default: false,
            },
            snapZoneWidth: {
                Label: "Snap zone width (px)",
                Type: FieldTypeEnum.Number,
                Default: 20,
            },
            row: {
                Label: "Horizontal layout",
                Type: FieldTypeEnum.Boolean,
                Default: true,
            },
            pane1ContainerLayout: {
                Label: "Pane 1 container layout",
                Type: FieldTypeEnum.Object,
                ObjectDef: _containerLayoutObjectDef,
            },
            pane2ContainerLayout: {
                Label: "Pane 2 container layout",
                Type: FieldTypeEnum.Object,
                ObjectDef: _containerLayoutObjectDef,
            },
        },
        DataDef: {

        },
        StateDef: {
            width: {
                Label: "Width (% or px)",
                Type: FieldTypeEnum.Number,
                Default: 50,
            },
        },
    },
    tabs: {
        Name: "Tabs",
        HasConfigurableSubContainers: true,
        ConfigDef: {

        },
        DataDef: {
            items: {
                Label: "Tabs",
                WidgetsTreeUpdateRequired: true,
                Type: FieldTypeEnum.Object,
                IsArray: true,
                ObjectDef: {
                    _containerFid: {
                        Label: "Container form identifier",
                        Type: FieldTypeEnum.String,
                        DefaultFunc: () => {
                            return Math.random() + "";
                        },
                    },
                    name: {
                        Label: "Name",
                        Type: FieldTypeEnum.String,
                    },
                    id: {
                        Label: "ID",
                        Type: FieldTypeEnum.String,
                    },
                    containerLayout: {
                        Name: "Container layout",
                        Type: FieldTypeEnum.Object,
                        ObjectDef: _containerLayoutObjectDef,
                    },
                    //todo: data[] - widget data for tab...
                },
            },
        },
        StateDef: {
            selectedTabId: {
                Label: "Selected tab ID",
                Type: FieldTypeEnum.String,
            },
        },
    },
    textinput: {
        Name: "Text input",
        ConfigDef: {
            width: {
                Label: "width (css)",
                Type: FieldTypeEnum.String,
            },
            height: {
                Label: "height (css)",
                Type: FieldTypeEnum.String,
            },
        },
        DataDef: {

        },
        StateDef: {
            text: {
                Label: "Text",
                Type: FieldTypeEnum.String,
            }
        },
		Events: [
			"change",
		],
    },
    toolbar: {
        Name: "Toolbar",
        ConfigDef: {
            iconSize: {
                Label: "Icon size",
                Type: FieldTypeEnum.Enum,
                EnumDef: {
                    "Small": "small",
                    "Large": "large",
                },
                Default: "small",
            },
            orientation: {
                Label: "Orientation",
                Type: FieldTypeEnum.Enum,
                EnumDef: {
                    "Horizontal": "horizontal",
                    "Vertical": "vertical",
                },
                Default: "horizontal",
            },
            textPosition: {
                Label: "Text position",
                Type: FieldTypeEnum.Enum,
                EnumDef: {
                    "None": "none",
                    "Under": "under",
                    "Beside": "beside",
                },
                Default: "none",
            },
            overflowMode: {
                Label: "Overflow mode",
                Type: FieldTypeEnum.Enum,
                EnumDef: {
                    "Menu": "menu",
                    "Wrap": "wrap",
                },
                Default: "menu",
            },
            contextMenu: {
                Label: "Context menu",
                Type: FieldTypeEnum.Object,
                IsArray: true,
                ObjectDef: _menuDataObjectDef,
            },
        },
        DataDef: {
            items: {
                Label: "Items",
                Type: FieldTypeEnum.Object,
                IsArray: true,
                ObjectDef: {
                    separator: {
                        Label: "Is separator",
                        Type: FieldTypeEnum.Boolean,
						Default: false,
                    },
                    name: {
                        Label: "Name",
                        Type: FieldTypeEnum.String,
                    },
                    command: {
                        Label: "Command",
                        Type: FieldTypeEnum.String,
                    },
                    icon: {
                        Label: "Icon",
                        Type: FieldTypeEnum.String,
                    },
                    disabled: {
                        Label: "Disabled",
                        Type: FieldTypeEnum.Boolean,
						Default: false,
                    },
                    menu: {
                        Label: "Menu items",
                        Type: FieldTypeEnum.Object,
                        IsArray: true,
                        ObjectDef: _menuDataObjectDef,
                    },
                    toggleOffCommand: {
                        Label: "ToggleOffCommand",
                        Type: FieldTypeEnum.String,
                    },
					breakAfter: {
                        Label: "Break (wrap) after item",
                        Type: FieldTypeEnum.Boolean,
						Default: false,
					},
					buttonGroup: {
						Label: "Button group",
						Type: FieldTypeEnum.String,
					},
                },
            },
        },
        StateDef: {
            pressedToggleButtonIds: {
                Label: "Pressed toggle button IDs",
                Type: FieldTypeEnum.String,
                IsArray: true,
            },
        },
		Events: [
			"contextMenuCommand",
			"command",
		],
    },
    treeview: {
        Name: "Tree view",
        ConfigDef: {
			//todo remove
            //autoExpand: {
            //    Label: "Auto expand on specify selected item",
            //    Type: FieldTypeEnum.Boolean,
			//	Default: true,
            //},
        },
        DataDef: {
            items: {
                Label: "Items",
                Type: FieldTypeEnum.Object,
                IsArray: true,
                ObjectDef: {
                    name: {
                        Label: "Name",
                        Type: FieldTypeEnum.String,
                    },
                    id: {
                        Label: "ID",
                        Type: FieldTypeEnum.String,
                    },
                    // children: [] todo implement - see menuData object definition for example how.
                },
            }
        },
        StateDef: {
            selectedId: {
                Label: "Selected ID",
                Type: FieldTypeEnum.String,
            },
            expandedIds: {
                Label: "Expanded IDs",
                Type: FieldTypeEnum.String,
                IsArray: true,
            }
        },
		Events: [
			"selected",
			"collapsed",
			"expanded"
		],
    },
};
