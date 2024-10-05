import DOMPurify from "dompurify";
import { Marked } from "marked";
import MarkedAlert from "marked-alert";
import * as Sass from "sass";

import ArticleStyles from "./styles/article.scss?inline";
//@ts-expect-error
import MarkedBidi from "marked-bidi";
import { gfmHeadingId } from "marked-gfm-heading-id";

//@ts-expect-error
export const articleCss = await Sass.compileStringAsync(ArticleStyles);

export const marked = new Marked({
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

export async function MarkdownToHtmlDataUri(contentRaw: string) {
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

	return dataUri;
}
