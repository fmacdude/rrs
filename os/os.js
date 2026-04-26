"use strict";

class OS {	
	static Init() {
	
	}
	static Launch(appName) {
		console.log("1");
		var proc = this.RunAppFromFolder(appName);
		console.log("2");
		//var appScriptEl = document.getElementById("app-" + appName);
		//if(!appScriptEl) {
		//	console.log("app " + appName + " not found.");
		//	return;
		//}
		//
		//var appJs = appScriptEl.textContent;
		//var workerLibJs = document.getElementById("workerLib").textContent;
		//var proc = this.RunAppString(appName, workerLibJs + appJs);
	}
	
	static RunAppFromFolder(appName) {
		console.log(3);
		var process = new Process(name, null, "./apps/" + appName + ".js");
		console.log(4);
		WorkerCom.Connect(process);
		console.log(5);
		return process;
	}
	
	// todo: prepend workerlib
	static RunAppString(name, appJsString) {
		console.log(6);
		var blob = new Blob([appJsString], { type: "text/javascript" });
		console.log(7);
		// todo deallocate blob (otherwise memory leak?)
		this.RunAppBlob(name, blob);
		console.log(8);
	}
	// todo: prepend workerlib
	static RunAppBlob(name, appJsBlob) {
		console.log(9);
		var process = new Process(name, appJsBlob);
		console.log(10);
		WorkerCom.Connect(process);
		console.log(11);
		return process;
	}
	
	//static #startWorkerFromString(jsString) {
	//	var blob = new Blob([jsString], { type: "text/javascript" });
	//	return this.#startWorkerFromBlob(blob);
	//}
	
	// send event from widget to worker thread
	// widget can be either widget or window
	static FireEvent(widgetOrWindow, evName, data) {
		//console.log("firing event OS.fireevent...", evName, data);
		var process = widgetOrWindow.GetProcess();
		var worker = process.GetWorker();
		let msg = {
			cmd: "event",
			widgetUid: widgetOrWindow.GetUid(), // todo - generalise, allow for container(?) and window events
			eventName: evName,
			data: data
		};
		var deadUids = UI.PopRemovedUids();
		if(deadUids.length)
			msg.deadUids = deadUids;
        //console.log("posting message to worker:" + JSON.stringify(msg));
		worker.postMessage(msg);
	}
}

OS.Init();
