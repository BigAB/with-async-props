/*with-async-props@0.0.2#with-async-props*/
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.withAsyncPropsOnChange = exports.mapAsyncProps = exports.withAsyncProps = exports.mapAsyncPropsStreamWithAsyncFn = undefined;
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
var _react = require('react');
var _symbolObservable = require('symbol-observable');
var _symbolObservable2 = _interopRequireDefault(_symbolObservable);
var _recompose = require('recompose');
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