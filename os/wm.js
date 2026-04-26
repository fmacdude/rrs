
class WM {
	static #nextWinId = 0;
	static #windows = [];
	static #zIndex = 1;
	
	static GetNextZIndex() {
		return this.#zIndex++;
	}
	
	static NewWindow(process, data, modalParentWin, addToTaskbar) {
		var win = UiWindow.NewWindow(process, data, modalParentWin);
		this.#windows.push(win);
		if(addToTaskbar !== false) // default (null, undefined etc...) = true
			UI.GetTaskbar().AddWindow(win);
		return win;
	}
	
	static DefocusOthers(win) {
		this.#windows.forEach((w) => {
			if(w === win)
				return;
			w.Defocus(win !== null && w.GetCanRefocus());
		});
	}
	
	static KillAutoRefocus() {
		this.#windows.forEach((w) => {
			if(!w.GetFocused())
				w.SetCanAutoRefocus(false);
		});
	}
	
	static FocusLast() {
		// focus window with highest zIndex that is not minimized.
		var win = null;
		this.#windows.filter((w) => { return !w.GetMinimized() && w.GetCanRefocus(); })
					.forEach((w) => {
						if(win === null || w.GetZIndex() > win.GetZIndex())
							win = w;
					});
		if(win)
			win.Focus();
	}
	
	// should only be called from inside window.Close()
	// todo tidy up structure around closing windows
	static RemoveWindow(win, force) {
		UI.GetTaskbar().RemoveWindow(win);
		var i = this.#windows.findIndex((w) => { return w === win; });
		this.#windows.splice(i, 1);
		
		if(force)
			return;
		if(win.GetModalParentWin()) {
			let modalParent = win.GetModalParentWin()
			modalParent.OnModalChildClose();
			modalParent.Focus();
		}
		else
			this.FocusLast();
	}
	
	// todo don't return snap points for windows that are obscured behind other windows
	static GetXSnapPoints(win) {
		var points = [];
		points.push(0);
		var screenWidth = UI.GetScreenWidth();
		points.push(screenWidth);
		var winRect = win.GetPos();
		this.#windows.forEach((w) => {
			if(w === win || w.GetMinimized() || w.GetMaximized())
				return;
			var wRect = w.GetPos();
			if(winRect.y > wRect.y + wRect.h || winRect.y + winRect.h < wRect.y)
				return;
			if(wRect.x > 0)
				points.push(wRect.x);
			if(wRect.x + wRect.w < screenWidth)
				points.push(wRect.x + wRect.w);
		});
		return points;
	}
	static GetYSnapPoints(win) {
		var points = [];
		points.push(0);
		var screenHeight = UI.GetScreenHeight() - UI.GetTaskbar().GetHeight();
		points.push(screenHeight);
		var winRect = win.GetPos();
		this.#windows.forEach((w) => {
			if(w === win || w.GetMinimized() || w.GetMaximized())
				return;
			var wRect = w.GetPos();
			if(winRect.x > wRect.x + wRect.w || winRect.x + winRect.w < wRect.x)
				return;
			if(wRect.y > 0)
				points.push(wRect.y);
			if(wRect.y + wRect.h < screenHeight)
				points.push(wRect.y + wRect.h);
		});
		return points;
	}
}
