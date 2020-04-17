const { version: appVersion, repository } = require('../../package.json');

module.exports = {
  appVersion,
  downloadURL: `${repository}/releases/download/v${appVersion}/Playa-${appVersion}-mac.zip`
}
