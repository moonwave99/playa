const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');

module.exports = [
	merge(baseConfig.mainConfig, { mode: 'development' }),
	merge(baseConfig.rendererConfig, {
		mode: 'development',
		devtool: 'eval-source-map'
	}),
	merge(baseConfig.aboutConfig, { mode: 'development' })
];
