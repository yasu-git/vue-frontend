const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

module.exports = defineConfig({
	transpileDependencies: true,
	lintOnSave: false, // ✅ ESLint を無効化する場合は true にする

	configureWebpack: {
		plugins: [
			new webpack.DefinePlugin({
				'__VUE_OPTIONS_API__': JSON.stringify(true),
				'__VUE_PROD_DEVTOOLS__': JSON.stringify(false),
				'__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(false) // ✅ 追加
			})
		]
	}
});
