import { UI, WindowHandle, ContainerHandle, WidgetHandle, FS } from '/lib/workerlib.js';
import { App } from './app.js';
import { UndoRedo } from './UndoRedo.js';

export async function Filter_GaussianBlur() {
	// 1. get x,y radius from user
	let xyRadii = await GetRadii();
	
	// 2. construct 1d kernel for x,y planes
	let xKernel = makeKernel(xyRadii[0]);
	let yKernel = makeKernel(xyRadii[1]);
	
	// 3. perform 1d gaussian blur in x plane
	
	
	// 4. then perform 1d gaussian blur in y plane (equivalent to single 2d gaussian blur, but faster)
	
	
}

async function GetRadii() {
	let winDef = {"config":{"title":"Gaussian blur","icon":"Camera",fitInitialContent:true,resizable:false,x:"center",y:"center","containerLayout":{"flexDirection":"column"}},"data":[
		{"widget":"uilabel",config:{width:"350px",},"data":{"text":"Enter X, Y radii for gaussian blur:"},"layout":{"positionFlex":{"alignSelf":"left"},"margin":["20px","20px","5px","20px"]}},
		{"widget":"textinput","config":{"id":"x"},"state":{"text":"5"},"layout":{"border":["2","1","1","2"],"margin":["","20px","20px","20px"]}},
		{"widget":"textinput","config":{"id":"y"},"state":{"text":"5"},"layout":{"border":["2","1","1","2"],"margin":["","20px","20px","20px"]}},
		{"widget":"container","config":{"containerLayout":{"flexDirection":"row","justifyContent":"right"}},"data":[
			{"widget":"uibutton","config":{"id":"ok"},"data":{"text":"OK"},"layout":{"positionFlex":{"alignSelf":"flex-end"},"margin":["","20px","20px","20px"]}},
			{"widget":"uibutton","config":{"mode":"normal","id":"cancel"},"data":{"text":"Cancel"},"layout":{"margin":["","20px","20px",""]}}
		]}],
		"events":["minimize","maximize","close","quit"]};
	let win = await App.win.NewChildModalWindowAsync(winDef);
	let xWidget = await win.WidgetAsync("x");
	let yWidget = await win.WidgetAsync("y");
	let ok = await win.WidgetAsync("ok");
	let cancel = await win.WidgetAsync("cancel");
	
	let resolveFunc = null;
	ok.On("click", UI.OtherEventsEnum.Cull, async (ev) => {
		let x = (await xWidget.GetStateAsync()).text;
		if(!x)
			x = null;
		
		let y = (await yWidget.GetStateAsync()).text;
		if(!y)
			y = null;
		
		resolveFunc([x,y]);
		win.Close();
	});
	cancel.On("click", UI.OtherEventsEnum.Cull, (ev) => {
		resolveFunc(null);
		win.Close();
	});
	win.On("requestClose", UI.OtherEventsEnum.Cull, (ev) => {
		resolveFunc(null);
		win.Close();
	});
	return new Promise((resolve, reject) => {
		resolveFunc = resolve;
	});
}

function makeKernel(radius) {
	
}
