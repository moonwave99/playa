const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');

module.exports = [
	merge(baseConfig.mainConfig, { mode: 'production' }),
	merge(baseConfig.rendererConfig, { mode: 'production' }),
	merge(baseConfig.aboutConfig, { mode: 'production' }),
	merge(baseConfig.onboardingConfig, { mode: 'production' })
];
