/*[process-shim]*/
(function(global, env) {
	// jshint ignore:line
	if (typeof process === "undefined") {
		global.process = {
			argv: [],
			cwd: function() {
				return "";
			},
			browser: true,
			env: {
				NODE_ENV: env || "development"
			},
			version: "",
			platform:
				global.navigator &&
				global.navigator.userAgent &&
				/Windows/.test(global.navigator.userAgent)
					? "win"
					: ""
		};
	}
})(
	typeof self == "object" && self.Object == Object
		? self
		: typeof process === "object" &&
		  Object.prototype.toString.call(process) === "[object process]"
			? global
			: window,
	"development"
);

/*[global-shim-start]*/
(function(exports, global, doEval) {
	// jshint ignore:line
	var origDefine = global.define;

	var get = function(name) {
		var parts = name.split("."),
			cur = global,
			i;
		for (i = 0; i < parts.length; i++) {
			if (!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val) {
		var parts = name.split("."),
			cur = global,
			i,
			part,
			next;
		for (i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if (!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod) {
		if (!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, default: true };
		for (var p in mod) {
			if (!esProps[p]) return false;
		}
		return true;
	};

	var hasCjsDependencies = function(deps) {
		return (
			deps[0] === "require" && deps[1] === "exports" && deps[2] === "module"
		);
	};

	var modules =
		(global.define && global.define.modules) ||
		(global._define && global._define.modules) ||
		{};
	var ourDefine = (global.define = function(moduleName, deps, callback) {
		var module;
		if (typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for (i = 0; i < deps.length; i++) {
			args.push(
				exports[deps[i]]
					? get(exports[deps[i]])
					: modules[deps[i]] || get(deps[i])
			);
		}
		// CJS has no dependencies but 3 callback arguments
		if (hasCjsDependencies(deps) || (!deps.length && callback.length)) {
			module = { exports: {} };
			args[0] = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args[1] = module.exports;
			args[2] = module;
		}
		// Babel uses the exports and module object.
		else if (!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if (deps[1] === "module") {
				args[1] = module;
			}
		} else if (!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if (globalExport && !get(globalExport)) {
			if (useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	});
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function() {
		// shim for @@global-helpers
		var noop = function() {};
		return {
			get: function() {
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load) {
				doEval(__load.source, global);
			}
		};
	});
})(
	{},
	typeof self == "object" && self.Object == Object
		? self
		: typeof process === "object" &&
		  Object.prototype.toString.call(process) === "[object process]"
			? global
			: window,
	function(__$source__, __$global__) {
		// jshint ignore:line
		eval("(function() { " + __$source__ + " \n }).call(__$global__);");
	}
);

/*with-async-props@0.0.1#with-async-props*/
define('with-async-props', [
    'exports',
    'react',
    'symbol-observable',
    'recompose'
], function (exports, _react, _symbolObservable, _recompose) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.withAsyncPropsOnChange = exports.mapAsyncProps = exports.withAsyncProps = exports.mapAsyncPropsStreamWithAsyncFn = undefined;
    var _symbolObservable2 = _interopRequireDefault(_symbolObservable);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }
        return obj;
    }
    var _extends = Object.assign || function (target) {
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
    var identity = function identity(t) {
        return t;
    };
    var STEADY_CONTEXT = Symbol('with-async-props-steady-context');
    var LAST_RESULT = Symbol('with-async-props-last-result');
    var LAST_PROPS = Symbol('with-async-props-last-props');
    var pick = function pick() {
        var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var keys = arguments[1];
        var result = {};
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (obj.hasOwnProperty(key)) {
                result[key] = obj[key];
            }
        }
        return result;
    };
    var mapAsyncPropsStreamWithAsyncFn = exports.mapAsyncPropsStreamWithAsyncFn = function mapAsyncPropsStreamWithAsyncFn(asyncCreateProps, pendingProps, rejectedProps) {
        var shouldMap = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {
            return true;
        };
        var componentFromStream = (0, _recompose.componentFromStreamWithConfig)({
            fromESObservable: identity,
            toESObservable: identity
        });
        var mapPendingProps = typeof pendingProps === 'function' ? pendingProps : function (props) {
            return _extends({}, props, pendingProps);
        };
        var mapErrorProps = typeof rejectedProps === 'function' ? rejectedProps : function (props, reason) {
            return rejectedProps ? _extends({}, props, rejectedProps) : _extends({}, props, { reason: reason });
        };
        return function (BaseComponent) {
            var factory = (0, _react.createFactory)(BaseComponent);
            return componentFromStream(function (props$) {
                return _defineProperty({
                    subscribe: function subscribe(observer) {
                        observer[STEADY_CONTEXT] = {};
                        observer[LAST_PROPS] = {};
                        var subscription = props$.subscribe({
                            next: function next(childProps) {
                                if (shouldMap(observer[LAST_PROPS], childProps)) {
                                    observer.next(factory(mapPendingProps(childProps)));
                                    asyncCreateProps.call(observer[STEADY_CONTEXT], childProps).then(function (newProps) {
                                        observer.next(factory(newProps));
                                        observer[LAST_PROPS] = childProps;
                                        observer[LAST_RESULT] = newProps;
                                    }).catch(function (reason) {
                                        var newProps = mapErrorProps(childProps, reason);
                                        observer.next(factory(newProps));
                                        observer[LAST_PROPS] = childProps;
                                        observer[LAST_RESULT] = newProps;
                                    });
                                    return observer;
                                }
                                observer.next(factory(_extends({}, observer[LAST_RESULT], childProps)));
                                observer[LAST_PROPS] = childProps;
                            },
                            error: function error() {
                            },
                            complete: function complete() {
                            }
                        });
                        return {
                            unsubscribe: function unsubscribe() {
                                return subscription.unsubscribe();
                            }
                        };
                    }
                }, _symbolObservable2.default, function () {
                    return this;
                });
            });
        };
    };
    var withAsyncProps = exports.withAsyncProps = function withAsyncProps(asyncCreateProps, pendingProps, rejectedProps) {
        var hoc = mapAsyncPropsStreamWithAsyncFn(function (props) {
            return asyncCreateProps(props).then(function (newProps) {
                return _extends({}, props, newProps);
            });
        }, pendingProps, rejectedProps);
        if (process.env.NODE_ENV !== 'production') {
            return function (BaseComponent) {
                return (0, _recompose.setDisplayName)((0, _recompose.wrapDisplayName)(BaseComponent, 'withAsyncProps'))(hoc(BaseComponent));
            };
        }
        return hoc;
    };
    var mapAsyncProps = exports.mapAsyncProps = function mapAsyncProps(asyncPropsMapper, pendingProps, rejectedProps) {
        var hoc = mapAsyncPropsStreamWithAsyncFn(asyncPropsMapper, pendingProps, rejectedProps);
        if (process.env.NODE_ENV !== 'production') {
            return function (BaseComponent) {
                return (0, _recompose.setDisplayName)((0, _recompose.wrapDisplayName)(BaseComponent, 'mapAsyncProps'))(hoc(BaseComponent));
            };
        }
        return hoc;
    };
    var withAsyncPropsOnChange = exports.withAsyncPropsOnChange = function withAsyncPropsOnChange(shouldMapOrKeys, asyncPropsMapper, pendingProps, rejectedProps) {
        var shouldMap = typeof shouldMapOrKeys === 'function' ? shouldMapOrKeys : function (props, nextProps) {
            return !(0, _recompose.shallowEqual)(pick(props, shouldMapOrKeys), pick(nextProps, shouldMapOrKeys));
        };
        var hoc = mapAsyncPropsStreamWithAsyncFn(function (props) {
            return asyncPropsMapper(props).then(function (newProps) {
                return _extends({}, props, newProps);
            });
        }, pendingProps, rejectedProps, shouldMap);
        if (process.env.NODE_ENV !== 'production') {
            return function (BaseComponent) {
                return (0, _recompose.setDisplayName)((0, _recompose.wrapDisplayName)(BaseComponent, 'withAsyncPropsOnChange'))(hoc(BaseComponent));
            };
        }
        return hoc;
    };
    exports.default = {
        withAsyncProps: withAsyncProps,
        mapAsyncProps: mapAsyncProps,
        withAsyncPropsOnChange: withAsyncPropsOnChange
    };
});
/*[global-shim-end]*/
(function(global) { // jshint ignore:line
	global._define = global.define;
	global.define = global.define.orig;
}
)(typeof self == "object" && self.Object == Object ? self : (typeof process === "object" && Object.prototype.toString.call(process) === "[object process]") ? global : window);