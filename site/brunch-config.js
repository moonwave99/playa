const Waffel = require('waffel');
const renderer = require('./lib/renderer');
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
        onCompile: async (generatedFiles) => {
          const wfl = new Waffel({
            domain: 'https://moonwave99.github.com/playa',
            destinationFolder: 'production',
            uglyUrls: true,
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
            helpers
          });
          await wfl.init()
          return wfl.generate();
        }
      }
    }
  }
};
