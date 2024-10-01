// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

import { type IElectronApi, type IFile } from "../Basics/interface";
import { IpcCommands } from "../Basics/Ipc";

const electronApi: IElectronApi = {
	openFile: () => ipcRenderer.invoke(IpcCommands.Openfile),
	saveFile: (props: IFile) => ipcRenderer.invoke(IpcCommands.Savefile, props),
	openDevTools: () => ipcRenderer.send(IpcCommands.Opendevtools),
};

contextBridge.exposeInMainWorld("electronApi", electronApi);

/* window.addEventListener("DOMContentLoaded", () => {
	const replaceText = (selector: string, text?: string) => {
		const element = document.getElementById(selector);
		if (element) element.innerText = text || "";
	};

	for (const dependency of ["chrome", "node", "electron"]) {
		replaceText(`${dependency}-version`, process.versions[dependency]);
	}
}); */
