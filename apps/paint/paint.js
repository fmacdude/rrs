import { UI, WindowHandle, ContainerHandle, WidgetHandle, FS } from '/lib/workerlib.js';

import { mainWindowDef } 	from './paint_main_window_def.js';
import { App } 			 	from './app.js';
import { FileOps } 			from './FileOps.js';
import { UndoRedo }			from './UndoRedo.js';
import { ToolBase } 		from './ToolBase.js';
import { Tool_Bucket } 		from './Tool_Bucket.js';
import { Tool_Pen } 		from './Tool_Pen.js';
import { Tool_Picker } 		from './Tool_Picker.js';

console.log("paint: started app thread");

// init widget handles
App.win = await UI.NewWindowAsync(mainWindowDef);
App.Widgets.mainMenu = await App.win.WidgetAsync("mainMenu");
App.Widgets.topToolbar = await App.win.WidgetAsync("top_toolbar");
App.Widgets.mainToolbar = await App.win.WidgetAsync("main_toolbar");
App.Widgets.mainToolbar2 = await App.win.WidgetAsync("main_toolbar2");
App.Widgets.statusBarText1 = await App.win.WidgetAsync("statusBarText1");
App.Widgets.statusBarText2 = await App.win.WidgetAsync("statusBarText2");
App.Widgets.statusBarText3 = await App.win.WidgetAsync("statusBarText3");
App.Widgets.canvasContainer = await App.win.WidgetAsync("canvasContainer");
App.Widgets.canvasWidget = await App.win.WidgetAsync("canvas");
App.Widgets.overlayCanvasWidget = await App.win.WidgetAsync("overlayCanvas");
App.Widgets.color1Widget = await App.win.WidgetAsync("color1");
App.Widgets.color2Widget = await App.win.WidgetAsync("color2");


// init window events
App.win.On("requestClose",  UI.OtherEventsEnum.Cull, async (data) => {
	await commandProcessor("exit");
});


async function commandProcessor(command) {
	if(command === "new") {
		if(FileOps.modified) {
			let doSave = await UI.GetConfirmationFromUserAsync(App.win, "Save current picture?", "Do you want to save your work?", "Save", "Discard", "svg-emblems-emblem-important");
			if(doSave)
				await FileOps.SaveAsync();
		}
		FileOps.New();
	}
	else if(command === "open") {
		if(FileOps.modified) {
			let doSave = await UI.GetConfirmationFromUserAsync(App.win, "Save current picture?", "Do you want to save your work?", "Save", "Discard", "svg-emblems-emblem-important");
			if(doSave)
				await FileOps.SaveAsync();
		}
		await FileOps.OpenAsync();
	}
	else if(command === "save")
		await FileOps.SaveAsync();
	else if(command === "saveAs")
		await FileOps.SaveAsAsync();
	else if(command === "exit") {		
		if(FileOps.modified) {
			let doSave = await UI.GetConfirmationFromUserAsync(App.win, "Save current picture?", "Do you want to save your work?", "Save", "Discard", "svg-emblems-emblem-important");
			if(doSave)
				await FileOps.SaveAsync();
		}
		UI.QuitApp();
	}
	else if(command === "undo")
		UndoRedo.Undo();
	else if(command === "redo")
		UndoRedo.Redo();
}

// init menu
App.Widgets.mainMenu.On("command", UI.OtherEventsEnum.All, async (ev) => {
	let command = ev.data;
	commandProcessor(command);
});

// init top toolbar
App.Widgets.topToolbar.On("command", UI.OtherEventsEnum.All, async (ev) => {
	let command = ev.data;
	commandProcessor(command);
});


// init canvas
App.Widgets.canvasWidget.On("resize", UI.OtherEventsEnum.Queue, async(ev) => {
	// todo - allow resize support.. this code not currently used
	if(App.ctx === null)
		return;
	App.canvas.width = ev.data.w;
	App.canvas.height = ev.data.h;
	App.ctx.fillStyle = "white";
	App.ctx.fillRect(0, 0, App.canvas.width, App.canvas.height);
	// note - resize means canvas can lose bitmap data, needs to be redrawn.
});
let canvasStuff = await App.Widgets.canvasWidget.GetCanvas();
App.canvas = canvasStuff.canvas;
App.ctx = App.canvas.getContext("2d");
App.canvas.width = canvasStuff.w;
App.canvas.height = canvasStuff.h;
App.ctx.fillStyle = "white";
App.ctx.fillRect(0, 0, App.canvas.width, App.canvas.height);
UndoRedo.Init();


