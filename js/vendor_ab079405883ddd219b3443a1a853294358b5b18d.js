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

require.register("prismjs/components/prism-jsx.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "prismjs");
  (function() {
    (function(Prism) {

var javascript = Prism.util.clone(Prism.languages.javascript);

Prism.languages.jsx = Prism.languages.extend('markup', javascript);
Prism.languages.jsx.tag.pattern= /<\/?(?:[\w.:-]+\s*(?:\s+(?:[\w.:$-]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s{'">=]+|\{(?:\{(?:\{[^}]*\}|[^{}])*\}|[^{}])+\}))?|\{\s*\.{3}\s*[a-z_$][\w$]*(?:\.[a-z_$][\w$]*)*\s*\}))*\s*\/?)?>/i;

Prism.languages.jsx.tag.inside['tag'].pattern = /^<\/?[^\s>\/]*/i;
Prism.languages.jsx.tag.inside['attr-value'].pattern = /=(?!\{)(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">]+)/i;
Prism.languages.jsx.tag.inside['tag'].inside['class-name'] = /^[A-Z]\w*(?:\.[A-Z]\w*)*$/;

Prism.languages.insertBefore('inside', 'attr-name', {
	'spread': {
		pattern: /\{\s*\.{3}\s*[a-z_$][\w$]*(?:\.[a-z_$][\w$]*)*\s*\}/,
		inside: {
			'punctuation': /\.{3}|[{}.]/,
			'attr-value': /\w+/
		}
	}
}, Prism.languages.jsx.tag);

Prism.languages.insertBefore('inside', 'attr-value',{
	'script': {
		// Allow for two levels of nesting
		pattern: /=(?:\{(?:\{(?:\{[^}]*\}|[^}])*\}|[^}])+\})/i,
		inside: {
			'script-punctuation': {
				pattern: /^=(?={)/,
				alias: 'punctuation'
			},
			rest: Prism.languages.jsx
		},
		'alias': 'language-javascript'
	}
}, Prism.languages.jsx.tag);

// The following will handle plain text inside tags
var stringifyToken = function (token) {
	if (!token) {
		return '';
	}
	if (typeof token === 'string') {
		return token;
	}
	if (typeof token.content === 'string') {
		return token.content;
	}
	return token.content.map(stringifyToken).join('');
};

var walkTokens = function (tokens) {
	var openedTags = [];
	for (var i = 0; i < tokens.length; i++) {
		var token = tokens[i];
		var notTagNorBrace = false;

		if (typeof token !== 'string') {
			if (token.type === 'tag' && token.content[0] && token.content[0].type === 'tag') {
				// We found a tag, now find its kind

				if (token.content[0].content[0].content === '</') {
					// Closing tag
					if (openedTags.length > 0 && openedTags[openedTags.length - 1].tagName === stringifyToken(token.content[0].content[1])) {
						// Pop matching opening tag
						openedTags.pop();
					}
				} else {
					if (token.content[token.content.length - 1].content === '/>') {
						// Autoclosed tag, ignore
					} else {
						// Opening tag
						openedTags.push({
							tagName: stringifyToken(token.content[0].content[1]),
							openedBraces: 0
						});
					}
				}
			} else if (openedTags.length > 0 && token.type === 'punctuation' && token.content === '{') {

				// Here we might have entered a JSX context inside a tag
				openedTags[openedTags.length - 1].openedBraces++;

			} else if (openedTags.length > 0 && openedTags[openedTags.length - 1].openedBraces > 0 && token.type === 'punctuation' && token.content === '}') {

				// Here we might have left a JSX context inside a tag
				openedTags[openedTags.length - 1].openedBraces--;

			} else {
				notTagNorBrace = true
			}
		}
		if (notTagNorBrace || typeof token === 'string') {
			if (openedTags.length > 0 && openedTags[openedTags.length - 1].openedBraces === 0) {
				// Here we are inside a tag, and not inside a JSX context.
				// That's plain text: drop any tokens matched.
				var plainText = stringifyToken(token);

				// And merge text with adjacent text
				if (i < tokens.length - 1 && (typeof tokens[i + 1] === 'string' || tokens[i + 1].type === 'plain-text')) {
					plainText += stringifyToken(tokens[i + 1]);
					tokens.splice(i + 1, 1);
				}
				if (i > 0 && (typeof tokens[i - 1] === 'string' || tokens[i - 1].type === 'plain-text')) {
					plainText = stringifyToken(tokens[i - 1]) + plainText;
					tokens.splice(i - 1, 1);
					i--;
				}

				tokens[i] = new Prism.Token('plain-text', plainText, null, plainText);
			}
		}

		if (token.content && typeof token.content !== 'string') {
			walkTokens(token.content);
		}
	}
};

Prism.hooks.add('after-tokenize', function (env) {
	if (env.language !== 'jsx' && env.language !== 'tsx') {
		return;
	}
	walkTokens(env.tokens);
});

}(Prism));
  })();
});

require.register("prismjs/components/prism-tsx.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "prismjs");
  (function() {
    var typescript = Prism.util.clone(Prism.languages.typescript);
Prism.languages.tsx = Prism.languages.extend('jsx', typescript);
  })();
});

require.register("prismjs/components/prism-typescript.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "prismjs");
  (function() {
    Prism.languages.typescript = Prism.languages.extend('javascript', {
	// From JavaScript Prism keyword list and TypeScript language spec: https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words
	'keyword': /\b(?:abstract|as|async|await|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|is|keyof|let|module|namespace|new|null|of|package|private|protected|public|readonly|return|require|set|static|super|switch|this|throw|try|type|typeof|undefined|var|void|while|with|yield)\b/,
	'builtin': /\b(?:string|Function|any|number|boolean|Array|symbol|console|Promise|unknown|never)\b/,
});

Prism.languages.ts = Prism.languages.typescript;
  })();
});

require.register("prismjs/components/prism-yaml.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "prismjs");
  (function() {
    Prism.languages.yaml = {
	'scalar': {
		pattern: /([\-:]\s*(?:![^\s]+)?[ \t]*[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)[^\r\n]+(?:\2[^\r\n]+)*)/,
		lookbehind: true,
		alias: 'string'
	},
	'comment': /#.*/,
	'key': {
		pattern: /(\s*(?:^|[:\-,[{\r\n?])[ \t]*(?:![^\s]+)?[ \t]*)[^\r\n{[\]},#\s]+?(?=\s*:\s)/,
		lookbehind: true,
		alias: 'atrule'
	},
	'directive': {
		pattern: /(^[ \t]*)%.+/m,
		lookbehind: true,
		alias: 'important'
	},
	'datetime': {
		pattern: /([:\-,[{]\s*(?:![^\s]+)?[ \t]*)(?:\d{4}-\d\d?-\d\d?(?:[tT]|[ \t]+)\d\d?:\d{2}:\d{2}(?:\.\d*)?[ \t]*(?:Z|[-+]\d\d?(?::\d{2})?)?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(?::\d{2}(?:\.\d*)?)?)(?=[ \t]*(?:$|,|]|}))/m,
		lookbehind: true,
		alias: 'number'
	},
	'boolean': {
		pattern: /([:\-,[{]\s*(?:![^\s]+)?[ \t]*)(?:true|false)[ \t]*(?=$|,|]|})/im,
		lookbehind: true,
		alias: 'important'
	},
	'null': {
		pattern: /([:\-,[{]\s*(?:![^\s]+)?[ \t]*)(?:null|~)[ \t]*(?=$|,|]|})/im,
		lookbehind: true,
		alias: 'important'
	},
	'string': {
		pattern: /([:\-,[{]\s*(?:![^\s]+)?[ \t]*)("|')(?:(?!\2)[^\\\r\n]|\\.)*\2(?=[ \t]*(?:$|,|]|}|\s*#))/m,
		lookbehind: true,
		greedy: true
	},
	'number': {
		pattern: /([:\-,[{]\s*(?:![^\s]+)?[ \t]*)[+-]?(?:0x[\da-f]+|0o[0-7]+|(?:\d+\.?\d*|\.?\d+)(?:e[+-]?\d+)?|\.inf|\.nan)[ \t]*(?=$|,|]|})/im,
		lookbehind: true
	},
	'tag': /![^\s]+/,
	'important': /[&*][\w]+/,
	'punctuation': /---|[:[\]{}\-,|>?]|\.\.\./
};

Prism.languages.yml = Prism.languages.yaml;
  })();
});

require.register("prismjs/prism.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "prismjs");
  (function() {
    /* **********************************************
     Begin prism-core.js
********************************************** */

var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function (_self){

// Private helper vars
var lang = /\blang(?:uage)?-([\w-]+)\b/i;
var uniqueId = 0;


var _ = {
	manual: _self.Prism && _self.Prism.manual,
	disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
			} else if (Array.isArray(tokens)) {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).slice(8, -1);
		},

		objId: function (obj) {
			if (!obj['__id']) {
				Object.defineProperty(obj, '__id', { value: ++uniqueId });
			}
			return obj['__id'];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function deepClone(o, visited) {
			var clone, id, type = _.util.type(o);
			visited = visited || {};

			switch (type) {
				case 'Object':
					id = _.util.objId(o);
					if (visited[id]) {
						return visited[id];
					}
					clone = {};
					visited[id] = clone;

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = deepClone(o[key], visited);
						}
					}

					return clone;

				case 'Array':
					id = _.util.objId(o);
					if (visited[id]) {
						return visited[id];
					}
					clone = [];
					visited[id] = clone;

					o.forEach(function (v, i) {
						clone[i] = deepClone(v, visited);
					});

					return clone;

				default:
					return o;
			}
		},

		/**
		 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
		 *
		 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
		 *
		 * @param {Element} element
		 * @returns {string}
		 */
		getLanguage: function (element) {
			while (element && !lang.test(element.className)) {
				element = element.parentElement;
			}
			if (element) {
				return (element.className.match(lang) || [, 'none'])[1].toLowerCase();
			}
			return 'none';
		},

		/**
		 * Returns the script element that is currently executing.
		 *
		 * This does __not__ work for line script element.
		 *
		 * @returns {HTMLScriptElement | null}
		 */
		currentScript: function () {
			if (typeof document === 'undefined') {
				return null;
			}
			if ('currentScript' in document) {
				return document.currentScript;
			}

			// IE11 workaround
			// we'll get the src of the current script by parsing IE11's error stack trace
			// this will not work for inline scripts

			try {
				throw new Error();
			} catch (err) {
				// Get file src url from stack. Specifically works with the format of stack traces in IE.
				// A stack will look like this:
				//
				// Error
				//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
				//    at Global code (http://localhost/components/prism-core.js:606:1)

				var src = (/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(err.stack) || [])[1];
				if (src) {
					var scripts = document.getElementsByTagName('script');
					for (var i in scripts) {
						if (scripts[i].src == src) {
							return scripts[i];
						}
					}
				}
				return null;
			}
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		/**
		 * Insert a token before another token in a language literal
		 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
		 * we cannot just provide an object, we need an object and a key.
		 * @param inside The key (or language id) of the parent
		 * @param before The key to insert before.
		 * @param insert Object with the key/value pairs to insert
		 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
		 */
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];
			var ret = {};

			for (var token in grammar) {
				if (grammar.hasOwnProperty(token)) {

					if (token == before) {
						for (var newToken in insert) {
							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					// Do not insert token which also occur in insert. See #1525
					if (!insert.hasOwnProperty(token)) {
						ret[token] = grammar[token];
					}
				}
			}

			var old = root[inside];
			root[inside] = ret;

			// Update references in other language definitions
			_.languages.DFS(_.languages, function(key, value) {
				if (value === old && key != inside) {
					this[key] = ret;
				}
			});

			return ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function DFS(o, callback, type, visited) {
			visited = visited || {};

			var objId = _.util.objId;

			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					var property = o[i],
					    propertyType = _.util.type(property);

					if (propertyType === 'Object' && !visited[objId(property)]) {
						visited[objId(property)] = true;
						DFS(property, callback, null, visited);
					}
					else if (propertyType === 'Array' && !visited[objId(property)]) {
						visited[objId(property)] = true;
						DFS(property, callback, i, visited);
					}
				}
			}
		}
	},
	plugins: {},

	highlightAll: function(async, callback) {
		_.highlightAllUnder(document, async, callback);
	},

	highlightAllUnder: function(container, async, callback) {
		var env = {
			callback: callback,
			container: container,
			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
		};

		_.hooks.run('before-highlightall', env);

		env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

		_.hooks.run('before-all-elements-highlight', env);

		for (var i = 0, element; element = env.elements[i++];) {
			_.highlightElement(element, async === true, env.callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language = _.util.getLanguage(element);
		var grammar = _.languages[language];

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		// Set language on the parent, for styling
		var parent = element.parentNode;
		if (parent && parent.nodeName.toLowerCase() === 'pre') {
			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
		}

		var code = element.textContent;

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		function insertHighlightedCode(highlightedCode) {
			env.highlightedCode = highlightedCode;

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			_.hooks.run('after-highlight', env);
			_.hooks.run('complete', env);
			callback && callback.call(env.element);
		}

		_.hooks.run('before-sanity-check', env);

		if (!env.code) {
			_.hooks.run('complete', env);
			callback && callback.call(env.element);
			return;
		}

		_.hooks.run('before-highlight', env);

		if (!env.grammar) {
			insertHighlightedCode(_.util.encode(env.code));
			return;
		}

		if (async && _self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				insertHighlightedCode(evt.data);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code,
				immediateClose: true
			}));
		}
		else {
			insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
		}
	},

	highlight: function (text, grammar, language) {
		var env = {
			code: text,
			grammar: grammar,
			language: language
		};
		_.hooks.run('before-tokenize', env);
		env.tokens = _.tokenize(env.code, env.grammar);
		_.hooks.run('after-tokenize', env);
		return Token.stringify(_.util.encode(env.tokens), env.language);
	},

	matchGrammar: function (text, strarr, grammar, index, startPos, oneshot, target) {
		for (var token in grammar) {
			if (!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			var patterns = grammar[token];
			patterns = Array.isArray(patterns) ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				if (target && target == token + ',' + j) {
					return;
				}

				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					greedy = !!pattern.greedy,
					lookbehindLength = 0,
					alias = pattern.alias;

				if (greedy && !pattern.pattern.global) {
					// Without the global flag, lastIndex won't work
					var flags = pattern.pattern.toString().match(/[imsuy]*$/)[0];
					pattern.pattern = RegExp(pattern.pattern.source, flags + 'g');
				}

				pattern = pattern.pattern || pattern;

				// Don’t cache length as it changes during the loop
				for (var i = index, pos = startPos; i < strarr.length; pos += strarr[i].length, ++i) {

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						return;
					}

					if (str instanceof Token) {
						continue;
					}

					if (greedy && i != strarr.length - 1) {
						pattern.lastIndex = pos;
						var match = pattern.exec(text);
						if (!match) {
							break;
						}

						var from = match.index + (lookbehind && match[1] ? match[1].length : 0),
						    to = match.index + match[0].length,
						    k = i,
						    p = pos;

						for (var len = strarr.length; k < len && (p < to || (!strarr[k].type && !strarr[k - 1].greedy)); ++k) {
							p += strarr[k].length;
							// Move the index i to the element in strarr that is closest to from
							if (from >= p) {
								++i;
								pos = p;
							}
						}

						// If strarr[i] is a Token, then the match starts inside another Token, which is invalid
						if (strarr[i] instanceof Token) {
							continue;
						}

						// Number of tokens to delete and replace with the new match
						delNum = k - i;
						str = text.slice(pos, p);
						match.index -= pos;
					} else {
						pattern.lastIndex = 0;

						var match = pattern.exec(str),
							delNum = 1;
					}

					if (!match) {
						if (oneshot) {
							break;
						}

						continue;
					}

					if(lookbehind) {
						lookbehindLength = match[1] ? match[1].length : 0;
					}

					var from = match.index + lookbehindLength,
					    match = match[0].slice(lookbehindLength),
					    to = from + match.length,
					    before = str.slice(0, from),
					    after = str.slice(to);

					var args = [i, delNum];

					if (before) {
						++i;
						pos += before.length;
						args.push(before);
					}

					var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias, match, greedy);

					args.push(wrapped);

					if (after) {
						args.push(after);
					}

					Array.prototype.splice.apply(strarr, args);

					if (delNum != 1)
						_.matchGrammar(text, strarr, grammar, i, pos, true, token + ',' + j);

					if (oneshot)
						break;
				}
			}
		}
	},

	tokenize: function(text, grammar) {
		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		_.matchGrammar(text, strarr, grammar, 0, 0, false);

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	},

	Token: Token
};

_self.Prism = _;

function Token(type, content, alias, matchedStr, greedy) {
	this.type = type;
	this.content = content;
	this.alias = alias;
	// Copy of the full string this token was created from
	this.length = (matchedStr || '').length|0;
	this.greedy = !!greedy;
}

Token.stringify = function(o, language) {
	if (typeof o == 'string') {
		return o;
	}

	if (Array.isArray(o)) {
		return o.map(function(element) {
			return Token.stringify(element, language);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language
	};

	if (o.alias) {
		var aliases = Array.isArray(o.alias) ? o.alias : [o.alias];
		Array.prototype.push.apply(env.classes, aliases);
	}

	_.hooks.run('wrap', env);

	var attributes = Object.keys(env.attributes).map(function(name) {
		return name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
	}).join(' ');

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + (attributes ? ' ' + attributes : '') + '>' + env.content + '</' + env.tag + '>';
};

if (!_self.document) {
	if (!_self.addEventListener) {
		// in Node.js
		return _;
	}

	if (!_.disableWorkerMessageHandler) {
		// In worker
		_self.addEventListener('message', function (evt) {
			var message = JSON.parse(evt.data),
				lang = message.language,
				code = message.code,
				immediateClose = message.immediateClose;

			_self.postMessage(_.highlight(code, _.languages[lang], lang));
			if (immediateClose) {
				_self.close();
			}
		}, false);
	}

	return _;
}

//Get current script and highlight
var script = _.util.currentScript();

if (script) {
	_.filename = script.src;

	if (script.hasAttribute('data-manual')) {
		_.manual = true;
	}
}

if (!_.manual) {
	function highlightAutomaticallyCallback() {
		if (!_.manual) {
			_.highlightAll();
		}
	}

	// If the document state is "loading", then we'll use DOMContentLoaded.
	// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
	// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
	// might take longer one animation frame to execute which can create a race condition where only some plugins have
	// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
	// See https://github.com/PrismJS/prism/issues/2102
	var readyState = document.readyState;
	if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
		document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
	} else {
		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(highlightAutomaticallyCallback);
		} else {
			window.setTimeout(highlightAutomaticallyCallback, 16);
		}
	}
}

return _;

})(_self);

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
	global.Prism = Prism;
}


