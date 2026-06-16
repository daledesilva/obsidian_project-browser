import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
	{
		ignores: [
			"node_modules/**",
			"dist/**",
			"build/**",
			"babel.config.js",
			"esbuild.config.mjs",
			"eslint.config.mjs",
			"scripts/**",
			"qa-test-vault/**",
			"tests/e2e/**",
			"tests/__mocks__/**",
			"wdio.conf.mts",
		],
	},
	...obsidianmd.configs.recommended,
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parserOptions: { project: "./tsconfig.json" },
		},
		rules: {
			"@typescript-eslint/no-empty-function": "off",
		},
	},
]);
