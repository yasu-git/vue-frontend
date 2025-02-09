
const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
	mode: "development", // "production" にすると本番用ビルド
	entry: "./src/main.js", // エントリーポイント
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
	},
	resolve: {
		extensions: [".js", ".vue"],
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: "vue-loader",
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
			{
				test: /\.css$/,
				use: ["vue-style-loader", "css-loader"],
			},
		],
	},
	plugins: [new VueLoaderPlugin()],
	devServer: {
		static: path.join(__dirname, "dist"),
		compress: true,
		port: 8080,
	},
};
