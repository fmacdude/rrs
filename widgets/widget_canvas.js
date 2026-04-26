"use strict";

class UiCanvas extends WidgetBase {
	#shadowRoot = null;
	#canvasEl = null;
	#resizeObserver = null;
	#currentWidth = 0;
	#currentHeight = 0;
	#notifiedWidth = 0;
	#notifiedHeight = 0;
	#offscreenControl = false;
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("uicanvas");
		this.#canvasEl = document.createElement("canvas");
		this.#canvasEl.classList.add("canvas");
		this.#shadowRoot.appendChild(this.#canvasEl);
		
		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());
	}
	
	// Note: only set width/height after getting canvas context, otherwise a lot of undefined/unpredictable
	// behavior. Since context is transferred to offscreen webworker (app thread), this means that we can never
	// set the width/height here - will only set in app thread.
	SetConfig(config) {
		this._setConfig(config);
		config = config || {};
		
		if(isNaN(config.width) || config.width === null) {
			config.width = null;
			this.#currentWidth = 0;
		}
		else
			this.#currentWidth = config.width;
		if(isNaN(config.height) || config.height === null) {
			config.height = null;
			this.#currentHeight = 0;
		}
		else
			this.#currentHeight = config.height;
		
		if(config.smoothScaling === false)
			this.#canvasEl.style.imageRendering = "pixelated";
		else
			this.#canvasEl.style.imageRendering = null;
		
		if(this.#resizeObserver)
			this.#resizeObserver.disconnect();
		if(config.width === null || config.height == null) {
			if(!this.resizeObserver) {
				this.#resizeObserver = new ResizeObserver((entries) => {
					let newWidth = entries[0].contentRect.width;
					let newHeight = entries[0].contentRect.height;
					if(this.GetConfig().width === null && this.#currentWidth !== newWidth)
						this.#currentWidth = newWidth;
					if(this.GetConfig().height === null && this.#currentHeight !== newHeight)
						this.#currentHeight = newHeight;
					this.#notifyResize();
				});
			}
			this.#resizeObserver.observe(this.#shadowRoot.host);
		}
		else
			this.#notifyResize();
	}
	#notifyResize() {
		if(this.#currentWidth !== this.#notifiedWidth || this.#currentHeight !== this.#notifiedHeight) {
			this.#notifiedWidth = this.#currentWidth;
			this.#notifiedHeight = this.#currentHeight;
			if(this.#offscreenControl)
				this.FireEvent("resize", {w: this.#currentWidth, h: this.#currentHeight});
		}
	}
	SetData(data) {
		this._setData(data);
	}
	SetState(state) {
		this._setState(state);
	}
	GetCanvasOffscreen() { // note: can not call more than once..
		this.#offscreenControl = true;
		let offscreenCanvas = this.#canvasEl.transferControlToOffscreen();
		this.#notifiedWidth = this.#currentWidth;
		this.#notifiedHeight = this.#currentHeight;
		return {canvas: offscreenCanvas, w: this.#currentWidth, h: this.#currentHeight};
	}
}

customElements.define("ui-uicanvas", UiCanvas);
