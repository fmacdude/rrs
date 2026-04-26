"use strict";

class Tabs extends WidgetBase {
	#shadowRoot = null;
	#tabsContainers = [];
	#focusedRow = null;
	#tabs = [];
	#selectedTab = null;
	#containers = [];
	#childWidgets = [];
	#tabRightMargin = null;
	#resizeObserver = null;
	#widthsCalculated = false;
	#oldTabDatas = [];

	constructor() {
		super();
	}
	
	// todo: don't crash with 0 tabs
	OnConnect() {
		this.#shadowRoot = super.Connect("tabs", true);
		this.#tabsContainers.push(this.#shadowRoot.querySelector(".tabs"));
		
		this.SetConfig(super.GetConfig());
		this.SetData(super.GetData());
		this.SetState(super.GetState());
	}
	
	SetConfig(config) {
		this._setConfig(config);
		
	}

	SetData(data) {
        //console.log("\n\nwidget_tabs.js: setting data=", data);
        data = data || {};
		
        let containersByFid = {};

		// destroy existing state/data
		this.#focusedRow = null;
		this.#selectedTab = null;
		this.#tabs = [];
		while(this.#tabsContainers.length > 1)
			this.#tabsContainers.pop().remove();
		this.#tabsContainers[0].replaceChildren(); // remove everything inside

        // save old containers for now, but remove elements from DOM...
        let oldTabDatas = ((super.GetData() || {}).items || []);
        //console.log("a1: this.#oldTabDatas=", this.#oldTabDatas);
        //console.log("a2: this.#containers=", this.#containers);
        for(let i = this.#oldTabDatas.length - 1; i >= 0; i--) {
            //console.log("i=", i);
            let c = this.#containers.pop();
            let fid = this.#oldTabDatas[i]._containerFid;
            containersByFid[fid] = c;
            c.GetElement().remove();
        }

		this.#widthsCalculated = false;
		if(this.#resizeObserver)
			this.#resizeObserver.disconnect();
        if(!data.items)
            return;

        // create new tabs...
        let i = 0;
		data.items.forEach((tabData) => {
			var tabData = data.items[i];
            if(!tabData._containerFid)
                tabData._containerFid = Math.random() + "";
			var tabEl = document.createElement("div");
			tabEl.classList.add("tab");
			tabEl.innerText = tabData.name || ("Tab " + (i + 1));
			tabEl.id_ = tabData.id;
			tabEl.tabNum = i++;

            let existingContainer = containersByFid[tabData._containerFid];
            let container = null;
            let content = null;
            if(existingContainer) {
                container = existingContainer;
                content = container.GetElement();
                container.SetName(tabData.name || ("Tab " + i));
                container.SetId(tabData.id);
            }
            else {
                content = document.createElement("div");
                content.classList.add("tabcontent");
                container = this._registerContainer(content, tabData.id, tabData.name || ("Tab " + i));
                containersByFid[tabData._containerFid] = container;
            }
            this.#containers.push(container);

			//console.log("applying container layout", tabData.containerLayout, "to ", content);
			UI.ApplyContainerLayout(content, tabData.containerLayout);
			content.style.display = "none";
            if(!existingContainer) {
                (tabData.contents || []).forEach((widgetData) => {
                    container.AppendWidget(widgetData);
                });
            }
			tabEl.addEventListener("mousedown", (ev) => {
				if(ev.button !== 0)
					return; // only open tab with left click
				this.#setTab(tabEl);
			});
			this.#tabsContainers[0].appendChild(tabEl);
			this.#tabs.push(tabEl);
			this.#shadowRoot.appendChild(content);
		});


		this.#selectedTab = this.#tabsContainers[0].children.length > 0 ? this.#tabsContainers[0].children[0] : null;
		
		let cssLoaded = false;
		if(!this.resizeObserver) {
			this.#resizeObserver = new ResizeObserver((entries) => {
				if(!cssLoaded) {
					let stylesheets = this.#shadowRoot.styleSheets;
					for(let sheetNo = 0; sheetNo < stylesheets.length && !cssLoaded; sheetNo++) {
						let rules = stylesheets[sheetNo].rules;
						for(let ruleNo = 0; ruleNo < rules.length && !cssLoaded; ruleNo++) {
							let rule = rules[ruleNo];
							if(rule.selectorText.indexOf(".tabs") >= 0)
								cssLoaded = true;
						}
					}
				}
				if(!cssLoaded)
					return; // stylesheet not loaded yet, tabs won't have correct widths // todo - this is only needed if loading stylesheet via <link> tag
				var containerWidth = entries[0].contentRect.width;
				if(containerWidth === 0)
					return; // hidden, wait till visible to calculate widths
				this.#onResizeTabs(containerWidth);
			});
		}
		this.#resizeObserver.observe(this.#tabsContainers[0]);

        //console.log("widget_tabs.js: final set data=", data);
		this._setData(data);
        this.#oldTabDatas = data.items || [];
	}
	
	GetData() {
        let data = super.GetData() || {};
        data.items = data.items || [];
        for(let i = 0; i < data.items.length; i++) {
            let tabData = data.items[i];
            tabData.contents = [];
            let widgets = this.#containers[i].GetWidgets();
            widgets.forEach(w => {
                tabData.contents.push(w.GetFullDesc());
            });
        }
        //console.log("tabs widget: returning: data=", data);
        return data;
    }

