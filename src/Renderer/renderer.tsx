import { createRef } from "lestin";
import * as Monaco from "monaco-editor";
import { ShowSuccessToast } from "toastification";

import { type IFile } from "../Basics/interface";

import { CreateCkeditor } from "./CKEditor";
import { FontAwesome } from "./FontAwesome";
import { MarkdownToHtmlDataUri } from "./RenderMarkdown";
import x from "./styles/index.module.scss";

import "toastification/Toast.css";
// import "vazirmatn/Vazirmatn-font-face.css";

import("@fortawesome/fontawesome-free/css/all.min.css");

let currentFile: IFile;

const enum EditorType {
	None,
	Monaco,
	Rtl,
	Ck,
	Preview,
}

//#region Toggle buttons
let showMonacoEditor = true,
	showRtlEditor = true,
	showCkEditor = false,
	showPreview = true;

function ShowMonacoEditor() {
	showMonacoEditor = true;
	monacoBoxRef.current!.style.display = "block";
	toggleMonacoEditorButtonRef.current!.classList.add(x.active);
}

function HideMonacoEditor() {
	showMonacoEditor = false;
	monacoBoxRef.current!.style.display = "none";
	toggleMonacoEditorButtonRef.current!.classList.remove(x.active);
}

function ShowRtlEditor() {
	const content = GetMonacoEditorContent();
	SetRtlEditorContent(content);

	showRtlEditor = true;
	rtlEditorBoxRef.current!.style.display = "block";
	toggleRtlEditorButtonRef.current!.classList.add(x.active);
}

function HideRtlEditor() {
	showRtlEditor = false;
	rtlEditorBoxRef.current!.style.display = "none";
	toggleRtlEditorButtonRef.current!.classList.remove(x.active);
}

function ShowCkEditor() {
	const content = GetMonacoEditorContent();
	SetCkEditorContent(content);

	showCkEditor = true;
	ckeditorBoxRef.current!.style.display = "block";
	toggleCkEditorButtonRef.current!.classList.add(x.active);
}

function HideCkEditor() {
	showCkEditor = false;
	ckeditorBoxRef.current!.style.display = "none";
	toggleCkEditorButtonRef.current!.classList.remove(x.active);
}

function ShowPreview() {
	const content = GetMonacoEditorContent();
	RenderPreview(content);

	showPreview = true;
	previewBoxRef.current!.style.display = "block";
	togglePreviewButtonRef.current!.classList.add(x.active);
}

function HidePreview() {
	showPreview = false;
	previewBoxRef.current!.style.display = "none";
	togglePreviewButtonRef.current!.classList.remove(x.active);
}

function ToggleMonacoEditor() {
	if (showMonacoEditor) {
		HideMonacoEditor();
	} else {
		ShowMonacoEditor();
	}
}

function ToggleRtlEditor() {
	if (showRtlEditor) {
		HideRtlEditor();
	} else {
		ShowRtlEditor();
	}
}

function ToggleCkEditor() {
	if (showCkEditor) {
		HideCkEditor();
	} else {
		ShowCkEditor();
	}
}

function TogglePreview() {
	if (showPreview) {
		HidePreview();
	} else {
		ShowPreview();
	}
}

function SetMonacoEditorContent(content: string) {
	monacoEditor.setValue(content);
}

function SetRtlEditorContent(content: string) {
	if (!showRtlEditor) return;
	rtlEditorRef.current!.value = content;
}

function SetCkEditorContent(content: string) {
	if (!showCkEditor) return;
	ckeditor.setData(content);
}

function GetMonacoEditorContent() {
	return monacoEditor.getValue();
}

function GetRtlEditorContent() {
	return rtlEditorRef.current!.value;
}

function GetCkEditorContent() {
	return ckeditor.getData();
}

let onAfterInputTimeout: NodeJS.Timeout | number | undefined;
function OnMonacoEditorChange() {
	if (onAfterInputTimeout) {
		clearTimeout(onAfterInputTimeout);
	}
	onAfterInputTimeout = setTimeout(() => {
		const content = GetMonacoEditorContent();
		SyncEditors(EditorType.Monaco, content);
	}, syncDelay);
}

function OnRtlEditorChange() {
	if (onAfterInputTimeout) {
		clearTimeout(onAfterInputTimeout);
	}
	onAfterInputTimeout = setTimeout(() => {
		const content = GetRtlEditorContent();
		SyncEditors(EditorType.Rtl, content);
	}, syncDelay);
}

