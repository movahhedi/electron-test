// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IElectronApi {
	openDevTools: () => void;
	openFile: () => Promise<IFile>;
	saveFile: (props: IFile) => Promise<string>;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Window {
		electronApi: IElectronApi;
	}
}

export interface IFile {
	content: string;
	hash: string;
	path: string;
	type: "binary" | "text";
}
