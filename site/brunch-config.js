const Waffel = require('waffel');
const filters = require('./lib/filters');
const helpers = require('./lib/helpers');

module.exports = {
  paths: {
    watched: ['app']
  },
  files: {
    javascripts: {
      joinTo: {
        'js/app.js': /^app/,
        'js/vendor.js': /^(?!app\/)/
      }
    },
    stylesheets: {
      joinTo: {
        'css/app.css': /^(vendor|app)/
      }
    }
  },
  server: {
    path: './lib/server.js'
  },
  conventions: {
    assets: /(assets|vendor\/assets|font)/
  },
  plugins: {
    assetsmanager: {
      minTimeSpanSeconds: 10,
      copyTo: {
        '': ['data/images']
      }
    },
    autoReload: {
      enabled: {
        js: true,
        css: true,
        assets: false
      }
    }
  },
  overrides: {
    production: {
      optimize: true,
      sourceMaps: false,
      paths: {
        public: 'production'
      },
      hooks: {
        onCompile: function(generatedFiles) {
          const wfl = new Waffel({
            domain: 'https://moonwave99.github.com/playa',
            destinationFolder: 'production',
            uglyUrls: true,
            filters: filters,
            helpers: helpers
          });
          return wfl.init().then(function() {
            return wfl.generate();
          });
        }
      }
    }
  }
};
