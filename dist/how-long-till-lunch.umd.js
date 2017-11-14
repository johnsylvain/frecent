(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.howLongUntilLunch = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var assign = make_assign();
var create$1 = make_create();
var trim = make_trim();
var Global = (typeof window !== 'undefined' ? window : commonjsGlobal);

var util = {
	assign: assign,
	create: create$1,
	trim: trim,
	bind: bind$1,
	slice: slice$1,
	each: each$1,
	map: map,
	pluck: pluck$1,
	isList: isList$1,
	isFunction: isFunction$1,
	isObject: isObject$1,
	Global: Global
};

function make_assign() {
	if (Object.assign) {
		return Object.assign
	} else {
		return function shimAssign(obj, props1, props2, etc) {
			for (var i = 1; i < arguments.length; i++) {
				each$1(Object(arguments[i]), function(val, key) {
					obj[key] = val;
				});
			}			
			return obj
		}
	}
}

function make_create() {
	if (Object.create) {
		return function create(obj, assignProps1, assignProps2, etc) {
			var assignArgsList = slice$1(arguments, 1);
			return assign.apply(this, [Object.create(obj)].concat(assignArgsList))
		}
	} else {
		function F() {} // eslint-disable-line no-inner-declarations
		return function create(obj, assignProps1, assignProps2, etc) {
			var assignArgsList = slice$1(arguments, 1);
			F.prototype = obj;
			return assign.apply(this, [new F()].concat(assignArgsList))
		}
	}
}

function make_trim() {
	if (String.prototype.trim) {
		return function trim(str) {
			return String.prototype.trim.call(str)
		}
	} else {
		return function trim(str) {
			return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
		}
	}
}

function bind$1(obj, fn) {
	return function() {
		return fn.apply(obj, Array.prototype.slice.call(arguments, 0))
	}
}

function slice$1(arr, index) {
	return Array.prototype.slice.call(arr, index || 0)
}

function each$1(obj, fn) {
	pluck$1(obj, function(val, key) {
		fn(val, key);
		return false
	});
}

function map(obj, fn) {
	var res = (isList$1(obj) ? [] : {});
	pluck$1(obj, function(v, k) {
		res[k] = fn(v, k);
		return false
	});
	return res
}

function pluck$1(obj, fn) {
	if (isList$1(obj)) {
		for (var i=0; i<obj.length; i++) {
			if (fn(obj[i], i)) {
				return obj[i]
			}
		}
	} else {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (fn(obj[key], key)) {
					return obj[key]
				}
			}
		}
	}
}

function isList$1(val) {
	return (val != null && typeof val != 'function' && typeof val.length == 'number')
}

function isFunction$1(val) {
	return val && {}.toString.call(val) === '[object Function]'
}

function isObject$1(val) {
	return val && {}.toString.call(val) === '[object Object]'
}

var slice = util.slice;
var pluck = util.pluck;
var each = util.each;
var bind = util.bind;
var create = util.create;
var isList = util.isList;
var isFunction = util.isFunction;
var isObject = util.isObject;

var storeEngine = {
	createStore: createStore
};

var storeAPI = {
	version: '2.0.12',
	enabled: false,
	
	// get returns the value of the given key. If that value
	// is undefined, it returns optionalDefaultValue instead.
	get: function(key, optionalDefaultValue) {
		var data = this.storage.read(this._namespacePrefix + key);
		return this._deserialize(data, optionalDefaultValue)
	},

	// set will store the given value at key and returns value.
	// Calling set with value === undefined is equivalent to calling remove.
	set: function(key, value) {
		if (value === undefined) {
			return this.remove(key)
		}
		this.storage.write(this._namespacePrefix + key, this._serialize(value));
		return value
	},

	// remove deletes the key and value stored at the given key.
	remove: function(key) {
		this.storage.remove(this._namespacePrefix + key);
	},

	// each will call the given callback once for each key-value pair
	// in this store.
	each: function(callback) {
		var self = this;
		this.storage.each(function(val, namespacedKey) {
			callback.call(self, self._deserialize(val), (namespacedKey || '').replace(self._namespaceRegexp, ''));
		});
	},

	// clearAll will remove all the stored key-value pairs in this store.
	clearAll: function() {
		this.storage.clearAll();
	},

	// additional functionality that can't live in plugins
	// ---------------------------------------------------

	// hasNamespace returns true if this store instance has the given namespace.
	hasNamespace: function(namespace) {
		return (this._namespacePrefix == '__storejs_'+namespace+'_')
	},

	// createStore creates a store.js instance with the first
	// functioning storage in the list of storage candidates,
	// and applies the the given mixins to the instance.
	createStore: function() {
		return createStore.apply(this, arguments)
	},
	
	addPlugin: function(plugin) {
		this._addPlugin(plugin);
	},
	
	namespace: function(namespace) {
		return createStore(this.storage, this.plugins, namespace)
	}
};