// init overlay canvas
let overlayCanvasStuff = await App.Widgets.overlayCanvasWidget.GetCanvas();
App.overlayCanvas = overlayCanvasStuff.canvas;
App.overlayCtx = App.overlayCanvas.getContext("2d");
App.overlayCanvas.width = overlayCanvasStuff.w;
App.overlayCanvas.height = overlayCanvasStuff.h;
App.overlayCtx.clearRect(0, 0, App.overlayCanvas.width, App.overlayCanvas.height);

let panning = false;
let panStartX = 0;
let panStartY = 0;
let viewportXStart = 0;
let viewportYStart = 0;

let viewportX = 0;
let viewportY = 0;
let viewportW = 0;//
let viewportH = 0;//
let pannableAreaW = 0;//
let pannableAreaH = 0;//
let minScrollableAreaX = 0; // calculate
let minScrollableAreaY = 0; // calculate
let minScrollableAreaW = 0;//
let minScrollableAreaH = 0;//
let canvasBorderW = 0;//(minScrollableAreaW - App.canvas.width) / 2;
let canvasBorderWR = 0;
let canvasBorderH = 0;//(minScrollableAreaH - App.canvas.height) / 2;
let canvasBorderHB = 0;
let currentScrollableAreaX = 0;
let currentScrollableAreaY = 0;
let containerInnerRect = null;

async function updateCoords() {
	containerInnerRect = await App.Widgets.overlayCanvasWidget.GetBoundingClientRectAsync();
	viewportW = containerInnerRect.width;
	viewportH = containerInnerRect.height;
	minScrollableAreaX = Math.floor(viewportW / 2); // const (until viewport size changes)
	minScrollableAreaY = Math.floor(viewportH / 2);
	minScrollableAreaW = Math.max(App.canvas.width, viewportW);
	minScrollableAreaH = Math.max(App.canvas.height, viewportH);
	pannableAreaW = minScrollableAreaW + viewportW;
	pannableAreaH = minScrollableAreaH + viewportH;
	canvasBorderW = (minScrollableAreaW - App.canvas.width) / 2;
	let canvasBorderWRemainer = canvasBorderW - Math.floor(canvasBorderW);
	canvasBorderWR = canvasBorderW + canvasBorderWRemainer;
	canvasBorderW -= canvasBorderWRemainer;
	canvasBorderH = (minScrollableAreaH - App.canvas.height) / 2;
	let canvasBorderHRemainer = canvasBorderH - Math.floor(canvasBorderH);
	canvasBorderHB = canvasBorderH + canvasBorderHRemainer;
	canvasBorderH -= canvasBorderHRemainer;
}
updateCoords();

async function setViewport(_viewportX, _viewportY) {
	let containerState = await App.Widgets.canvasContainer.GetStateAsync();
	containerState.containerScrollX = null;
	containerState.containerScrollY = null;
	UI.SetBufferCommands(true);
	if(_viewportX !== null) {
		viewportX = Math.floor(_viewportX);
		if(viewportX < 0)
			viewportX = 0;
		let maxX = pannableAreaW - viewportW;
		viewportX = Math.floor(Math.min(maxX, viewportX));
		currentScrollableAreaX = Math.min(minScrollableAreaX, viewportX);
		let bleft = 0;
		let bright = 0;
		if(viewportX < minScrollableAreaX)
			bleft = minScrollableAreaX - viewportX;
		else if(viewportX + viewportW > minScrollableAreaX + minScrollableAreaW)
			bright = (viewportX + viewportW) - (minScrollableAreaX + minScrollableAreaW);// + 2;
		bleft = Math.floor(bleft);
		bright = Math.ceil(bright);
		containerState.containerScrollX = viewportX - minScrollableAreaX;
		App.Widgets.canvasWidget.SetStyle(["border-left:"   + (canvasBorderW + bleft)    + "px solid transparent;",
									       "border-right:"  + (canvasBorderWR + bright)  + "px solid transparent;"]);
	}
	if(_viewportY !== null) {
		viewportY = Math.floor(_viewportY);
		if(viewportY < 0)
			viewportY = 0;
		let maxY = pannableAreaH - viewportH;
		viewportY = Math.floor(Math.min(maxY, viewportY));
		currentScrollableAreaY = Math.min(minScrollableAreaY, viewportY);
		let btop = 0;
		let bbottom = 0;
		if(viewportY < minScrollableAreaY)
			btop = minScrollableAreaY - viewportY;
		else if(viewportY + viewportH > minScrollableAreaY + minScrollableAreaH)
			bbottom = (viewportY + viewportH) - (minScrollableAreaY + minScrollableAreaH);// + 2;
		btop = Math.floor(btop);
		bbottom = Math.ceil(bbottom);
		containerState.containerScrollY = viewportY - minScrollableAreaY;
		App.Widgets.canvasWidget.SetStyle(["border-top:"    + (canvasBorderH + btop)     + "px solid transparent;",
									       "border-bottom:" + (canvasBorderHB + bbottom) + "px solid transparent;"]);
	}
	App.Widgets.canvasContainer.SetState(containerState);
	UI.SetBufferCommands(false);
}