/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': /<!--[\s\S]*?-->/,
	'prolog': /<\?[\s\S]+?\?>/,
	'doctype': {
		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:(?!<!--)[^"'\]]|"[^"]*"|'[^']*'|<!--[\s\S]*?-->)*\]\s*)?>/i,
		greedy: true
	},
	'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/i,
		greedy: true,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
				inside: {
					'punctuation': [
						/^=/,
						{
							pattern: /^(\s*)["']|["']$/,
							lookbehind: true
						}
					]
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': /&#?[\da-z]{1,8};/i
};

Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
	Prism.languages.markup['entity'];

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
	/**
	 * Adds an inlined language to markup.
	 *
	 * An example of an inlined language is CSS with `<style>` tags.
	 *
	 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
	 * case insensitive.
	 * @param {string} lang The language key.
	 * @example
	 * addInlined('style', 'css');
	 */
	value: function addInlined(tagName, lang) {
		var includedCdataInside = {};
		includedCdataInside['language-' + lang] = {
			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
			lookbehind: true,
			inside: Prism.languages[lang]
		};
		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

		var inside = {
			'included-cdata': {
				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
				inside: includedCdataInside
			}
		};
		inside['language-' + lang] = {
			pattern: /[\s\S]+/,
			inside: Prism.languages[lang]
		};

		var def = {};
		def[tagName] = {
			pattern: RegExp(/(<__[\s\S]*?>)(?:<!\[CDATA\[[\s\S]*?\]\]>\s*|[\s\S])*?(?=<\/__>)/.source.replace(/__/g, tagName), 'i'),
			lookbehind: true,
			greedy: true,
			inside: inside
		};

		Prism.languages.insertBefore('markup', 'cdata', def);
	}
});

