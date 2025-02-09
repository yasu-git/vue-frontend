import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier"; // 正しく読み込む

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		files: ["**/*.{js,mjs,cjs,vue}"],
		languageOptions: {
			globals: globals.browser, // ✅ `process` は自動的に含まれるため削除s
			ecmaVersion: "latest",
			sourceType: "module",
		},
	},
	pluginJs.configs.recommended, // JavaScript の基本ルール
	...pluginVue.configs["flat/recommended"], // Vue 3 の推奨ルール
	eslintConfigPrettier, // Prettier ルールを適用
	{
		rules: {
			"vue/multi-word-component-names": "off", // Vue コンポーネントの名前制限を無効化
			"no-console": "warn", // console.log を警告にする
			"no-debugger": "warn", // debugger を警告にする
		},
	},
];
