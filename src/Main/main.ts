import Fs from "fs";
import Path from "path";

import Electron, { app, BrowserWindow, dialog, globalShortcut, ipcMain } from "electron";
import Squirrel from "electron-squirrel-startup";
import { isBinaryFile } from "isbinaryfile";

import { type IFile } from "../Basics/interface";
import { IpcCommands } from "../Basics/Ipc";
import { Sha512 } from "../Utilities/Hash";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require("electron-squirrel-startup")) {
if (Squirrel) {
	app.quit();
}

async function GetFileData(path: string): Promise<IFile> {
	const content = await Fs.promises.readFile(path, "utf-8");
	// const contentLength = content.length;

	// const stat = await Fs.promises.lstat(path);
	const isBinary = await isBinaryFile(path);

	const hash = Sha512(content);

	return {
		path,
		content,
		hash,
		type: isBinary ? "binary" : "text",
	};
}

async function HandleFileOpen(): Promise<IFile | undefined> {
	const { canceled, filePaths } = await dialog.showOpenDialog({});
	if (canceled) {
		return undefined;
	}

	const path = filePaths[0];
	const fileData = await GetFileData(path);

	return fileData;
}

async function HandleFileSave(
	event: Electron.IpcMainInvokeEvent,
	props: IFile,
): Promise<void> {
	await Fs.promises.writeFile(props.path, props.content, "utf-8");

	// return "Done";
}

function CreateWindow() {
	const { width, height } = Electron.screen.getPrimaryDisplay().workAreaSize;

	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: (width * 3) / 4,
		height: (height * 3) / 4,
		webPreferences: {
			preload: Path.join(__dirname, "preload.js"),
			// nodeIntegration: false,
		},
	});

	globalShortcut.register("CmdOrCtrl+F12", () => {
		mainWindow.isFocused() && mainWindow.webContents.toggleDevTools();
	});
	globalShortcut.register("CmdOrCtrl+Shift+I", () => {
		mainWindow.isFocused() && mainWindow.webContents.toggleDevTools();
	});
	globalShortcut.register("CmdOrCtrl+R", () => {
		mainWindow.isFocused() && mainWindow.reload();
	});
	globalShortcut.register("CmdOrCtrl+Shift+R", () => {
		mainWindow.isFocused() && mainWindow.reload();
	});
	globalShortcut.register("CmdOrCtrl+F5", () => {
		mainWindow.isFocused() && mainWindow.reload();
	});

	// Remove the menu bar
	mainWindow.setMenu(null);

	// Load the index.html of the app.
	//@ts-expect-error
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		//@ts-expect-error
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			//@ts-expect-error
			Path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
		);
	}

	ipcMain.handle(IpcCommands.Openfile, HandleFileOpen);
	ipcMain.handle(IpcCommands.Savefile, HandleFileSave);

	ipcMain.on("openDevTools", () => {
		mainWindow.webContents.openDevTools();
	});

	// Open the DevTools.
	// mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on("ready", createWindow);
app.whenReady().then(() => {
	CreateWindow();

	app.on("activate", () => {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) {
			CreateWindow();
		}
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
