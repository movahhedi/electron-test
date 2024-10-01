import { defineConfig } from "vite";

export default defineConfig({
	build: {
		target: "esnext", // browsers can handle the latest ES features
	},
	css: {
		modules: {
			scopeBehaviour: "local",
			localsConvention: "camelCase",
		},
	},
});
