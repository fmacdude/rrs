import { UI, WindowHandle, ContainerHandle, WidgetHandle, FS } from '/lib/workerlib.js';
import { App } from './app.js';
import { UndoRedo }	from './UndoRedo.js';

let currentFileHandle = null;

export const FileOps = {
	modified: false,
	
	New: function() {
		let oldFillStyle = App.ctx.fillStyle;
		App.ctx.fillStyle = App.color2;
		App.ctx.fillRect(0, 0, App.canvas.width, App.canvas.height);
		App.ctx.filStyle = oldFillStyle;
		UndoRedo.Init();
	},
	
	OpenAsync: async function() {
		let path = null;
		if(currentFileHandle !== null) {
			path = await FS.HandleToPathTextAsync(currentFileHandle);
			path = FS.PathTextGetParentPathText(path);
		}
		let newFileHandle = await UI.ShowFileChooserDialogAsync({
										modalParentWin: App.win,
										mode: UI.FileChooserModeEnum.ChooseExistingFile,
										titleText: "Open picture",
										buttonText: "Open",
										existingWarnMessage: null,
										startPath: path,
										fileName: null,
										icon: "svg-actions-document-open",
									});
		if(!newFileHandle)
			return;
		await openAsync(newFileHandle);
	},
	
	SaveAsync: async function() {
		if(currentFileHandle === null)
			currentFileHandle = await UI.ShowFileChooserDialogAsync({
											modalParentWin: App.win,
											mode: UI.FileChooserModeEnum.ChooseExistingOrNewFile,
											titleText: "Save picture",
											buttonText: "Save",
											existingWarnMessage: "File \"_\" exists - overwrite?",
											startPath: "/",
											fileName: "null",
											icon: "svg-actions-document-save-as",
										});
		if(currentFileHandle)
			await saveAsync(currentFileHandle);
	},
	
	SaveAsAsync: async function() {
		let path = null;
		let fileName = null;
		if(currentFileHandle !== null) {
			path = FS.HandleToPathTextAsync(currentFileHandle);
			fileName = currentFileHandle.name;
		}
		path = path || "/";
		
	// options: {
	//     modalParentWin: <window> - if not null, make the dialog box a modal dialog of specified window
	//     mode: <FileChooserModeEnum> - see enum definition
	//     titleText: <string> - text to put on window titlebar
	//     buttonText: <string> - text to put on "OK" button (usually "Save" or "Open")
	//     existingWarnMessage: <string> - if saving over existing file, warn user first with this message
	//     startPath: <string> - path to start in
	//     fileName: <string> - file to pre select
	//     icon: <string> - icon for window
	// }
		let newFileHandle = await UI.ShowFileChooserDialogAsync({
										modalParentWin: App.win,
										mode: UI.FileChooserModeEnum.ChooseExistingOrNewFile,
										titleText: "Save picture as",
										buttonText: "Save",
										existingWarnMessage: "File \"_\" exists - overwrite?",
										startPath: path,
										fileName: fileName,
										icon: "svg-actions-document-save-as",
									});
		if(newFileHandle) {
			currentFileHandle = newFileHandle;
			await saveAsync(currentFileHandle);
		}
	},
}

async function openAsync(fileHandle) {
    let pngFile = null;
	let loadedBitmap = null;
    try {
		pngFile = await fileHandle.getFile(); // get the file as a DOM "File" object (instead of "FileSystemFileHandle" object)
        loadedBitmap = await createImageBitmap(pngFile);
		App.ctx.clearRect(0, 0, App.canvas.width, App.canvas.height);
		App.ctx.drawImage(loadedBitmap, 0,  0);
		UndoRedo.Init();
    }
    catch(e) {
        console.error("Problem opening image. Exception:", e);
    }
	finally {
		if(loadedBitmap)
			loadedBitmap.close(); // will get memory leak without doing this.
	}
}

async function saveAsync(fileHandle) {
	let syncAccessHandle = null;
	try {
		syncAccessHandle = await fileHandle.createSyncAccessHandle() ;
		let blob = await App.canvas.convertToBlob({type: "image/png", quality: 0.9});
		let buffer = await blob.arrayBuffer();
		let view = new Uint8Array(buffer);
		syncAccessHandle.truncate(0); // start with blank file, otherwise write() appends to existing file
		/*let size =*/ syncAccessHandle.write(view);
		syncAccessHandle.flush();
		FileOps.modified = false;
	}
	catch(e) {
		console.error("Problem saving image. Exception:", e);
	}
	finally {
		if(syncAccessHandle)
			syncAccessHandle.close();
	}
}