Prism.languages.xml = Prism.languages.extend('markup', {});
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;


/* **********************************************
     Begin prism-css.js
********************************************** */

(function (Prism) {

	var string = /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;

	Prism.languages.css = {
		'comment': /\/\*[\s\S]*?\*\//,
		'atrule': {
			pattern: /@[\w-]+[\s\S]*?(?:;|(?=\s*\{))/,
			inside: {
				'rule': /@[\w-]+/
				// See rest below
			}
		},
		'url': {
			pattern: RegExp('url\\((?:' + string.source + '|[^\n\r()]*)\\)', 'i'),
			inside: {
				'function': /^url/i,
				'punctuation': /^\(|\)$/
			}
		},
		'selector': RegExp('[^{}\\s](?:[^{};"\']|' + string.source + ')*?(?=\\s*\\{)'),
		'string': {
			pattern: string,
			greedy: true
		},
		'property': /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
		'important': /!important\b/i,
		'function': /[-a-z0-9]+(?=\()/i,
		'punctuation': /[(){};:,]/
	};

	Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

	var markup = Prism.languages.markup;
	if (markup) {
		markup.tag.addInlined('style', 'css');

		Prism.languages.insertBefore('inside', 'attr-value', {
			'style-attr': {
				pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
				inside: {
					'attr-name': {
						pattern: /^\s*style/i,
						inside: markup.tag.inside
					},
					'punctuation': /^\s*=\s*['"]|['"]\s*$/,
					'attr-value': {
						pattern: /.+/i,
						inside: Prism.languages.css
					}
				},
				alias: 'language-css'
			}
		}, markup.tag);
	}

}(Prism));


/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true,
			greedy: true
		}
	],
	'string': {
		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,
		lookbehind: true,
		inside: {
			'punctuation': /[.\\]/
		}
	},
	'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(?:true|false)\b/,
	'function': /\w+(?=\()/,
	'number': /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'class-name': [
		Prism.languages.clike['class-name'],
		{
			pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,
			lookbehind: true
		}
	],
	'keyword': [
		{
			pattern: /((?:^|})\s*)(?:catch|finally)\b/,
			lookbehind: true
		},
		{
			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
			lookbehind: true
		},
	],
	'number': /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
	'operator': /--|\+\+|\*\*=?|=>|&&|\|\||[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?[.?]?|[~:]/
});

Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*[\s\S]*?\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,
		lookbehind: true,
		greedy: true
	},
	// This must be declared before keyword because we use "function" inside the look-forward
	'function-variable': {
		pattern: /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,
		alias: 'function'
	},
	'parameter': [
		{
			pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,
			inside: Prism.languages.javascript
		},
		{
			pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		}
	],
	'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,
		greedy: true,
		inside: {
			'template-punctuation': {
				pattern: /^`|`$/,
				alias: 'string'
			},
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,
				lookbehind: true,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\${|}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.markup.tag.addInlined('script', 'javascript');
}

