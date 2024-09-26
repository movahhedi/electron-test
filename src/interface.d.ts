// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IElectronAPI {
	openFile: () => Promise<{
		content: string;
		path: string;
	}>;
	saveFile: (path: string, content: string) => Promise<string>;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Window {
		electronAPI: IElectronAPI;
	}
}
