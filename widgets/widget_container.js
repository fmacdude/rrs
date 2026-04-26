"use strict";

// config: {
// 		containerLayout: {containerLayout options}
//		
// }
// data: [widget array]
// 

class UiContainer extends WidgetBase {
	#shadowRoot = null;
	#container = null;
	#containerEl = null;
	#ignoreScroll = false;
	#ignoreContainerScroll = false;
	
	constructor() {
		super();
	}
	
	OnConnect() {
		this.#shadowRoot = super.Connect("container", true);
		
		this.#containerEl = document.createElement("div");
		this.#containerEl.classList.add("container");
		this.#shadowRoot.appendChild(this.#containerEl);
		this.#container = this._registerContainer(this.#containerEl);
		
		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());
		
		this.#shadowRoot.host.addEventListener("scroll", (ev) => {
			//if(this.#ignoreScroll) {
			//	this.#ignoreScroll = false;
			//	return;
			//}
			this.FireEvent("scroll", {scrollX: this.#shadowRoot.host.scrollLeft, scrollY: this.#shadowRoot.host.scrollTop});
		});
		this.#shadowRoot.host.addEventListener("scrollend", (ev) => {
			this.FireEvent("scrollend", {scrollX: this.#shadowRoot.host.scrollLeft, scrollY: this.#shadowRoot.host.scrollTop});
		});
		this.#containerEl.addEventListener("scroll", (ev) => {
			//ev.preventDefault();
			//if(this.#ignoreContainerScroll) {
			//	this.#ignoreContainerScroll = false;
			//	return;
			//}
			this.FireEvent("containerScroll", {scrollX: this.#containerEl.scrollLeft, scrollY: this.#containerEl.scrollTop});
		});
		this.#containerEl.addEventListener("scrollend", (ev) => {
			this.FireEvent("containerScrollEnd", {scrollX: this.#containerEl.scrollLeft, scrollY: this.#containerEl.scrollTop});
		});
	}
	
	SetConfig(config) {
		this._setConfig(config);
		config = config || {};
		
		this.#container.GetElement().removeAttribute("style");
		UI.ApplyContainerLayout(this.#container.GetElement(), config.containerLayout);
	}
	
	SetData(data) {
		this._setData(data);
		data = data || [];
		
		this.#container.Empty();
		if(!Array.isArray(data))
            return;
		data.forEach((widgetData) => {
			this.#container.AppendWidget(widgetData);
		});
	}
	
	//#oldState = 
	SetState(state) {
		this._setState(state);
		state = state || {};
		
		if(!isNaN(state.scrollX) && typeof(state.scrollX) === "number") {
			//if(this.#shadowRoot.host.scrolLeft !== state.scrollX)
				this.#ignoreScroll = true;
				this.#shadowRoot.host.scrollLeft = state.scrollX;
			//}
		}
		if(!isNaN(state.scrollY) && typeof(state.scrollY) === "number") {
			//if(this.#shadowRoot.host.scrolTop !== state.scrollY)
				this.#ignoreScroll = true;
			this.#shadowRoot.host.scrollTop = state.scrollY;
		}
		if(!isNaN(state.containerScrollX) && typeof(state.containerScrollX) === "number") {
			this.#ignoreContainerScroll = true;
			this.#containerEl.scrollLeft = state.containerScrollX;
		}
		if(!isNaN(state.containerScrollY) && typeof(state.containerScrollY) === "number") {
			this.#ignoreContainerScroll = true;
			this.#containerEl.scrollTop = state.containerScrollY;
		}
	}
	
	// override WidgetBase.GetData()
	GetData() {
        let data = [];
        let widgets = this.#container.GetWidgets();
        widgets.forEach(w => {
            data.push(w.GetFullDesc());
        });
        return data;
    }
	
	// override WidgetBase.GetState()
	GetState() {
		return {
			scrollX: this.#shadowRoot.host.scrollLeft,
			scrollY: this.#shadowRoot.host.scrollTop,
			containerScrollX: this.#containerEl.scrollLeft,
			containerScrollY: this.#containerEl.scrollTop,
		};
	}
}

customElements.define("ui-container", UiContainer);
