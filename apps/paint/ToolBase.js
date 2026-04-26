import { App } from './app.js';

export class ToolBase {
	GetName() {}
	constructor() {}
	Deselect() {}
	MouseDown(x, y, overlayX, overlayY, button) {}
	MouseMove(x, y, overlayX, overlayY) {}
	MouseUp(x, y, overlayX, overlayY, button) {}
	MouseOut() {}
	DrawOverlay() {}
}