function _warn() {
	var _console = (typeof console == 'undefined' ? null : console);
	if (!_console) { return }
	var fn = (_console.warn ? _console.warn : _console.log);
	fn.apply(_console, arguments);
}

function createStore(storages, plugins, namespace) {
	if (!namespace) {
		namespace = '';
	}
	if (storages && !isList(storages)) {
		storages = [storages];
	}
	if (plugins && !isList(plugins)) {
		plugins = [plugins];
	}

	var namespacePrefix = (namespace ? '__storejs_'+namespace+'_' : '');
	var namespaceRegexp = (namespace ? new RegExp('^'+namespacePrefix) : null);
	var legalNamespaces = /^[a-zA-Z0-9_\-]*$/; // alpha-numeric + underscore and dash
	if (!legalNamespaces.test(namespace)) {
		throw new Error('store.js namespaces can only have alphanumerics + underscores and dashes')
	}
	
	var _privateStoreProps = {
		_namespacePrefix: namespacePrefix,
		_namespaceRegexp: namespaceRegexp,

		_testStorage: function(storage) {
			try {
				var testStr = '__storejs__test__';
				storage.write(testStr, testStr);
				var ok = (storage.read(testStr) === testStr);
				storage.remove(testStr);
				return ok
			} catch(e) {
				return false
			}
		},

		_assignPluginFnProp: function(pluginFnProp, propName) {
			var oldFn = this[propName];
			this[propName] = function pluginFn() {
				var args = slice(arguments, 0);
				var self = this;

				// super_fn calls the old function which was overwritten by
				// this mixin.
				function super_fn() {
					if (!oldFn) { return }
					each(arguments, function(arg, i) {
						args[i] = arg;
					});
					return oldFn.apply(self, args)
				}

				// Give mixing function access to super_fn by prefixing all mixin function
				// arguments with super_fn.
				var newFnArgs = [super_fn].concat(args);

				return pluginFnProp.apply(self, newFnArgs)
			};
		},

		_serialize: function(obj) {
			return JSON.stringify(obj)
		},

		_deserialize: function(strVal, defaultVal) {
			if (!strVal) { return defaultVal }
			// It is possible that a raw string value has been previously stored
			// in a storage without using store.js, meaning it will be a raw
			// string value instead of a JSON serialized string. By defaulting
			// to the raw string value in case of a JSON parse error, we allow
			// for past stored values to be forwards-compatible with store.js
			var val = '';
			try { val = JSON.parse(strVal); }
			catch(e) { val = strVal; }

			return (val !== undefined ? val : defaultVal)
		},
		
		_addStorage: function(storage) {
			if (this.enabled) { return }
			if (this._testStorage(storage)) {
				this.storage = storage;
				this.enabled = true;
			}
		},

		_addPlugin: function(plugin) {
			var self = this;

			// If the plugin is an array, then add all plugins in the array.
			// This allows for a plugin to depend on other plugins.
			if (isList(plugin)) {
				each(plugin, function(plugin) {
					self._addPlugin(plugin);
				});
				return
			}

			// Keep track of all plugins we've seen so far, so that we
			// don't add any of them twice.
			var seenPlugin = pluck(this.plugins, function(seenPlugin) {
				return (plugin === seenPlugin)
			});
			if (seenPlugin) {
				return
			}
			this.plugins.push(plugin);

			// Check that the plugin is properly formed
			if (!isFunction(plugin)) {
				throw new Error('Plugins must be function values that return objects')
			}

			var pluginProperties = plugin.call(this);
			if (!isObject(pluginProperties)) {
				throw new Error('Plugins must return an object of function properties')
			}

			// Add the plugin function properties to this store instance.
			each(pluginProperties, function(pluginFnProp, propName) {
				if (!isFunction(pluginFnProp)) {
					throw new Error('Bad plugin property: '+propName+' from plugin '+plugin.name+'. Plugins should only return functions.')
				}
				self._assignPluginFnProp(pluginFnProp, propName);
			});
		},
		
		// Put deprecated properties in the private API, so as to not expose it to accidential
		// discovery through inspection of the store object.
		
		// Deprecated: addStorage
		addStorage: function(storage) {
			_warn('store.addStorage(storage) is deprecated. Use createStore([storages])');
			this._addStorage(storage);
		}
	};

	var store = create(_privateStoreProps, storeAPI, {
		plugins: []
	});
	store.raw = {};
	each(store, function(prop, propName) {
		if (isFunction(prop)) {
			store.raw[propName] = bind(store, prop);			
		}
	});
	each(storages, function(storage) {
		store._addStorage(storage);
	});
	each(plugins, function(plugin) {
		store._addPlugin(plugin);
	});
	return store
}

