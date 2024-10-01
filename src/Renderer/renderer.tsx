import DOMPurify from "dompurify";
import * as Monaco from "monaco-editor";
import { compileStringAsync } from "sass";
import { ShowSuccessToast } from "toastification";

import ArticleStyles from "./styles/article.scss?inline";
import x from "./styles/index.module.scss";

// import "vazirmatn/Vazirmatn-font-face.css";
import("@fortawesome/fontawesome-free/css/all.min.css");

import { createRef } from "lestin/jsx-runtime";
import { Marked } from "marked";
import MarkedAlert from "marked-alert";
//@ts-expect-error
import MarkedBidi from "marked-bidi";
import { gfmHeadingId } from "marked-gfm-heading-id";

import { type IFile } from "../Basics/interface";

import { FontAwesome } from "./FontAwesome";

import "toastification/Toast.css";
import { CreateCkeditor } from "./CKEditor";

//@ts-expect-error
const articleCss = await compileStringAsync(ArticleStyles);

let currentFile: IFile;

const marked = new Marked({
	pedantic: false,
	gfm: true,
	breaks: true,
}).use(
	MarkedBidi(),
	MarkedAlert(),
	// markedEmoji({}),
	gfmHeadingId(),
	// markedHighlight({
	// 	 highlight:
	// }),
);

// each of these can be toggled on or off
// toggle buttons will have a class of .active if they are active

//#region Toggle buttons
let showMonacoEditor = true,
	showRtlEditor = true,
	showCkEditor = true,
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
	showPreview = true;
	previewBoxRef.current!.style.display = "block";
	togglePreviewButtonRef.current!.classList.add(x.active);

	// render the preview
	RenderPreviewWithContent();
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
	rtlEditorRef.current!.value = content;
}

function SetCkEditorContent(content: string) {
	ckeditor.setData(content);
}
//#endregion

async function RenderPreviewWithContent() {
	const content = monacoEditor.getValue();
	RenderPreview(content);
}

async function RenderPreview(contentRaw: string) {
	if (!showPreview) return;

	// remove front matter
	const contentWithoutFrontmatter = contentRaw.replace(
		/^---\n([\s\S\r\n]*?)\n---[\r?\n?]/,
		"",
	);

	const content = await marked.parse(contentWithoutFrontmatter, {
		pedantic: false,
		gfm: true,
		breaks: true,
	});

	const cleanContent = DOMPurify.sanitize(content, {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		FORCE_BODY: true,
	});

	// previewContentRef.current!.innerHTML = cleanContent;

	const contentWithStyle = `${cleanContent}<style>${articleCss.css}</style>`;

	const dataUri =
		"data:text/html;charset=utf-8," + encodeURIComponent(contentWithStyle);

	previewContentRef.current!.src = dataUri;
}

async function OnOpenFile() {
	// ShowInfoToast("Opening file dialog");

	currentFile = await window.electronApi.openFile();

	// get the file name from the path. The path maybe separated by / or \
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

	SetMonacoEditorContent(currentFile.content);
	SetRtlEditorContent(currentFile.content);
	RenderPreview(currentFile.content);

	// render the markdown preview onChange of the editor (after 500ms of no input)
	monacoEditor.onDidChangeModelContent(() => {
		const content = monacoEditor.getValue();
		RenderPreview(content);
		SetRtlEditorContent(content);
	});

	monacoEditor.focus();

	/* document.body.appendChild(
		<div>
			<button
				onClick={() => {
					console.log("Saving file to", path);
					// const content = textAreaRef.current!.value;
					const content = monacoEditor.getValue();

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
						const content = monacoEditor.getValue();

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
						class={[x.headerButton, showPreview && x.active]}
						ref={toggleCkEditorButtonRef}
						onClick={ToggleMonacoEditor}
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
						const content = rtlEditorRef.current!.value;
						SetMonacoEditorContent(content);
						RenderPreview(content);
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
	value: 'console.log("Hello, world");',
	language: "markdown",
	theme: "vs-dark",
	automaticLayout: true,
	minimap: {
		enabled: false,
	},
	unusualLineTerminators: "off",
	fontFamily: `Consolas, "Vazir Code", monospace`,
});
monacoEditor.addCommand(Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.KeyS, () => {
	ShowSuccessToast("Saved");
});

// set zoom level
monacoEditor.updateOptions({
	fontSize: 15,
});

monacoEditor.focus();

monacoEditor.layout();

function SetTitle(title: string) {
	document.title = title + " - Markeed";
}

// listen for F12 to open dev tools on window
window.addEventListener("keypress", (e) => {
	console.log(e.key);

	if (e.key === "F12") {
		// open dev tools
		window.electronApi.openDevTools();
	}
});

const ckeditor = await CreateCkeditor(ckeditorRef.current!);

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
