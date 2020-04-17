const Waffel = require('waffel');
const renderer = require('./lib/renderer');
const filters = require('./lib/filters');
const helpers = require('./lib/helpers');
const git = require('./lib/git');

const GIT_REV = process.env.GIT_REV;

module.exports = {
  paths: {
    watched: ['app']
  },
  files: {
    javascripts: {
      joinTo: {
        [`js/app_${GIT_REV}.js`]: /^app/,
        [`js/vendor_${GIT_REV}.js`]: /^(?!app\/)/
      }
    },
    stylesheets: {
      joinTo: {
        [`css/app_${GIT_REV}.css`]: /^(vendor|app)/
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
    },
    sass: {
      includePaths: ['node_modules/prismjs/themes']
    },
    postcss: {
      processors: [
        require('autoprefixer')(['last 8 versions'])
      ]
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
            helpers
          });
          await wfl.init()
          wfl.generate({ data: { git } });
        }
      }
    }
  }
};
