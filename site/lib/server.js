const Waffel = require('waffel');
const filters = require('./filters');
const helpers = require('./helpers');

module.exports.startServer = function(port, path, callback) {
  const domain = process.env.DOMAIN || 'localhost';
  const wfl = new Waffel({
    domain: `http://${domain}:${port}`,
    uglyUrls: true,
    filters: filters,
    helpers: helpers,
    watch: true,
    server: true,
    serverConfig: {
      port: port,
      path: path,
      indexPath: `${path}/404.html`
    }
  });
  wfl.on('server:start', callback);
  return wfl.init().then(function() {
    return wfl.generate();
  });
};
