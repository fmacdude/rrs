import { App } from './app.js';
import { ToolBase } from './ToolBase.js';

export class Tool_Picker extends ToolBase {
	GetName() {
		return "Color picker";
	}
	constructor() {
		super();
	}
	Deselect() {
		
	}
	MouseDown(x, y, overlayX, overlayY, button) {
		// set foreground color (or background color if right click)
		let pixelData = App.ctx.getImageData(x, y, 1, 1).data;
		let color = "#" + pixelData[0].toString(16) + pixelData[1].toString(16) + pixelData[2].toString(16);
		
		// todo - need color management module
		if(button == 0) { // left button
			App.Widgets.color1Widget.SetState({color:color});
			App.color1 = color;
		}
		else if(button == 2) { // right button
			App.Widgets.color2Widget.SetState({color:color});
			App.color2 = color;
		}
	}
	MouseMove(x, y, overlayX, overlayY, button) {
		
	}
	MouseUp(x, y, overlayX, overlayY, button) {
		
	}
	MouseOut() {
		
	}
	DrawOverlay() {
		
	}
}
