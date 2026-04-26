"use strict";

class SplitPane extends WidgetBase {
	#shadowRoot = null;
	#pane1 = null; // pane1 encloses container1 (think of container1,2 as containers for widgets, not for the pane)
	#pane2 = null; // pane2 encloses container2
	#container1 = null;
	#container2 = null;
	#separator = null;
	
	// config... (see SetConfig() for defaults and notes)
	#pxMode;
	#focusedPane;
	#otherPane;
	#row;
	#snapClose;
	#snapOpen;
	#snapOriginal;
	#snapZoneWidth;
	#originalWidth;
	#separatorWidth;
	#separatorRenderedWidth;
	#minWidth;
	#maxWidth;
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("splitpane", true);
		this.#pane1 = this.#shadowRoot.querySelector('.pane1');
		this.#pane2 = this.#shadowRoot.querySelector('.pane2');
		let container1Element = this.#shadowRoot.querySelector('.pane1-container');
		let container2Element = this.#shadowRoot.querySelector('.pane2-container');
		this.#container1 = this._registerContainer(container1Element, "pane1", "Pane 1");
		this.#container2 = this._registerContainer(container2Element, "pane2", "Pane 2");
		this.#separator = this.#shadowRoot.querySelector('.separator');
		this.#setEventHandlers();
		
