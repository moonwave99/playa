(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    var val = aliases[name];
    return (val && name !== val) ? expandAlias(val) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("initialize.js", function(exports, require, module) {
const stickybits = require('stickybits');
const prismjs = require('prismjs');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-jsx');
require('prismjs/components/prism-tsx');
require('prismjs/components/prism-yaml');

function shuffleArray(array) {
  const copy = array.slice(0);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function fillAlbumBar({
  element,
  observer,
  images
}) {
  const randomisedImages = shuffleArray(images);
  const { width, height } = element.getBoundingClientRect();
  const albumWidth = height;
  const screenAlbumRatio = window.screen.width / albumWidth;
  const albumCount = Math.ceil(screenAlbumRatio);
  const offset = albumCount - screenAlbumRatio;

  for (let i = 0; i < albumCount; i++) {
    const album = document.createElement('div');
    album.classList.add('album', 'absolute', 'h-100');

    album.style.top = 0;
    album.style.width = `${albumWidth}px`;
    album.style.transform = `translateX(${(i - offset / 2) * albumWidth}px)`;
    const img = document.createElement('img');
    img.onload = () => img.classList.add('loaded');
    img.src = randomisedImages[i % images.length];
    album.appendChild(img);

    element.appendChild(album);
    observer.observe(album);
  }
}

const defaultOptions = {
  hero: {
    interval: 5000
  }
};

module.exports = function(_options){
  window.addEventListener('load', async () => {
    const options = {...defaultOptions, ..._options};
    console.log('App started!', options);

    stickybits('.navigation', { useStickyClasses: true });

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) {
          return;
        }
        setTimeout(() =>target.classList.add('loaded'), Math.random() * 500);
      });
    });

    document
      .querySelectorAll('.album-bar')
      .forEach(element => fillAlbumBar({
        element,
        observer,
        images: [...Array(10).keys()].map(i => `/images/albums/${i}.jpg`)
      }));

    const $screenshots = document.querySelectorAll('.hero-screenshots img');
    $screenshots.forEach(img => {
      img.onload = () => img.classList.add('loaded');
      img.src = img.dataset.src
    });

    let currentScreenshotIndex = 0;
    setInterval(() => {
      $screenshots.forEach((el, index) => el.classList.toggle('loaded', index === currentScreenshotIndex));
      currentScreenshotIndex = (currentScreenshotIndex + 1) % $screenshots.length;
    }, options.hero.interval);
  });
};

});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

