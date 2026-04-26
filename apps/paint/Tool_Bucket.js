import { App } from './app.js';
import { FileOps } from './FileOps.js';
import { ToolBase } from './ToolBase.js';
import { UndoRedo } from './UndoRedo.js';

export class Tool_Bucket extends ToolBase {
	GetName() {
		return "Bucket fill";
	}
	constructor() {
		super();
	}
	Deselect() {
		
	}
	async MouseDown(x, y, overlayX, overlayY, button) {
		if(!(button === 0 || button == 2)) // must be left or right click
			return;
			
		let startColor = App.ctx.getImageData(x, y, 1, 1).data;
		let startR = startColor[0];
		let startG = startColor[1];
		let startB = startColor[2];
		let color = button === 0 ? App.color1 : App.color2;
		let fillR = parseInt(color.substring(1,3), 16);
		let fillG = parseInt(color.substring(3,5), 16);
		let fillB = parseInt(color.substring(5,7), 16);
		if(fillR === startR && fillG === startG && fillB === startB)
			return; // otherwise will form infinite loop
		
		let cw = App.canvas.width;
		let ch = App.canvas.height;
		let tempImage = App.ctx.getImageData(0, 0, cw, ch);
		let fillImage = App.ctx.createImageData(cw, ch);
		function inside(x,y) {
			if(x < 0 || y < 0 || x >= cw || y >= ch)
				return false;
			return tempImage.data[(((cw * y) + x) * 4) + 0] === startR &&
				   tempImage.data[(((cw * y) + x) * 4) + 1] === startG &&
				   tempImage.data[(((cw * y) + x) * 4) + 2] === startB;
		}
		function set(x,y) {
			tempImage.data[(((cw * y) + x) * 4) + 0] = fillR;
			tempImage.data[(((cw * y) + x) * 4) + 1] = fillG;
			tempImage.data[(((cw * y) + x) * 4) + 2] = fillB;
			tempImage.data[(((cw * y) + x) * 4) + 3] = 255;
			fillImage.data[(((cw * y) + x) * 4) + 0] = fillR;
			fillImage.data[(((cw * y) + x) * 4) + 1] = fillG;
			fillImage.data[(((cw * y) + x) * 4) + 2] = fillB;
			fillImage.data[(((cw * y) + x) * 4) + 3] = 255;
		}
		_fill(x, y, inside, set);
		App.ctx.drawImage(await createImageBitmap(fillImage), 0, 0);
		UndoRedo.Commit();
	}
	MouseMove(x, y, overlayX, overlayY) {
		
	}
	MouseUp(x, y, overlayX, overlayY, button) {
		
	}
	MouseOut() {
		
	}
	DrawOverlay() {
		
	}
}

// optimised span fill algorithm: https://en.wikipedia.org/wiki/Flood_fill
function _fill(x, y, insideFunc, setFunc) {
	let Inside = insideFunc;
	let Set = setFunc;
	if(!Inside(x, y))
		return;
	let s = [];
	s.push([x, x, y, 1]);
	s.push([x, x, y-1, -1]);
	while (s.length) {
		let data = s.pop();
		let x1 = data[0];
		let x2 = data[1];
		let y = data[2];
		let dy = data[3];
		
		let x = x1;
		if (Inside(x, y)) {
			while(Inside(x - 1, y)) {
				Set(x - 1, y);
				x--;
			}
			if(x < x1)
				s.push([x, x1-1, y-dy, -dy]);
		}
		while(x1 <= x2) {
			while(Inside(x1, y)) {
				Set(x1, y);
				x1++;
			}
			if(x1 > x)
				s.push([x, x1-1, y+dy, dy]);
			if(x1-1 > x2)
				s.push([x2+1, x1-1, y-dy, -dy]);
			x1++;
			while(x1 < x2 && !Inside(x1, y))
				x1++;
			x = x1;
		}
	}
}