App.Widgets.overlayCanvasWidget.OnJsEvent("mousedown",  UI.OtherEventsEnum.Queue, ["offsetX", "offsetY", "button"], async function(ev) {
	if(ev.data.button === 1) { // middle
		panning = true;
		App.Widgets.overlayCanvasWidget.LockCursor("move");
		panStartX = ev.data.offsetX;
		panStartY = ev.data.offsetY;
		viewportXStart = viewportX;
		viewportYStart = viewportY;
	}
	else if(App.currentTool)
		await App.currentTool.MouseDown(ev.data.offsetX, ev.data.offsetY, ev.data.offsetX, ev.data.offsetY, ev.data.button);
});

function removeStyle(styles, styleName) {
	let idx = styles.findIndex(s => s.startsWith(styleName + ":"));
		if(idx >= 0)
			styles.splice(idx, 1);
}

function debg(msg) {
		let x = {
			     viewportX				:viewportX          ,
			     viewportY				:viewportY	        ,
			     viewportW				:viewportW          ,
			     viewportH				:viewportH          ,
			     pannableAreaW			:pannableAreaW      ,
			     pannableAreaH			:pannableAreaH      ,
			     minScrollableAreaX		:minScrollableAreaX ,
			     minScrollableAreaY		:minScrollableAreaY ,
			     minScrollableAreaW		:minScrollableAreaW ,
			     minScrollableAreaH		:minScrollableAreaH ,
			     canvasBorderW			:canvasBorderW      ,
			     canvasBorderH			:canvasBorderH      ,
			     containerInnerRect		:containerInnerRect ,
		};
	console.log(msg + " " + JSON.stringify(x));
};
App.Widgets.overlayCanvasWidget.OnJsEvent("mousemove", UI.OtherEventsEnum.Queue, ["offsetX", "offsetY"], async function(ev) {
	if(panning) {
		let deltaX = ev.data.offsetX - panStartX;
		let deltaY = ev.data.offsetY - panStartY;
		await setViewport(viewportXStart - deltaX, viewportYStart - deltaY);
	}
	App.Widgets.statusBarText2.SetData({text: "(" + ev.data.offsetX + ", " + ev.data.offsetY + ")" });
	if(App.currentTool)
		await App.currentTool.MouseMove(ev.data.offsetX, ev.data.offsetY, ev.data.offsetX, ev.data.offsetY);
});
App.Widgets.overlayCanvasWidget.OnJsEvent("mouseup", UI.OtherEventsEnum.Queue, ["offsetX", "offsetY", "button"], async function(ev) {
	if(ev.data.button === 1) { // middle
		panning = false;
		App.Widgets.overlayCanvasWidget.UnlockCursor();
	}
	else if(App.currentTool)
		await App.currentTool.MouseUp(ev.data.offsetX, ev.data.offsetY, ev.data.offsetX, ev.data.offsetY, ev.data.button);
});
App.Widgets.overlayCanvasWidget.OnJsEvent("mouseout", UI.OtherEventsEnum.Queue, null, async function(ev) {
	App.Widgets.statusBarText2.SetData({text: ""});
	if(App.currentTool)
		await App.currentTool.MouseOut();
});
App.Widgets.overlayCanvasWidget.On("resize", UI.OtherEventsEnum.Queue, async(ev) => {
	if(App.overlayCtx === null)
		return;
	App.overlayCanvas.width = ev.data.w;
	App.overlayCanvas.height = ev.data.h;
	App.overlayCtx.clearRect(0, 0, App.overlayCanvas.width, App.overlayCanvas.height);
	// note - resize means canvas can lose bitmap data, needs to be redrawn.
	if(App.currentTool !== null)
		App.currentTool.DrawOverlay();


    let cx = viewportX - minScrollableAreaX - canvasBorderW; // canvas X position relative to viewport top left corner
    let cy = viewportY - minScrollableAreaY - canvasBorderH;
    console.log("viewportX", viewportX, "minScrollableAreaX", minScrollableAreaX, "canvasBorderW", canvasBorderW, "cx", cx);
    console.log("cx,cy", cx, cy, "old vx,vy", viewportX, viewportY);
	await updateCoords();
    cx = cy = 0;
    let newViewportX = cx + minScrollableAreaX + canvasBorderW;
    let newViewportY = cy + minScrollableAreaY + canvasBorderH;
    console.log("new vx,vy", newViewportX, newViewportY);
    setViewport(newViewportX, newViewportY);

    //updateCoords();
});