var Global$1 = util.Global;

var localStorage_1 = {
	name: 'localStorage',
	read: read,
	write: write,
	each: each$2,
	remove: remove,
	clearAll: clearAll,
};

function localStorage() {
	return Global$1.localStorage
}

function read(key) {
	return localStorage().getItem(key)
}

function write(key, data) {
	return localStorage().setItem(key, data)
}

function each$2(fn) {
	for (var i = localStorage().length - 1; i >= 0; i--) {
		var key = localStorage().key(i);
		fn(read(key), key);
	}
}

function remove(key) {
	return localStorage().removeItem(key)
}

function clearAll() {
	return localStorage().clear()
}

// oldFF-globalStorage provides storage for Firefox
// versions 6 and 7, where no localStorage, etc
// is available.


var Global$2 = util.Global;

var oldFFGlobalStorage = {
	name: 'oldFF-globalStorage',
	read: read$1,
	write: write$1,
	each: each$3,
	remove: remove$1,
	clearAll: clearAll$1,
};

var globalStorage = Global$2.globalStorage;

function read$1(key) {
	return globalStorage[key]
}

function write$1(key, data) {
	globalStorage[key] = data;
}

function each$3(fn) {
	for (var i = globalStorage.length - 1; i >= 0; i--) {
		var key = globalStorage.key(i);
		fn(globalStorage[key], key);
	}
}

function remove$1(key) {
	return globalStorage.removeItem(key)
}

function clearAll$1() {
	each$3(function(key, _) {
		delete globalStorage[key];
	});
}

// oldIE-userDataStorage provides storage for Internet Explorer
// versions 6 and 7, where no localStorage, sessionStorage, etc
// is available.


var Global$3 = util.Global;

var oldIEUserDataStorage = {
	name: 'oldIE-userDataStorage',
	write: write$2,
	read: read$2,
	each: each$4,
	remove: remove$2,
	clearAll: clearAll$2,
};

var storageName = 'storejs';
var doc = Global$3.document;
var _withStorageEl = _makeIEStorageElFunction();
var disable = (Global$3.navigator ? Global$3.navigator.userAgent : '').match(/ (MSIE 8|MSIE 9|MSIE 10)\./); // MSIE 9.x, MSIE 10.x

function write$2(unfixedKey, data) {
	if (disable) { return }
	var fixedKey = fixKey(unfixedKey);
	_withStorageEl(function(storageEl) {
		storageEl.setAttribute(fixedKey, data);
		storageEl.save(storageName);
	});
}

function read$2(unfixedKey) {
	if (disable) { return }
	var fixedKey = fixKey(unfixedKey);
	var res = null;
	_withStorageEl(function(storageEl) {
		res = storageEl.getAttribute(fixedKey);
	});
	return res
}

function each$4(callback) {
	_withStorageEl(function(storageEl) {
		var attributes = storageEl.XMLDocument.documentElement.attributes;
		for (var i=attributes.length-1; i>=0; i--) {
			var attr = attributes[i];
			callback(storageEl.getAttribute(attr.name), attr.name);
		}
	});
}

