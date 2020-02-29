const Waffel = require('waffel');
const filters = require('./filters');
const helpers = require('./helpers');

module.exports.startServer = async function(port, path, callback) {
  const domain = process.env.DOMAIN || 'localhost';
  const wfl = new Waffel({
    domain: `http://${domain}:${port}`,
    uglyUrls: true,
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
  wfl.generate();
};
