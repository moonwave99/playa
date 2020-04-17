const Waffel = require('waffel');
const renderer = require('./renderer');
const filters = require('./filters');
const helpers = require('./helpers');
const git = require('./git');
const appInfo = require('./appInfo');

module.exports.startServer = async function(port, path, callback) {
  const domain = process.env.DOMAIN || 'localhost';
  const wfl = new Waffel({
    domain: `http://${domain}:${port}`,
    uglyUrls: true,
    versionAssets: true,
    markdownOptions: {
      renderer: renderer()
    },
    prettyHTML: {
      enable: true,
      options: {
        ocd: false
      }
    },
    filters,
    helpers,
    watch: true,
    server: true,
    serverConfig: {
      port,
      path,
      indexPath: `${path}/404.html`
    }
  });
  wfl.on('server:start', callback);
  await wfl.init()
  wfl.generate({
    data: {
      git,
      ...appInfo
    }
  });
};