function remove$2(unfixedKey) {
	var fixedKey = fixKey(unfixedKey);
	_withStorageEl(function(storageEl) {
		storageEl.removeAttribute(fixedKey);
		storageEl.save(storageName);
	});
}

function clearAll$2() {
	_withStorageEl(function(storageEl) {
		var attributes = storageEl.XMLDocument.documentElement.attributes;
		storageEl.load(storageName);
		for (var i=attributes.length-1; i>=0; i--) {
			storageEl.removeAttribute(attributes[i].name);
		}
		storageEl.save(storageName);
	});
}

// Helpers
//////////

// In IE7, keys cannot start with a digit or contain certain chars.
// See https://github.com/marcuswestin/store.js/issues/40
// See https://github.com/marcuswestin/store.js/issues/83
var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
function fixKey(key) {
	return key.replace(/^\d/, '___$&').replace(forbiddenCharsRegex, '___')
}

function _makeIEStorageElFunction() {
	if (!doc || !doc.documentElement || !doc.documentElement.addBehavior) {
		return null
	}
	var scriptTag = 'script',
		storageOwner,
		storageContainer,
		storageEl;

	// Since #userData storage applies only to specific paths, we need to
	// somehow link our data to a specific path.  We choose /favicon.ico
	// as a pretty safe option, since all browsers already make a request to
	// this URL anyway and being a 404 will not hurt us here.  We wrap an
	// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
	// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
	// since the iframe access rules appear to allow direct access and
	// manipulation of the document element, even for a 404 page.  This
	// document can be used instead of the current document (which would
	// have been limited to the current path) to perform #userData storage.
	try {
		/* global ActiveXObject */
		storageContainer = new ActiveXObject('htmlfile');
		storageContainer.open();
		storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>');
		storageContainer.close();
		storageOwner = storageContainer.w.frames[0].document;
		storageEl = storageOwner.createElement('div');
	} catch(e) {
		// somehow ActiveXObject instantiation failed (perhaps some special
		// security settings or otherwse), fall back to per-path storage
		storageEl = doc.createElement('div');
		storageOwner = doc.body;
	}

	return function(storeFunction) {
		var args = [].slice.call(arguments, 0);
		args.unshift(storageEl);
		// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
		// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
		storageOwner.appendChild(storageEl);
		storageEl.addBehavior('#default#userData');
		storageEl.load(storageName);
		storeFunction.apply(this, args);
		storageOwner.removeChild(storageEl);
		return
	}
}

// cookieStorage is useful Safari private browser mode, where localStorage
// doesn't work but cookies do. This implementation is adopted from
// https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage


var Global$4 = util.Global;
var trim$1 = util.trim;

var cookieStorage = {
	name: 'cookieStorage',
	read: read$3,
	write: write$3,
	each: each$5,
	remove: remove$3,
	clearAll: clearAll$3,
};

var doc$1 = Global$4.document;

function read$3(key) {
	if (!key || !_has(key)) { return null }
	var regexpStr = "(?:^|.*;\\s*)" +
		escape(key).replace(/[\-\.\+\*]/g, "\\$&") +
		"\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*";
	return unescape(doc$1.cookie.replace(new RegExp(regexpStr), "$1"))
}

function each$5(callback) {
	var cookies = doc$1.cookie.split(/; ?/g);
	for (var i = cookies.length - 1; i >= 0; i--) {
		if (!trim$1(cookies[i])) {
			continue
		}
		var kvp = cookies[i].split('=');
		var key = unescape(kvp[0]);
		var val = unescape(kvp[1]);
		callback(val, key);
	}
}

function write$3(key, data) {
	if(!key) { return }
	doc$1.cookie = escape(key) + "=" + escape(data) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
}