		this.SetConfig(super.GetConfig());
        var f = super.GetData();
        //console.log("splitpane: super.GetData=", f);
		this.SetData(f);
		this.SetState(super.GetState());
	}
	
	SetData(data) {
		this._setData(data);
		data = data || {};
		
		// destroy existing...
		this.#container1.Empty();
		this.#container2.Empty();
		
		(data.pane1 || []).forEach((widgetData) => {
			this.#container1.AppendWidget(widgetData);
		});
		(data.pane2 || []).forEach((widgetData) => {
			this.#container2.AppendWidget(widgetData);
		});
        //console.log("splitpane: finished setting data=", data);
	}
	
	GetData() {
        let data = {
            pane1: [],
            pane2: [],
        };
        let widgets = this.#container1.GetWidgets();
        widgets.forEach(w => {
            data.pane1.push(w.GetFullDesc());
        });
        widgets = this.#container2.GetWidgets();
        widgets.forEach(w => {
            data.pane2.push(w.GetFullDesc());
        });
        //console.log("sp: returning: data=", data);
        return data;
    }

	SetConfig(config) {
		this._setConfig(config);
		
		// 0. reset internal configuration to default
		this.#pxMode = false;
		this.#focusedPane = this.#pane1;
		this.#otherPane = this.#pane2;
		this.#row = true;
		this.#snapClose = true;
		this.#snapOpen = true;
		this.#snapOriginal = false;
		this.#snapZoneWidth = 20;
		this.#originalWidth = 50;
		this.#separatorWidth = 6;
		this.#separatorRenderedWidth = null;
		this.#minWidth = 0;
		this.#maxWidth = null;
		
		// 1. read configuration values // todo: sanitise config input values....?
		config = config || {};
		if(config.focusLeftPane !== undefined) {
			this.#focusedPane = !!config.focusLeftPane ? this.#pane1 : this.#pane2;
			this.#otherPane   = !!config.focusLeftPane ? this.#pane2 : this.#pane1;
		}
		if(config.pxMode  		 !== undefined) this.#pxMode 	 	 = !!config.pxMode;
		if(config.width 		 !== undefined) this.#originalWidth  = +config.width;
		if(config.minWidth 		 !== undefined) this.#minWidth  	 = +config.minWidth;
		if(config.maxWidth 		 !== undefined) this.#maxWidth       = config.maxWidth === null ? null : +config.maxWidth;
		if(config.separatorWidth !== undefined) this.#separatorWidth = +config.separatorWidth;
		if(config.snapClose 	 !== undefined) this.#snapClose 	 = !!config.snapClose;
		if(config.snapOpen 	 	 !== undefined) this.#snapOpen	 	 = !!config.snapOpen;
		if(config.snapOriginal 	 !== undefined) this.#snapOriginal 	 = !!config.snapOriginal;
		if(config.snapZoneWidth  !== undefined) this.#snapZoneWidth  = +config.snapZoneWidth;
		if(config.row 			 !== undefined) this.#row 			 = !!config.row;
		
		// 2. use configuration values to set css styles
		// need to set separator style, then read width from getBoundingClientRect(), to get exact rendered width.
		if(this.#row) {
			this.#separator.style.height = null;
			this.#separator.style.width = this.#separatorWidth + "px";
			this.#separator.style.cursor = "ew-resize";
            this.#separator.classList.add("row");
			this.#separator.classList.remove("col");
		}
		else { // column
			this.#separator.style.width = null;
			this.#separator.style.height = this.#separatorWidth + "px";
			this.#separator.style.cursor = "ns-resize";
            this.#separator.classList.remove("row");
			this.#separator.classList.add("col");
		}
		
		//todo test if this is OK, once fixed css loading issue
		this.#separatorRenderedWidth = this.#separatorWidth;
		//this.#separatorRenderedWidth = this.#row
		//	? this.#separator.getBoundingClientRect().width
		//	: this.#separator.getBoundingClientRect().height;
		// (maybe can put this in resizeobserver....?)
		
		this.#focusedPane.style.flexGrow = "0";
		this.#focusedPane.style.flexShrink = "0";
		this.#otherPane.style.flexGrow = "1";
		this.#otherPane.style.flexShrink = "1";
		
		if(this.#row) {
			this.#shadowRoot.host.style.flexDirection = "row";
			
			this.#focusedPane.style.height = null;
			this.#focusedPane.style.minHeight = null;
			this.#focusedPane.style.maxHeight = null;
			this.#focusedPane.style.width = this.#pxMode
				? this.#originalWidth + "px"
				: ("calc(" + this.#originalWidth + "% - " + (this.#separatorRenderedWidth / 2) + "px)");
			this.#focusedPane.style.minWidth = "0";
			this.#focusedPane.style.maxWidth = "calc(100% - " + this.#separatorRenderedWidth + "px)";
			
			this.#otherPane.style.height = null;
			this.#otherPane.style.minHeight = null;
			this.#otherPane.style.maxHeight = null;
			this.#otherPane.style.width = "100%";
			this.#otherPane.style.minWidth = "0";
			this.#otherPane.style.maxWidth = "calc(100% - " + this.#separatorRenderedWidth + "px)";
		}
		else { // column
			this.#shadowRoot.host.style.flexDirection = "column";
			
			this.#focusedPane.style.width = null;
			this.#focusedPane.style.minWidth = null;
			this.#focusedPane.style.maxWidth = null;
			
			this.#focusedPane.style.height = this.#pxMode
				? this.#originalWidth + "px"
				: ("calc(" + this.#originalWidth + "% - " + (this.#separatorRenderedWidth / 2) + "px)");
			this.#focusedPane.style.minHeight = "0";
			this.#focusedPane.style.maxHeight = "calc(100% - " + this.#separatorRenderedWidth + "px)";
			
			this.#otherPane.style.width = null;
			this.#otherPane.style.minWidth = null;
			this.#otherPane.style.maxWidth = null;
			this.#otherPane.style.height = "100%";
			this.#otherPane.style.minHeight = "0";
			this.#otherPane.style.maxHeight = "calc(100% - " + this.#separatorRenderedWidth + "px)";
		}
		
		// 3. apply layout to pane widget containers...
		UI.ApplyContainerLayout(this.#container1.GetElement(), config.pane1ContainerLayout);
		UI.ApplyContainerLayout(this.#container2.GetElement(), config.pane2ContainerLayout);
	}
	
	SetState(state) {
		this._setState(state);
		
		state = state || {};
		if(typeof(state.width) === "number")
			this.#setWidth(state.width, this.#pxMode, null, null, null, false);
	}
	
	// percent: original percent for separator in snapOriginal:true mode.
	// return: pixel value of width of focused pane for this percent, clipped to be 0<px<containerWidth-separatorWidth.
	//         (note: returned pixel value is not pinned to min (ie, 0) or max (ie, containerWidth) if within separator width of either value.)
	#percentToPx(percent, containerWidth) {
		return ((percent/100) * containerWidth) - this.#separatorRenderedWidth/2;
	}
	
	// input: px = pane width in px + mouse drag delta. clipped to 0<px<containerWidth-separatorWidth.
	// output: percentage (eg, 25) to put into style.width = calc(25% - (separatorWidth/2)px).
	// note: percentage is calculated along centre line of separator, hence in width:calc(25% - 4px); we
	//       start from 25% at separator centre line, then subtract 4px (half separator width) to get to the width
	//       we need the pane to be.
	// note: separator still fully visible when pane at 0 or 100% width.
	#pxToPercent(px, containerWidth) {
		return (px + (this.#separatorRenderedWidth / 2)) * 100 / containerWidth;
	}
	
	#setWidth(newWidth, isPx, containerWidth, minWidth, maxWidth, doSnap) {
		if(containerWidth === null)
			containerWidth = this.#row ? this.#shadowRoot.host.getBoundingClientRect().width : this.#shadowRoot.host.getBoundingClientRect().height;
		
		if(minWidth === null)
			minWidth = this.#minWidth;
		if(maxWidth === null && this.#maxWidth !== null)
			maxWidth = this.#maxWidth;
		
		// sanitise new width to be within bounds
		if(minWidth !== null && newWidth < minWidth)
			newWidth = minWidth;
		else if(maxWidth !== null && newWidth > maxWidth)
			newWidth = maxWidth;
		
		// snapping
		if(doSnap && isPx) {
			let snapWidth = this.#snapZoneWidth;
			if(this.#snapClose && newWidth < minWidth + snapWidth)
				newWidth = minWidth;
			else if(this.#snapOpen && newWidth > maxWidth - snapWidth)
				newWidth = maxWidth;
			else if(this.#snapOriginal) { // if % mode, need to convert original % value to px value so can compare:
				let originalWidthPx = this.#originalWidth;
				if(!this.#pxMode)
					originalWidthPx = this.#percentToPx(originalWidthPx, containerWidth);
				if(Math.abs(newWidth - originalWidthPx) < snapWidth)
					newWidth = originalWidthPx;
			}
		}
		
		// if in % mode, convert newWidth from px to percentage, if necessary
		if(!this.#pxMode && isPx) {
			if(newWidth === maxWidth) // if width px was clipped to maxWidth px, set to 100%
				newWidth = Math.min(100, this.#maxWidth === null ? 100 : this.#maxWidth);
			else if(newWidth !== 0)
				newWidth = this.#pxToPercent(newWidth, containerWidth);
		}
		
		this._setState({width: newWidth});
		
		// actually set width style rule on focused pane
		var widthStyle = this.#pxMode
				? newWidth + "px"
				: "calc(" + newWidth + "% - " + (this.#separatorRenderedWidth / 2) + "px)";
		if(this.#row)
			this.#focusedPane.style.width = widthStyle;
		else
			this.#focusedPane.style.height = widthStyle;
	}
	
	#setEventHandlers() {
		this.#separator.onmousedown = (event) => {
			if(event.button !== 0) // only resize with primary button
				return;
				
			this.#separator.classList.add("dragging");
			UI.GetCursorPane().style.display = "block";
			UI.GetCursorPane().style.cursor  = getComputedStyle(event.target).cursor;
			
			var initialWidth = this.#row ? this.#focusedPane.getBoundingClientRect().width : this.#focusedPane.getBoundingClientRect().height;
			var containerWidth = this.#row ? this.#shadowRoot.host.getBoundingClientRect().width : this.#shadowRoot.host.getBoundingClientRect().height;
			var minWidth = this.#minWidth;
			if(!this.#pxMode)
				minWidth = this.#percentToPx(minWidth, containerWidth);
			var maxWidth = containerWidth - this.#separatorRenderedWidth;
			if(this.#maxWidth !== null) {
				let maxWidthPx = this.#maxWidth;
				if(!this.#pxMode)
					maxWidthPx = this.#percentToPx(maxWidthPx, containerWidth);
				maxWidth = Math.min(maxWidthPx, maxWidth);
			}
			
			UI.SetDraggingFunc((ev, finish) => {
				// get new width (in px) for focused pane
				var offsetX = this.#row ? (ev.clientX - event.clientX) : (ev.clientY - event.clientY);
				var newWidthPx = initialWidth;
				if(this.#focusedPane === this.#pane1)
					newWidthPx += offsetX;
				else
					newWidthPx -= offsetX;
				
				this.#setWidth(newWidthPx, true, containerWidth, minWidth, maxWidth, true);
				
				if(finish) {
					this.#separator.classList.remove("dragging");
					UI.GetCursorPane().style.display = null;
					UI.GetCursorPane().style.cursor = null;
				}
			});
		};
	}
}

customElements.define("ui-splitpane", SplitPane);
