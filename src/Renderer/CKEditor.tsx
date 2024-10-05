import {
	Autoformat,
	Base64UploadAdapter,
	BlockQuote,
	Bold,
	ClassicEditor,
	CloudServices,
	Code,
	CodeBlock,
	Essentials,
	Heading,
	HorizontalLine,
	Image,
	ImageToolbar,
	ImageUpload,
	Italic,
	Link,
	List,
	Markdown,
	Mention,
	Paragraph,
	SourceEditing,
	Strikethrough,
	Table,
	TableToolbar,
	TextTransformation,
	TodoList,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import "./styles/ckeditor.scss";

export async function CreateCkeditor(element: HTMLElement): Promise<ClassicEditor> {
	const editor = await ClassicEditor.create(element, {
		plugins: [
			Autoformat,
			BlockQuote,
			Bold,
			CloudServices,
			Code,
			CodeBlock,
			Essentials,
			Heading,
			HorizontalLine,
			Image,
			ImageToolbar,
			ImageUpload,
			Base64UploadAdapter,
			Italic,
			Link,
			List,
			Markdown,
			Mention,
			Paragraph,
			SourceEditing,
			Strikethrough,
			Table,
			TableToolbar,
			TextTransformation,
			TodoList,
		],
		language: {
			ui: "en",
			content: "ar",
		},
		toolbar: [
			"undo",
			"redo",
			"|",
			"sourceEditing",
			"|",
			"heading",
			"|",
			"bold",
			"italic",
			"strikethrough",
			"code",
			"|",
			"bulletedList",
			"numberedList",
			"todoList",
			"|",
			"link",
			"uploadImage",
			"insertTable",
			"blockQuote",
			"codeBlock",
			"horizontalLine",
		],
		codeBlock: {
			languages: [
				{ language: "css", label: "CSS" },
				{ language: "html", label: "HTML" },
				{ language: "javascript", label: "JavaScript" },
				{ language: "php", label: "PHP" },
			],
		},
		heading: {
			options: [
				{ model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
				{
					model: "heading1",
					view: "h1",
					title: "Heading 1",
					class: "ck-heading_heading1",
				},
				{
					model: "heading2",
					view: "h2",
					title: "Heading 2",
					class: "ck-heading_heading2",
				},
				{
					model: "heading3",
					view: "h3",
					title: "Heading 3",
					class: "ck-heading_heading3",
				},
				{
					model: "heading4",
					view: "h4",
					title: "Heading 4",
					class: "ck-heading_heading4",
				},
				{
					model: "heading5",
					view: "h5",
					title: "Heading 5",
					class: "ck-heading_heading5",
				},
				{
					model: "heading6",
					view: "h6",
					title: "Heading 6",
					class: "ck-heading_heading6",
				},
			],
		},
		image: {
			toolbar: ["imageTextAlternative"],
		},
		table: {
			contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
		},
		ui: {
			//@ts-expect-error
			poweredBy: {
				label: "",
				// side: "right",
			},
		},
	});

	return editor;
}
