
class Process {
	static #nextPid = 0;
	
	#pid = null;
	#name = null;
	#worker = null;
	
	#wins = [];
	
	constructor(name, appJsBlob, appJsPath) {
		console.log("p1");
		this.#pid = Process.#nextPid++;
		this.#name = name;
		console.log("going to make new worker... blob=", appJsBlob, "path=", appJsPath);
		this.#worker = appJsBlob ? Process.#startWorkerFromJsBlob(appJsBlob) : Process.#startWorkerFromJsPath(appJsPath);
		console.log("p2");
	}
	
	static #startWorkerFromJsBlob(jsBlob) {
		// todo - not used for now...
		console.log("p3");
		var blobUrl = window.URL.createObjectURL(jsBlob);
		console.log("p4");
		var worker = new Worker(blobUrl); //todo - {type:module}?
		console.log("p5");
		URL.revokeObjectURL(blobUrl);
		console.log("p6");
		return worker;
	}
	static #startWorkerFromJsPath(jsPath) {
		console.log("p7");
		//var blobUrl = window.URL.createObjectURL(jsBlob);
		//console.log("starting worker {type:module} with path:", jsPath);
		var worker = new Worker(jsPath, {type:"module"});
		console.log("p8");
		//URL.revokeObjectURL(blobUrl);
		return worker;
	}
	
	GetWorker() {
		return this.#worker;
	}
	
	GetPid() {
		return this.#pid;
	}
	
	GetName() {
		return this.#name;
	}
	
	GetWindows() {
		return this.#wins.slice(); // copy array
	}
	// todo - are we adding UID...
	AddWindow(win) {
		console.log("p9");
		this.#wins.push(win);
		//console.log("adding window to process... win = ", win, "win.GetId() = ", win.GetId());
	}
	RemoveWindow(win) {
		var i = this.#wins.findIndex((w) => { return w === win; });
		if(i >= 0)
			this.#wins.splice(i,1);
	}


	#doBufferDomUpdates = false;
	#domUpdatesBuffer = [];
	SetBufferDomUpdates(doBuffer) {
		let flush = !doBuffer && this.#doBufferDomUpdates;
		this.#doBufferDomUpdates = doBuffer ? true : false;
		if(flush)
			this.FlushDomUpdates();
	}
	FlushDomUpdates() {
		//console.log("flushing " + this.#domUpdatesBuffer.length + " dom updates...:", this.#domUpdatesBuffer);
		while(this.#domUpdatesBuffer.length)
			this.#domUpdatesBuffer.shift()();
	}
	BufferDomUpdate(callback) {
		if(this.#doBufferDomUpdates) {
			this.#domUpdatesBuffer.push(callback);
			//console.log("buffered dom update: ", callback);
		}
		else
			callback();
	}
	
	
	#doBufferCommands = false;
	#commandsBuffer = [];
	SetBufferCommands(doBuffer) {
		let flush = !doBuffer && this.#doBufferCommands;
		this.#doBufferCommands = doBuffer ? true : false;
		if(flush)
			this.FlushCommands();
	}
	FlushCommands() {
		while(this.#commandsBuffer.length)
			this.#commandsBuffer.shift()();
	}
	BufferCommand(callback) {
		if(this.#doBufferCommands)
			this.#commandsBuffer.push(callback);
		else
			callback();
	}
	
	
	//todo
	//Quit() {
	//    
	//}
	
	Kill() {
		console.log("pkill");
        while(this.#wins.length)
            this.#wins[0].Close(true);
		WM.FocusLast();
		this.#worker.terminate();
	}
}
