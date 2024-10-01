/* eslint-env node */

// import { defineConfig } from "cspell";
// export default defineConfig({

module.exports = {
	version: "0.2",
	ignorePaths: ["node_modules/**", "**/vendor/**", "temp/**", "dist/**", "build/**"],
	minWordLength: 4,
	allowCompoundWords: true,
	dictionaryDefinitions: [
		{
			name: "Common",
			path: "./.cspell/Common.txt",
			addWords: true,
		},
	],
	dictionaries: ["Common"],
	words: [],
	ignoreWords: [],
	import: [],
};

// });