function remove$3(key) {
	if (!key || !_has(key)) {
		return
	}
	doc$1.cookie = escape(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

function clearAll$3() {
	each$5(function(_, key) {
		remove$3(key);
	});
}

function _has(key) {
	return (new RegExp("(?:^|;\\s*)" + escape(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(doc$1.cookie)
}

var Global$5 = util.Global;

var sessionStorage_1 = {
	name: 'sessionStorage',
	read: read$4,
	write: write$4,
	each: each$6,
	remove: remove$4,
	clearAll: clearAll$4
};

function sessionStorage() {
	return Global$5.sessionStorage
}

function read$4(key) {
	return sessionStorage().getItem(key)
}

function write$4(key, data) {
	return sessionStorage().setItem(key, data)
}

function each$6(fn) {
	for (var i = sessionStorage().length - 1; i >= 0; i--) {
		var key = sessionStorage().key(i);
		fn(read$4(key), key);
	}
}

function remove$4(key) {
	return sessionStorage().removeItem(key)
}

function clearAll$4() {
	return sessionStorage().clear()
}

// memoryStorage is a useful last fallback to ensure that the store
// is functions (meaning store.get(), store.set(), etc will all function).
// However, stored values will not persist when the browser navigates to
// a new page or reloads the current page.

var memoryStorage_1 = {
	name: 'memoryStorage',
	read: read$5,
	write: write$5,
	each: each$7,
	remove: remove$5,
	clearAll: clearAll$5,
};

var memoryStorage = {};

function read$5(key) {
	return memoryStorage[key]
}

function write$5(key, data) {
	memoryStorage[key] = data;
}

function each$7(callback) {
	for (var key in memoryStorage) {
		if (memoryStorage.hasOwnProperty(key)) {
			callback(memoryStorage[key], key);
		}
	}
}

function remove$5(key) {
	delete memoryStorage[key];
}

function clearAll$5(key) {
	memoryStorage = {};
}

var all = [
	// Listed in order of usage preference
	localStorage_1,
	oldFFGlobalStorage,
	oldIEUserDataStorage,
	cookieStorage,
	sessionStorage_1,
	memoryStorage_1
];

/* eslint-disable */

//  json2.js
//  2016-10-28
//  Public Domain.
//  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
//  See http://www.JSON.org/js.html
//  This code should be minified before deployment.
//  See http://javascript.crockford.com/jsmin.html

//  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
//  NOT CONTROL.

//  This file creates a global JSON object containing two methods: stringify
//  and parse. This file provides the ES5 JSON capability to ES3 systems.
//  If a project might run on IE8 or earlier, then this file should be included.
//  This file does nothing on ES5 systems.

//      JSON.stringify(value, replacer, space)
//          value       any JavaScript value, usually an object or array.
//          replacer    an optional parameter that determines how object
//                      values are stringified for objects. It can be a
//                      function or an array of strings.
//          space       an optional parameter that specifies the indentation
//                      of nested structures. If it is omitted, the text will
//                      be packed without extra whitespace. If it is a number,
//                      it will specify the number of spaces to indent at each
//                      level. If it is a string (such as "\t" or "&nbsp;"),
//                      it contains the characters used to indent at each level.
//          This method produces a JSON text from a JavaScript value.
//          When an object value is found, if the object contains a toJSON
//          method, its toJSON method will be called and the result will be
//          stringified. A toJSON method does not serialize: it returns the
//          value represented by the name/value pair that should be serialized,
//          or undefined if nothing should be serialized. The toJSON method
//          will be passed the key associated with the value, and this will be
//          bound to the value.

//          For example, this would serialize Dates as ISO strings.

//              Date.prototype.toJSON = function (key) {
//                  function f(n) {
//                      // Format integers to have at least two digits.
//                      return (n < 10)
//                          ? "0" + n
//                          : n;
//                  }
//                  return this.getUTCFullYear()   + "-" +
//                       f(this.getUTCMonth() + 1) + "-" +
//                       f(this.getUTCDate())      + "T" +
//                       f(this.getUTCHours())     + ":" +
//                       f(this.getUTCMinutes())   + ":" +
//                       f(this.getUTCSeconds())   + "Z";
//              };

//          You can provide an optional replacer method. It will be passed the
//          key and value of each member, with this bound to the containing
//          object. The value that is returned from your method will be
//          serialized. If your method returns undefined, then the member will
//          be excluded from the serialization.

//          If the replacer parameter is an array of strings, then it will be
//          used to select the members to be serialized. It filters the results
//          such that only members with keys listed in the replacer array are
//          stringified.

//          Values that do not have JSON representations, such as undefined or
//          functions, will not be serialized. Such values in objects will be
//          dropped; in arrays they will be replaced with null. You can use
//          a replacer function to replace those with JSON values.

//          JSON.stringify(undefined) returns undefined.

//          The optional space parameter produces a stringification of the
//          value that is filled with line breaks and indentation to make it
//          easier to read.

//          If the space parameter is a non-empty string, then that string will
//          be used for indentation. If the space parameter is a number, then
//          the indentation will be that many spaces.

//          Example:

//          text = JSON.stringify(["e", {pluribus: "unum"}]);
//          // text is '["e",{"pluribus":"unum"}]'

//          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
//          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

//          text = JSON.stringify([new Date()], function (key, value) {
//              return this[key] instanceof Date
//                  ? "Date(" + this[key] + ")"
//                  : value;
//          });
//          // text is '["Date(---current time---)"]'

//      JSON.parse(text, reviver)
//          This method parses a JSON text to produce an object or array.
//          It can throw a SyntaxError exception.

//          The optional reviver parameter is a function that can filter and
//          transform the results. It receives each of the keys and values,
//          and its return value is used instead of the original value.
//          If it returns what it received, then the structure is not modified.
//          If it returns undefined then the member is deleted.

//          Example:

//          // Parse the text. Values that look like ISO date strings will
//          // be converted to Date objects.

//          myData = JSON.parse(text, function (key, value) {
//              var a;
//              if (typeof value === "string") {
//                  a =
//   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
//                  if (a) {
//                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
//                          +a[5], +a[6]));
//                  }
//              }
//              return value;
//          });

//          myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
//              var d;
//              if (typeof value === "string" &&
//                      value.slice(0, 5) === "Date(" &&
//                      value.slice(-1) === ")") {
//                  d = new Date(value.slice(5, -1));
//                  if (d) {
//                      return d;
//                  }
//              }
//              return value;
//          });

//  This is a reference implementation. You are free to copy, modify, or
//  redistribute.

/*jslint
    eval, for, this
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + "-" +
                        f(this.getUTCMonth() + 1) + "-" +
                        f(this.getUTCDate()) + "T" +
                        f(this.getUTCHours()) + ":" +
                        f(this.getUTCMinutes()) + ":" +
                        f(this.getUTCSeconds()) + "Z"
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === "object" &&
                typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value)
                ? String(value)
                : "null";

        case "boolean":
        case "null":

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce "null". The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is "object", we might be dealing with an object or an array or
// null.

        case "object":

// Due to a specification blunder in ECMAScript, typeof null is "object",
// so watch out for that case.

            if (!value) {
                return "null";
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === "[object Array]") {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === "string") {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== "function" &&
                    (typeof replacer !== "object" ||
                    typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }

// Make a fake root object containing our value under the key of "".
// Return the result of stringifying the value.

            return str("", {"": value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return "\\u" +
                            ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with "()" and "new"
// because they can cause invocation, and "=" because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
// replace all simple value tokens with "]" characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or "]" or
// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    }
}());

var json2 = json2Plugin;

function json2Plugin() {
	
	return {}
}

var plugins = [json2];

var store_legacy = storeEngine.createStore(all, plugins);

var main = (function() {

	const Frecent = function Frecent(items) {
		this.items = store_legacy.get('items') || this.mapItems(items) || [];

		this.save(this.items);
	};

	Frecent.prototype.add = function add(item, visits, timestamp) {
		this.items.push({
			item,
			visits, 
			timestamp,
			weight: this.frecency(visits, timestamp || new Date())
		});

		this.save(this.items);
	};
	
	Frecent.prototype.frecency = function frecency(visits, timestamp) {
		function getDays(a, b) {
			var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds

			return Math.round(Math.abs((a.getTime() - b.getTime())/(oneDay)));
		}

		return (visits * 100) / getDays(new Date().now(), timestamp)
	};

	Frecent.prototype.get = function get() {
		return this.items.sort((a, b) => a.weight >= b.weight)
	};

	Frecent.prototype.mapItems = function mapItems(items) {
		return items.map(item => ({
			item,
			visits: 0,
			lastVisit: null,
			weight: null
		}))
	};

	Frecent.prototype.save = function save(items) {
		store_legacy.set('items', {
			items: this.items
		});	
	};

	return Frecent

})();

return main;

})));