// init canvas container
App.scrollX = 0;
App.scrollY = 0;
let oldScrollX = 0;
let oldScrollY = 0;
App.Widgets.canvasContainer.On("containerScrollEnd", UI.OtherEventsEnum.Queue, async function(ev) {
	console.log("scrollEnd");
	App.scrollX = ev.data.scrollX;
	App.scrollY = ev.data.scrollY;
	if(!panning) {
		let x = oldScrollX === ev.data.scrollX ? null : currentScrollableAreaX + ev.data.scrollX;
		let y = oldScrollY === ev.data.scrollY ? null : currentScrollableAreaY + ev.data.scrollY;
		await setViewport(x, y);
	}
	
	let containerState = await App.Widgets.canvasContainer.GetStateAsync();
	oldScrollX = containerState.containerScrollX;
	oldScrollY = containerState.containerScrollY;
});


// init tool toolbars
function setTool(tool) {
	if(App.currentTool)
		App.currentTool.Deselect();
	App.currentTool = tool;
	App.Widgets.statusBarText1.SetData({text: tool === null ? "No tool selected" : tool.GetName()});
}
setTool(new Tool_Pen());
App.Widgets.mainToolbar.On("command", UI.OtherEventsEnum.Queue, async (ev) => {
	if(ev.data === "brush")			setTool(null);
	else if(ev.data === "bucket")	setTool(new Tool_Bucket());
	else if(ev.data === "curve")	setTool(null);
	else if(ev.data === "eraser")	setTool(null);
	else if(ev.data === "lens")		setTool(null);
	else if(ev.data === "line")		setTool(null);
	else if(ev.data === "oval")		setTool(null);
	else if(ev.data === "pen")		setTool(new Tool_Pen());
});
App.Widgets.mainToolbar2.On("command", UI.OtherEventsEnum.Queue, async (ev) => {
	if(ev.data === "picker")				setTool(new Tool_Picker());
	else if(ev.data === "polygon")			setTool(null);
	else if(ev.data === "rectangle")		setTool(null);
	else if(ev.data === "roundedRectangle") setTool(null);
	else if(ev.data === "selectRectangle")	setTool(null);
	else if(ev.data === "selectPolygon")	setTool(null);
	else if(ev.data === "spraycan")			setTool(null);
	else if(ev.data === "text")				setTool(null);
});


// init color
//todo? - set color widget color from here, so no need to juggle two default values
App.color1 = "#000000"; // foreground
App.color2 = "#ffffff"; // background
App.Widgets.color1Widget.On("changeColor", UI.OtherEventsEnum.Queue, (ev) => {
	App.color1 = ev.data;
});
App.Widgets.color2Widget.On("changeColor", UI.OtherEventsEnum.Queue, (ev) => {
	App.color2 = ev.data;
});