Prism.languages.js = Prism.languages.javascript;


/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {
	if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
		return;
	}

	/**
	 * @param {Element} [container=document]
	 */
	self.Prism.fileHighlight = function(container) {
		container = container || document;

		var Extensions = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		Array.prototype.slice.call(container.querySelectorAll('pre[data-src]')).forEach(function (pre) {
			// ignore if already loaded
			if (pre.hasAttribute('data-src-loaded')) {
				return;
			}

			// load current
			var src = pre.getAttribute('data-src');

			var language, parent = pre;
			var lang = /\blang(?:uage)?-([\w-]+)\b/i;
			while (parent && !lang.test(parent.className)) {
				parent = parent.parentNode;
			}

			if (parent) {
				language = (pre.className.match(lang) || [, ''])[1];
			}

			if (!language) {
				var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
				language = Extensions[extension] || extension;
			}

			var code = document.createElement('code');
			code.className = 'language-' + language;

			pre.textContent = '';

			code.textContent = 'Loading…';

			pre.appendChild(code);

			var xhr = new XMLHttpRequest();

			xhr.open('GET', src, true);

			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {

					if (xhr.status < 400 && xhr.responseText) {
						code.textContent = xhr.responseText;

						Prism.highlightElement(code);
						// mark as loaded
						pre.setAttribute('data-src-loaded', '');
					}
					else if (xhr.status >= 400) {
						code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
					}
					else {
						code.textContent = '✖ Error: File does not exist or is empty';
					}
				}
			};

			xhr.send(null);
		});
	};

	document.addEventListener('DOMContentLoaded', function () {
		// execute inside handler, for dropping Event as argument
		self.Prism.fileHighlight();
	});

})();
  })();
});

