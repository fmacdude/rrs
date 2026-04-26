import { App } from './app.js';
import { FileOps } from './FileOps.js';

// undo/redo todo:
// - on Undo() or Redo() - if image has been resized, need to resize canvas as appropriate
// - sane memory management - don't want to store too many undo steps for huge image

let undoStack = []; // array of imageDatas
let undoStackIndex = -1; // index of currently shown image in undoStack

export const UndoRedo = {
	Init: function() {
		undoStack = [];
		undoStackIndex = -1;
		UndoRedo.Commit();
		FileOps.Modified = false;
	},
	
	Commit: function(isNew) {
		undoStack.splice(undoStackIndex + 1); // remove any redo items from stack
		
		undoStack.push(App.ctx.getImageData(0, 0, App.canvas.width, App.canvas.height));
		undoStackIndex++;
		FileOps.modified = true;
		updateWidgets();
	},
	
	Undo: function() {
		if(!UndoRedo.CanUndo())
			return;
		App.ctx.putImageData(undoStack[--undoStackIndex], 0, 0);
		FileOps.modified = true;
		updateWidgets();
	},
	
	Redo: function() {
		if(!UndoRedo.CanRedo())
			return;
		App.ctx.putImageData(undoStack[++undoStackIndex], 0, 0);
		FileOps.modified = true;
		updateWidgets();
	},
	
	// todo test
	Revert: function() {
		App.ctx.putImageData(undoStack[undoStackIndex], 0, 0);
	},
	
	CanUndo: function() {
		return undoStack.length && undoStackIndex > 0;
	},
	
	CanRedo: function() {
		return undoStack.length && undoStackIndex < undoStack.length - 1;
	},
};

async function updateWidgets() {
	let canUndo = UndoRedo.CanUndo();
	let canRedo = UndoRedo.CanRedo();
	
	let topToolbarData = await App.Widgets.topToolbar.GetDataAsync();
	let undoButton = topToolbarData.items.find(item => item.command === "undo");
	let redoButton = topToolbarData.items.find(item => item.command === "redo");
	undoButton.disabled = !canUndo;
	redoButton.disabled = !canRedo;
	App.Widgets.topToolbar.SetData(topToolbarData);
	
	let menuData = await App.Widgets.mainMenu.GetDataAsync();
	let editMenu = menuData.items.find(item => item.name === "Edit"); // todo - have ID for top level menus
	let undoItem = editMenu.children.find(item => item.command === "undo");
	let redoItem = editMenu.children.find(item => item.command === "redo");
	undoItem.enabled = canUndo;
	redoItem.enabled = canRedo;
	App.Widgets.mainMenu.SetData(menuData);
}
