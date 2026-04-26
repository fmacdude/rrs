import { App } from './app.js';
import { UndoRedo } from './UndoRedo.js';
import { ToolBase } from './ToolBase.js';

export class Tool_Pen extends ToolBase {
	#dragging = false;
	#lastX = null;
	#lastY = null;
	#color = null;
	
	GetName() {
		return "Pen";
	}
	
	constructor() {
		super();
	}
	
	Deselect() {
		if(this.#dragging) {
			App.Widgets.overlayCanvasWidget.UnlockCursor();
		}
		App.overlayCtx.clearRect(0, 0, App.overlayCanvas.width, App.overlayCanvas.height);
	}
	
	MouseDown(x, y, overlayX, overlayY, button) {
		if(button === 0 || button === 2) {
			this.#dragging = true;
			this.#lastX = x - 0.5;
			this.#lastY = y - 0.5;
			this.#color = button === 0 ? App.color1 : App.color2;
			App.Widgets.overlayCanvasWidget.LockCursor("pointer");
		}
	}
	
	MouseMove(x, y, overlayX, overlayY) {
		this.DrawOverlay(overlayX, overlayY);
		
		// draw pen line to canvas...
		if(!this.#dragging)
			return;
		App.ctx.lineWidth = 1;
		App.ctx.strokeStyle = this.#color;
		App.ctx.beginPath(); // Start a new path
		App.ctx.moveTo(this.#lastX, this.#lastY); // Move the pen to (x, y)
		// need to offset by 0.5 for lines with odd number of pixels width, to ensure crisp lines
		App.ctx.lineTo(x - 0.5, y - 0.5); // Draw a line to (x, y)
		App.ctx.stroke(); // Render the path
		this.#lastX = x - 0.5;
		this.#lastY = y - 0.5
	}
	
	MouseUp(x, y, overlayX, overlayY, button) {
		if(button !== 0) //todo what if drawing with right mouse button?
			return;
		this.#dragging = false;
		App.Widgets.overlayCanvasWidget.UnlockCursor();
		UndoRedo.Commit();
	}
	
	MouseOut() {
		//App.overlayCtx.clearRect(0, 0, App.overlayCanvas.width, App.overlayCanvas.height);
	}
	
	#lastOverlayX = null;
	#lastOverlayY = null;
	DrawOverlay(x,y) {
		if((!x && x!==0) || (!y && y!== 0)) {
			x = this.#lastOverlayX;
			y = this.#lastOverlayY;
		}
		else {
			this.#lastOverlayX = x;
			this.#lastOverlayY = y;
		}
		// draw cursor guides
		let ocw = App.overlayCanvas.width;
		let och = App.overlayCanvas.height;
		App.overlayCtx.clearRect(0, 0, ocw, och)
		App.overlayCtx.strokeStyle = "rgba(0,0,0,0.3)";
		
		App.overlayCtx.beginPath();
		App.overlayCtx.moveTo(x - 0.5, 0 - 0.5);
		App.overlayCtx.lineTo(x - 0.5, och - 0.5);
		App.overlayCtx.stroke();
		
		App.overlayCtx.beginPath();
		App.overlayCtx.moveTo(0 - 0.5, y - 0.5);
		App.overlayCtx.lineTo(ocw - 0.5, y - 0.5);
		App.overlayCtx.stroke();
		
		App.overlayCtx.clearRect(x - 5.5, y - 5.5, 10, 10);
	}
}
