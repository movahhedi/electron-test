/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 * // Create the browser window.
 * mainWindow = new BrowserWindow({
 * 	width: 800,
 * 	height: 600,
 * 	webPreferences: {
 * 		nodeIntegration: true
 * 	}
 * });
 * ```
 */

import { createRef } from "lestin/jsx-runtime";

import x from "./styles/index.module.scss";

document.body.appendChild(
	<div>
		<h1 class={x.asd}>Hello, Vite!</h1>
		<button
			onClick={async () => {
				const { path, content } = await window.electronAPI.openFile();
				const textAreaRef = createRef<HTMLTextAreaElement>();
				document.body.appendChild(
					<div>
						<h2>{path}</h2>
						<textarea ref={textAreaRef}>{content}</textarea>
						<button
							onClick={() => {
								console.log("Saving file to", path);

								window.electronAPI.saveFile(
									path,
									textAreaRef.current!.value,
								);
							}}
							type="button"
						>
							Save to {path}
						</button>
					</div>,
				);
			}}
			type="button"
		>
			Open Markdown File
		</button>
	</div>,
);

console.log('👋 This message is being logged by "renderer.tsx", included via Vite');
