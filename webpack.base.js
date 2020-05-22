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
		rules: [
			{
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

function generateConfig(target = 'index', rules = {}) {
	return {
		entry: `./src/renderer/${target}.tsx`,
		target: 'electron-renderer',
		output: {
			filename: `${target}.bundle.js`,
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
			rules: [
				{
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
			]
		},
		plugins: [
			new HtmlWebpackPlugin({
				filename: `${target}.html`,
				template: path.resolve(__dirname, `./src/renderer/${target}.html`),
			})
		],
		...rules
	}
}

const rendererConfig = generateConfig('index');
const aboutConfig = generateConfig('about');
const onboardingConfig = generateConfig('onboarding');

module.exports = {
	mainConfig,
	rendererConfig,
	aboutConfig,
	onboardingConfig
};