require.register("stickybits/dist/stickybits.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "stickybits");
  (function() {
    /**
  stickybits - Stickybits is a lightweight alternative to `position: sticky` polyfills
  @version v3.7.4
  @link https://github.com/dollarshaveclub/stickybits#readme
  @author Jeff Wainwright <yowainwright@gmail.com> (https://jeffry.in)
  @license MIT
**/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.stickybits = factory());
}(this, (function () { 'use strict';

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  /*
    STICKYBITS 💉
    --------
    > a lightweight alternative to `position: sticky` polyfills 🍬
    --------
    - each method is documented above it our view the readme
    - Stickybits does not manage polymorphic functionality (position like properties)
    * polymorphic functionality: (in the context of describing Stickybits)
      means making things like `position: sticky` be loosely supported with position fixed.
      It also means that features like `useStickyClasses` takes on styles like `position: fixed`.
    --------
    defaults 🔌
    --------
    - version = `package.json` version
    - userAgent = viewer browser agent
    - target = DOM element selector
    - noStyles = boolean
    - offset = number
    - parentClass = 'string'
    - scrollEl = window || DOM element selector || DOM element
    - stickyClass = 'string'
    - stuckClass = 'string'
    - useStickyClasses = boolean
    - useFixed = boolean
    - useGetBoundingClientRect = boolean
    - verticalPosition = 'string'
    - applyStyle = function
    --------
    props🔌
    --------
    - p = props {object}
    --------
    instance note
    --------
    - stickybits parent methods return this
    - stickybits instance methods return an instance item
    --------
    nomenclature
    --------
    - target => el => e
    - props => o || p
    - instance => item => it
    --------
    methods
    --------
    - .definePosition = defines sticky or fixed
    - .addInstance = an array of objects for each Stickybits Target
    - .getClosestParent = gets the parent for non-window scroll
    - .getTopPosition = gets the element top pixel position from the viewport
    - .computeScrollOffsets = computes scroll position
    - .toggleClasses = older browser toggler
    - .manageState = manages sticky state
    - .removeInstance = removes an instance
    - .cleanup = removes all Stickybits instances and cleans up dom from stickybits
  */
  var Stickybits =
  /*#__PURE__*/
  function () {
    function Stickybits(target, obj) {
      var _this = this;

      var o = typeof obj !== 'undefined' ? obj : {};
      this.version = '3.7.4';
      this.userAgent = window.navigator.userAgent || 'no `userAgent` provided by the browser';
      this.props = {
        customStickyChangeNumber: o.customStickyChangeNumber || null,
        noStyles: o.noStyles || false,
        stickyBitStickyOffset: o.stickyBitStickyOffset || 0,
        parentClass: o.parentClass || 'js-stickybit-parent',
        scrollEl: typeof o.scrollEl === 'string' ? document.querySelector(o.scrollEl) : o.scrollEl || window,
        stickyClass: o.stickyClass || 'js-is-sticky',
        stuckClass: o.stuckClass || 'js-is-stuck',
        stickyChangeClass: o.stickyChangeClass || 'js-is-sticky--change',
        useStickyClasses: o.useStickyClasses || false,
        useFixed: o.useFixed || false,
        useGetBoundingClientRect: o.useGetBoundingClientRect || false,
        verticalPosition: o.verticalPosition || 'top',
        applyStyle: o.applyStyle || function (item, style) {
          return _this.applyStyle(item, style);
        }
        /*
          define positionVal after the setting of props, because definePosition looks at the props.useFixed
          ----
          -  uses a computed (`.definePosition()`)
          -  defined the position
        */

      };
      this.props.positionVal = this.definePosition() || 'fixed';
      this.instances = [];
      var _this$props = this.props,
          positionVal = _this$props.positionVal,
          verticalPosition = _this$props.verticalPosition,
          noStyles = _this$props.noStyles,
          stickyBitStickyOffset = _this$props.stickyBitStickyOffset;
      var verticalPositionStyle = verticalPosition === 'top' && !noStyles ? stickyBitStickyOffset + "px" : '';
      var positionStyle = positionVal !== 'fixed' ? positionVal : '';
      this.els = typeof target === 'string' ? document.querySelectorAll(target) : target;
      if (!('length' in this.els)) this.els = [this.els];

      for (var i = 0; i < this.els.length; i++) {
        var _styles;

        var el = this.els[i];
        var instance = this.addInstance(el, this.props); // set vertical position

        this.props.applyStyle({
          styles: (_styles = {}, _styles[verticalPosition] = verticalPositionStyle, _styles.position = positionStyle, _styles),
          classes: {}
        }, instance);
        this.manageState(instance); // instances are an array of objects

        this.instances.push(instance);
      }
    }
    /*
      setStickyPosition ✔️
      --------
      —  most basic thing stickybits does
      => checks to see if position sticky is supported
      => defined the position to be used
      => stickybits works accordingly
    */


    var _proto = Stickybits.prototype;

    _proto.definePosition = function definePosition() {
      var stickyProp;

      if (this.props.useFixed) {
        stickyProp = 'fixed';
      } else {
        var prefix = ['', '-o-', '-webkit-', '-moz-', '-ms-'];
        var test = document.head.style;

        for (var i = 0; i < prefix.length; i += 1) {
          test.position = prefix[i] + "sticky";
        }

        stickyProp = test.position ? test.position : 'fixed';
        test.position = '';
      }

      return stickyProp;
    }
    /*
      addInstance ✔️
      --------
      — manages instances of items
      - takes in an el and props
      - returns an item object
      ---
      - target = el
      - o = {object} = props
        - scrollEl = 'string' | object
        - verticalPosition = number
        - off = boolean
        - parentClass = 'string'
        - stickyClass = 'string'
        - stuckClass = 'string'
      ---
      - defined later
        - parent = dom element
        - state = 'string'
        - offset = number
        - stickyStart = number
        - stickyStop = number
      - returns an instance object
    */
    ;

    _proto.addInstance = function addInstance(el, props) {
      var _this2 = this;

      var item = {
        el: el,
        parent: el.parentNode,
        props: props
      };

      if (props.positionVal === 'fixed' || props.useStickyClasses) {
        this.isWin = this.props.scrollEl === window;
        var se = this.isWin ? window : this.getClosestParent(item.el, item.props.scrollEl);
        this.computeScrollOffsets(item);
        this.toggleClasses(item.parent, '', props.parentClass);
        item.state = 'default';
        item.stateChange = 'default';

        item.stateContainer = function () {
          return _this2.manageState(item);
        };

        se.addEventListener('scroll', item.stateContainer);
      }

      return item;
    }
    /*
      --------
      getParent 👨‍
      --------
      - a helper function that gets the target element's parent selected el
      - only used for non `window` scroll elements
      - supports older browsers
    */
    ;

    _proto.getClosestParent = function getClosestParent(el, match) {
      // p = parent element
      var p = match;
      var e = el;
      if (e.parentElement === p) return p; // traverse up the dom tree until we get to the parent

      while (e.parentElement !== p) {
        e = e.parentElement;
      } // return parent element


      return p;
    }
    /*
      --------
      getTopPosition
      --------
      - a helper function that gets the topPosition of a Stickybit element
      - from the top level of the DOM
    */
    ;

    _proto.getTopPosition = function getTopPosition(el) {
      if (this.props.useGetBoundingClientRect) {
        return el.getBoundingClientRect().top + (this.props.scrollEl.pageYOffset || document.documentElement.scrollTop);
      }

      var topPosition = 0;

      do {
        topPosition = el.offsetTop + topPosition;
      } while (el = el.offsetParent);

      return topPosition;
    }
    /*
      computeScrollOffsets 📊
      ---
      computeScrollOffsets for Stickybits
      - defines
        - offset
        - start
        - stop
    */
    ;

    _proto.computeScrollOffsets = function computeScrollOffsets(item) {
      var it = item;
      var p = it.props;
      var el = it.el;
      var parent = it.parent;
      var isCustom = !this.isWin && p.positionVal === 'fixed';
      var isTop = p.verticalPosition !== 'bottom';
      var scrollElOffset = isCustom ? this.getTopPosition(p.scrollEl) : 0;
      var stickyStart = isCustom ? this.getTopPosition(parent) - scrollElOffset : this.getTopPosition(parent);
      var stickyChangeOffset = p.customStickyChangeNumber !== null ? p.customStickyChangeNumber : el.offsetHeight;
      var parentBottom = stickyStart + parent.offsetHeight;
      it.offset = !isCustom ? scrollElOffset + p.stickyBitStickyOffset : 0;
      it.stickyStart = isTop ? stickyStart - it.offset : 0;
      it.stickyChange = it.stickyStart + stickyChangeOffset;
      it.stickyStop = isTop ? parentBottom - (el.offsetHeight + it.offset) : parentBottom - window.innerHeight;
    }
    /*
      toggleClasses ⚖️
      ---
      toggles classes (for older browser support)
      r = removed class
      a = added class
    */
    ;

    _proto.toggleClasses = function toggleClasses(el, r, a) {
      var e = el;
      var cArray = e.className.split(' ');
      if (a && cArray.indexOf(a) === -1) cArray.push(a);
      var rItem = cArray.indexOf(r);
      if (rItem !== -1) cArray.splice(rItem, 1);
      e.className = cArray.join(' ');
    }
    /*
      manageState 📝
      ---
      - defines the state
        - normal
        - sticky
        - stuck
    */
    ;

    _proto.manageState = function manageState(item) {
      var _this3 = this;

      // cache object
      var it = item;
      var p = it.props;
      var state = it.state;
      var stateChange = it.stateChange;
      var start = it.stickyStart;
      var change = it.stickyChange;
      var stop = it.stickyStop; // cache props

      var pv = p.positionVal;
      var se = p.scrollEl;
      var sticky = p.stickyClass;
      var stickyChange = p.stickyChangeClass;
      var stuck = p.stuckClass;
      var vp = p.verticalPosition;
      var isTop = vp !== 'bottom';
      var aS = p.applyStyle;
      var ns = p.noStyles;
      /*
        requestAnimationFrame
        ---
        - use rAF
        - or stub rAF
      */

      var rAFStub = function rAFDummy(f) {
        f();
      };

      var rAF = !this.isWin ? rAFStub : window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || rAFStub;
      /*
        define scroll vars
        ---
        - scroll
        - notSticky
        - isSticky
        - isStuck
      */

      var scroll = this.isWin ? window.scrollY || window.pageYOffset : se.scrollTop;
      var notSticky = scroll > start && scroll < stop && (state === 'default' || state === 'stuck');
      var isSticky = isTop && scroll <= start && (state === 'sticky' || state === 'stuck');
      var isStuck = scroll >= stop && state === 'sticky';
      /*
        Unnamed arrow functions within this block
        ---
        - help wanted or discussion
        - view test.stickybits.js
          - `stickybits .manageState  `position: fixed` interface` for more awareness 👀
      */

      if (notSticky) {
        it.state = 'sticky';
      } else if (isSticky) {
        it.state = 'default';
      } else if (isStuck) {
        it.state = 'stuck';
      }

      var isStickyChange = scroll >= change && scroll <= stop;
      var isNotStickyChange = scroll < change / 2 || scroll > stop;

      if (isNotStickyChange) {
        it.stateChange = 'default';
      } else if (isStickyChange) {
        it.stateChange = 'sticky';
      } // Only apply new styles if the state has changed


      if (state === it.state && stateChange === it.stateChange) return;
      rAF(function () {
        var _styles2, _classes, _styles3, _extends2, _classes2, _style$classes;

        var stateStyles = {
          sticky: {
            styles: (_styles2 = {
              position: pv,
              top: '',
              bottom: ''
            }, _styles2[vp] = p.stickyBitStickyOffset + "px", _styles2),
            classes: (_classes = {}, _classes[sticky] = true, _classes)
          },
          default: {
            styles: (_styles3 = {}, _styles3[vp] = '', _styles3),
            classes: {}
          },
          stuck: {
            styles: _extends((_extends2 = {}, _extends2[vp] = '', _extends2), pv === 'fixed' && !ns || !_this3.isWin ? {
              position: 'absolute',
              top: '',
              bottom: '0'
            } : {}),
            classes: (_classes2 = {}, _classes2[stuck] = true, _classes2)
          }
        };

        if (pv === 'fixed') {
          stateStyles.default.styles.position = '';
        }

        var style = stateStyles[it.state];
        style.classes = (_style$classes = {}, _style$classes[stuck] = !!style.classes[stuck], _style$classes[sticky] = !!style.classes[sticky], _style$classes[stickyChange] = isStickyChange, _style$classes);
        aS(style, item);
      });
    }
    /*
      applyStyle
      ---
      - apply the given styles and classes to the element
    */
    ;

    _proto.applyStyle = function applyStyle(_ref, item) {
      var styles = _ref.styles,
          classes = _ref.classes;
      // cache object
      var it = item;
      var e = it.el;
      var p = it.props;
      var stl = e.style; // cache props

      var ns = p.noStyles;
      var cArray = e.className.split(' '); // Disable due to bug with old versions of eslint-scope and for ... in
      // https://github.com/eslint/eslint/issues/12117
      // eslint-disable-next-line no-unused-vars

      for (var cls in classes) {
        var addClass = classes[cls];

        if (addClass) {
          if (cArray.indexOf(cls) === -1) cArray.push(cls);
        } else {
          var idx = cArray.indexOf(cls);
          if (idx !== -1) cArray.splice(idx, 1);
        }
      }

      e.className = cArray.join(' ');

      if (styles['position']) {
        stl['position'] = styles['position'];
      }

      if (ns) return; // eslint-disable-next-line no-unused-vars

      for (var key in styles) {
        stl[key] = styles[key];
      }
    };

    _proto.update = function update(updatedProps) {
      var _this4 = this;

      if (updatedProps === void 0) {
        updatedProps = null;
      }

      this.instances.forEach(function (instance) {
        _this4.computeScrollOffsets(instance);

        if (updatedProps) {
          // eslint-disable-next-line no-unused-vars
          for (var updatedProp in updatedProps) {
            instance.props[updatedProp] = updatedProps[updatedProp];
          }
        }
      });
      return this;
    }
    /*
      removes an instance 👋
      --------
      - cleanup instance
    */
    ;

    _proto.removeInstance = function removeInstance(instance) {
      var _styles4, _classes3;

      var e = instance.el;
      var p = instance.props;
      this.applyStyle({
        styles: (_styles4 = {
          position: ''
        }, _styles4[p.verticalPosition] = '', _styles4),
        classes: (_classes3 = {}, _classes3[p.stickyClass] = '', _classes3[p.stuckClass] = '', _classes3)
      }, instance);
      this.toggleClasses(e.parentNode, p.parentClass);
    }
    /*
      cleanup 🛁
      --------
      - cleans up each instance
      - clears instance
    */
    ;

    _proto.cleanup = function cleanup() {
      for (var i = 0; i < this.instances.length; i += 1) {
        var instance = this.instances[i];

        if (instance.stateContainer) {
          instance.props.scrollEl.removeEventListener('scroll', instance.stateContainer);
        }

        this.removeInstance(instance);
      }

      this.manageState = false;
      this.instances = [];
    };

    return Stickybits;
  }();
  /*
    export
    --------
    exports StickBits to be used 🏁
  */


  function stickybits(target, o) {
    return new Stickybits(target, o);
  }

  return stickybits;

})));
  })();
});
require.alias("prismjs/prism.js", "prismjs");
require.alias("stickybits/dist/stickybits.js", "stickybits");require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