	#onResizeTabs = (containerWidth) => {
		// need to always calculate tab widths before first tab selected, as selected tab style is a bit wider
		if(!this.#widthsCalculated) { // this code only runs once.
			this.#widthsCalculated = true;
			let i = 0;
			this.#tabs.forEach((t) => {
				t.widthPx = t.getBoundingClientRect().width; // TODO is this potentially buggy if adding/removing tabs if already have existing tabs? eg, need to set flexShrink to 0 first, then back to 1, for existing tabs?
				if(this.#tabRightMargin === null)
					this.#tabRightMargin = parseFloat(getComputedStyle(t).marginRight); // maybe there is a better way to do this...
			});
			// initially, have flexShrink set to 0, so that we can read the normal (un-shrunk) tab width.
			// only reason for setting flexShrink to 1 afterwards is for graceful behaviour when tabs
			// container is shrunk to a very narrow width.
			this.#tabs.forEach((t) => {
				t.style.flexShrink = 1;
			});
			this.#findRows(containerWidth);
			this.#setTab(this.#selectedTab); // calls focusRow
		}
		else {
			this.#findRows(containerWidth);
			this.#focusRow(this.#selectedTab ? this.#tabsContainers[this.#selectedTab.row] : null);
		}
	}
	
	SetState(state) {
		this._setState(state);
		
		var tab = null;
		var selectedTabId = state ? state.selectedTabId : null;
		if(selectedTabId) {
			var data = this.GetData() || {};
			for(var i = 0; i < (data.items || []).length; i++) {
				if(data.items[i].id === selectedTabId) {
                    //console.log("data", data);
                    //console.log("selectedTabId", selectedTabId);
                    //console.log("this.#tabs", this.#tabs, "i=", i);
					tab = this.#tabs[i];
					break;
				}
			}
		}
		if(tab === null)
			tab = this.#tabs[0];
		
		// cannot set tab as selected before resizeObserver has triggered....
		// check if it has not triggered, then just set selectedTab = ... and quit.
		// the resizeObserver will call #setTab() for us.
		if(this.#widthsCalculated)
			this.#setTab(tab);
		else
			this.#selectedTab = tab;
	}
	
	#findRows(rowWidth) {
		var oldSingleRow = null;
		if(this.#tabsContainers.length === 1)
			oldSingleRow = this.#tabsContainers[0];
		var currentRowWidth = 0;
		var row = 0;
		var tab = null;
		var rowEmpty = true;
		for(var i = 0; i < this.#tabs.length; i++) {
			tab = this.#tabs[i];
			if(currentRowWidth + tab.widthPx + this.#tabRightMargin <= rowWidth) { // put on current row
				currentRowWidth += tab.widthPx + this.#tabRightMargin;
				tab.row = row;
			}
			else { // put on next row
				currentRowWidth = tab.widthPx + this.#tabRightMargin;
				tab.row = ++row;
			}
		}
		var nRows = tab ? (tab.row + 1) : 1;
		
		while(this.#tabsContainers.length < nRows) {
			let tc = document.createElement("div");
			tc.classList.add("tabs");
			this.#tabsContainers[this.#tabsContainers.length - 1].after(tc);
			this.#tabsContainers.push(tc);
		}
		while(this.#tabsContainers.length > nRows) {
			this.#tabsContainers[this.#tabsContainers.length - 1].remove();
			this.#tabsContainers.pop();
		}
		if(nRows !== 1 && oldSingleRow)
			oldSingleRow.classList.remove("single");
		else if(nRows === 1 && !oldSingleRow)
			this.#tabsContainers[0].classList.add("single");
		
		for(var i = 0; i < this.#tabs.length; i++) {
			let tab = this.#tabs[i];
			let tc = this.#tabsContainers[tab.row];
			tc.appendChild(tab);
			tc.row = tab.row;
		}
		// don't leave single tab on last row, move one tab from second-last row to accompany it
		// (otherwise 1 tab stretcing to the full length of the container, with another row of squished
		// tabs, looks ugly and not clear that it is a clickable tab)
		var lastRow = this.#tabsContainers[this.#tabsContainers.length - 1];
		if(nRows > 1
		   && (tab.row !== this.#tabs[this.#tabs.length - 2].row)
		   && (this.#tabs[this.#tabs.length - 2].widthPx + tab.widthPx < rowWidth)) {
				lastRow.prepend(this.#tabs[this.#tabs.length - 2]);
				this.#tabs[this.#tabs.length - 2].row = tab.row;
			}
	}
	
	#setTab(tab) {
		if(!tab) {
			this._setState();
			this.#selectedTab = null;
			return;
		}
		if(this.#selectedTab !== null) {
			this.#selectedTab.classList.remove("selected");
			this.#containers[this.#selectedTab.tabNum].GetElement().style.display = "none";
		}
		this.#selectedTab = tab;
		tab.classList.add("selected");
		this.#containers[tab.tabNum].GetElement().style.display = null;
		
		this.#focusRow(this.#tabsContainers[tab.row]);
		
		this._setState({selectedTabId: tab.id_});
	}
	#focusRow(rowEl) {
		if(rowEl === this.#focusedRow || rowEl === null)
			return;
		if(this.#focusedRow !== null) {
			this.#focusedRow.classList.remove("selected");
		}
		this.#focusedRow = rowEl;
		this.#focusedRow.classList.add("selected");
	}
}

customElements.define("ui-tabs", Tabs);
