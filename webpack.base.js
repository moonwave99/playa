const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PermissionsOutputPlugin = require('webpack-permissions-plugin');
const path = require('path');
const outputFolder = '/_pack';

const mainConfig = {
	entry: './src/main/main.ts',
	target: 'electron-main',
	output: {
		filename: 'main.bundle.js',
		path: __dirname + outputFolder,
	},
	node: {
		__dirname: false,
		__filename: false,
	},
	resolve: {
		extensions: ['.js', '.json', '.ts'],
	},
	externals: {
    pouchdb: "require('pouchdb')",
  },
	module: {
		rules: [{
				// All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
				test: /\.(ts)$/,
				exclude: /node_modules/,
				use: {
					loader: 'ts-loader',
				},
			},
			{
				test: /\.(gif|jpg|png|svg|ico|icns)$/,
				loader: 'file-loader',
				options: {
					name: '[path][name].[ext]',
				},
			},
			{
				test: /\.(eot|ttf|woff|woff2)$/,
				loader: 'file-loader',
				options: {
					name: '[path][name].[ext]',
				},
			},
			{
				test: /\.node$/,
				use: 'native-ext-loader'
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
      APP_NAME: JSON.stringify(require("./package.json").name)
    })
	]
};

const rendererConfig = {
	entry: './src/renderer/index.tsx',
	target: 'electron-renderer',
	output: {
		filename: 'renderer.bundle.js',
		path: __dirname + outputFolder,
	},
	node: {
		__dirname: false,
		__filename: false,
	},
	resolve: {
		extensions: ['.js', '.json', '.ts', '.tsx'],
	},
	module: {
		rules: [{
				// All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
				test: /\.(ts|tsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'ts-loader',
				},
			},
			{
				test: /\.(scss|css)$/,
				use: [
					'style-loader',
					'css-loader?sourceMap',
					'sass-loader?sourceMap',
				],
			},
			{
				test: /\.(gif|jpg|png|svg|ico|icns)$/,
				loader: 'file-loader',
				options: {
					name: '[path][name].[ext]',
				},
			},
			{
				test: /\.(eot|ttf|woff|woff2)$/,
				loader: 'file-loader',
				options: {
					name: '[path][name].[ext]',
				},
			},
			{
				test: /\.node$/,
				use: 'native-ext-loader'
			}
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: path.resolve(__dirname, './src/renderer/index.html'),
		}),
	],
};

module.exports = {
	mainConfig,
	rendererConfig
};