function OnCkEditorChange() {
	console.log(123);

	if (onAfterInputTimeout) {
		clearTimeout(onAfterInputTimeout);
	}
	onAfterInputTimeout = setTimeout(() => {
		const content = GetCkEditorContent();
		SyncEditors(EditorType.Ck, content);
	}, syncDelay);
}
//#endregion

async function RenderPreview(content?: string) {
	if (!showPreview) return;

	content ??= GetMonacoEditorContent();
	const dataUri = await MarkdownToHtmlDataUri(content);

	previewContentRef.current!.src = dataUri;
}

const syncDelay = 600;
async function SyncEditors(editor: EditorType = EditorType.None, content?: string) {
	content ??= GetMonacoEditorContent();

	if (editor !== EditorType.Monaco) {
		await SetMonacoEditorContent(content);
	}

	if (editor !== EditorType.Rtl) {
		await SetRtlEditorContent(content);
	}

	if (editor !== EditorType.Ck) {
		await SetCkEditorContent(content);
	}

	await RenderPreview(content);
}

async function OnOpenFile() {
	currentFile = await window.electronApi.openFile();

	// Get the file name from the path. The path maybe separated by / or \
	const fileName = currentFile.path.split(/\\|\//).pop() ?? "Untitled";

	// Get the extension of the file
	const extension = "." + (fileName.split(".").pop() ?? "txt");

	footerFilePathRef.current!.textContent = currentFile.path || "";

	// get the language ID based on the file extension
	const language =
		Monaco.languages
			.getLanguages()
			.find((lang) => lang.extensions?.includes(extension))?.id ?? "plaintext";

	SetTitle(fileName);

	// Set the language of the editor based on the file extension
	Monaco.editor.setModelLanguage(Monaco.editor.getModels()[0], language);

	const content = currentFile.content;
	SyncEditors(EditorType.None, content);

	monacoEditor.focus();

	/* document.body.appendChild(
		<div>
			<button
				onClick={() => {
					console.log("Saving file to", path);
					// const content = textAreaRef.current!.value;
					const content = GetMonacoEditorContent();

					window.electronApi.saveFile(path, content);
				}}
				type="button"
			>
				Save to {path}
			</button>
		</div>,
	); */
}

//#region Refs
const editorsBoxRef = createRef<HTMLDivElement>();
const monacoBoxRef = createRef<HTMLDivElement>();
const rtlEditorBoxRef = createRef<HTMLDivElement>();
const rtlEditorRef = createRef<HTMLTextAreaElement>();
const ckeditorBoxRef = createRef<HTMLDivElement>();
const ckeditorRef = createRef<HTMLDivElement>();
const previewBoxRef = createRef<HTMLDivElement>();
const previewContentRef = createRef<HTMLIFrameElement>();

// toggle buttons ref
const toggleMonacoEditorButtonRef = createRef<HTMLButtonElement>();
const toggleRtlEditorButtonRef = createRef<HTMLButtonElement>();
const toggleCkEditorButtonRef = createRef<HTMLButtonElement>();
const togglePreviewButtonRef = createRef<HTMLButtonElement>();

const footerFilePathRef = createRef<HTMLParagraphElement>();
//#endregion

const bodyContent = (
	<div class={x.bodyBox}>
		<div class={x.header}>
			<div>
				<h1 class={x.markeedName}>Markeed</h1>
			</div>

			<div class={x.headerButtonBox}>
				<button class={[x.headerButton]} onClick={OnOpenFile} type="button">
					<FontAwesome icon="file" />
					Open File
				</button>

				<button
					class={x.headerButton}
					onClick={async () => {
						console.log("Saving file");
						// const content = textAreaRef.current!.value;
						const content = GetMonacoEditorContent();

						window.electronApi.saveFile({
							...currentFile,
							content,
						});
					}}
					type="button"
				>
					<FontAwesome icon="save" />
					Save File
				</button>
			</div>

			<div class={x.toggleViewPart}>
				<h4>Views: </h4>

				<div class={x.headerButtonBox}>
					<button
						class={[x.headerButton, showMonacoEditor && x.active]}
						ref={toggleMonacoEditorButtonRef}
						onClick={ToggleMonacoEditor}
						type="button"
					>
						Code Editor
					</button>
					<button
						class={[x.headerButton, showRtlEditor && x.active]}
						ref={toggleRtlEditorButtonRef}
						onClick={ToggleRtlEditor}
						type="button"
					>
						RTL Editor
					</button>

					<button
						class={[x.headerButton, showCkEditor && x.active]}
						ref={toggleCkEditorButtonRef}
						onClick={ToggleCkEditor}
						type="button"
					>
						CKEditor
					</button>

					<button
						class={[x.headerButton, showPreview && x.active]}
						ref={togglePreviewButtonRef}
						onClick={TogglePreview}
						type="button"
					>
						Markdown Preview
					</button>
				</div>
			</div>
		</div>

		<section class={x.editorsBox} ref={editorsBoxRef}>
			<div class={x.monacoBox} ref={monacoBoxRef} />

			<div class={x.rtlEditorBox} ref={rtlEditorBoxRef}>
				<textarea
					class={x.rtlEditor}
					ref={rtlEditorRef}
					onInput={() => {
						OnRtlEditorChange();
					}}
				></textarea>
			</div>

			<div class={x.ckeditorBox} ref={ckeditorBoxRef}>
				<div class={x.ckeditor} ref={ckeditorRef}></div>
			</div>

			<div class={x.previewBox} ref={previewBoxRef}>
				<iframe
					class={[x.previewContent, "markdown-body"]}
					ref={previewContentRef}
					dir="auto"
				/>
			</div>
		</section>

		<div class={x.footer}>
			<div class={x.footerPart} dir="auto">
				<p class={x.footerFilePath} ref={footerFilePathRef}>
					asd
				</p>
			</div>
		</div>
	</div>
);

document.body.appendChild(bodyContent);

const monacoEditor = Monaco.editor.create(monacoBoxRef.current!, {
	value: "# Hello, World!",
	language: "markdown",
	theme: "vs-dark",
	automaticLayout: true,
	minimap: {
		enabled: false,
	},
	unusualLineTerminators: "off",
	fontFamily: `Consolas, "Vazir Code", monospace`,
	fontSize: 15,
});
monacoEditor.addCommand(Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.KeyS, () => {
	ShowSuccessToast("Saved");
});

monacoEditor.onDidChangeModelContent(OnMonacoEditorChange);

monacoEditor.focus();
monacoEditor.layout();

function SetTitle(title: string) {
	document.title = title + " - Markeed";
}

// listen for F12 to open dev tools on window
window.addEventListener("keypress", (e) => {
	if (e.key === "F12") {
		// open dev tools
		window.electronApi.openDevTools();
	}
});

//@ts-expect-error
const ckeditor = await CreateCkeditor(ckeditorRef.current!);
// ckeditor.on("change", OnCkEditorChange);
// ckeditor.model.document.on("change:data", OnCkEditorChange);
// ckeditor.model.document.on("change", OnCkEditorChange);
// ckeditor.model.document.on("key", OnCkEditorChange);
// ckeditor.on("key", OnCkEditorChange);

if (!showMonacoEditor) {
	HideMonacoEditor();
}

if (!showRtlEditor) {
	HideRtlEditor();
}

if (!showCkEditor) {
	HideCkEditor();
}

if (!showPreview) {
	HidePreview();
}

SyncEditors();

//#region Drag & Resize
/* let isLeftDragging = false;
let isRightDragging = false;

function ResetColumnSizes() {
	// when page resizes return to default col sizes
	const page = document.getElementById("pageFrame");
	page.style.gridTemplateColumns = "2fr 6px 6fr 6px 2fr";
}

function SetCursor(cursor) {
	const page = document.getElementById("page");
	page.style.cursor = cursor;
}

function StartLeftDrag() {
	console.log("mouse down");
	isLeftDragging = true;

	SetCursor("ew-resize");
}

function StartRightDrag() {
	console.log("mouse down");
	isRightDragging = true;

	SetCursor("ew-resize");
}

function EndDrag() {
	console.log("mouse up");
	isLeftDragging = false;
	isRightDragging = false;

	SetCursor("auto");
}

function OnDrag(event) {
	if (isLeftDragging || isRightDragging) {
		console.log("Dragging");
		//console.log(event);

		const page = document.getElementById("page");
		const leftcol = document.getElementById("leftcol");
		const rightcol = document.getElementById("rightcol");

		const leftColWidth = isLeftDragging ? event.clientX : leftcol.clientWidth;
		const rightColWidth = isRightDragging
			? page.clientWidth - event.clientX
			: rightcol.clientWidth;

		const dragbarWidth = 6;

		const cols = [
			leftColWidth,
			dragbarWidth,
			page.clientWidth - 2 * dragbarWidth - leftColWidth - rightColWidth,
			dragbarWidth,
			rightColWidth,
		];

		const newColDefn = cols.map((c) => c.toString() + "px").join(" ");

		console.log(newColDefn);
		page.style.gridTemplateColumns = newColDefn;

		event.preventDefault();
	}
} */
//#endregion
