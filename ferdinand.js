/**
 * FerdinandJS - v0.5 - AMD-lite JavaScript module resolver
 * https://github.com/rbirkby/ferdinandJS
 *
 * Supports a subset of AMD with the following restrictions:
 *   Static dependencies only, no module loading
 *   Absolute module id paths only
 *   Delayed factory invocation
 *   Named modules only
 *   Acyclic dependencies only
 *   Mandatory dependencies list
 *   No CommonJS support
 *   ES5
 *
 * Licensed under the MIT License at:
 *     http://www.opensource.org/licenses/mit-license.php
 *
 * @license MIT License (c) copyright 2013-2014 R Birkby 
 */
(function (global) {
    "use strict";

    var cache = {};
    var requireQueue = [];

    function ResolutionError(moduleId) {
        this.name = 'ResolutionError';
        this.message = 'Unknown module \'' + moduleId + '\'';
        this.resolutionChain = [moduleId];
    }

    ResolutionError.prototype = new Error();
    ResolutionError.prototype.constructor = ResolutionError;

    function resolve(moduleId) {
        /*jshint validthis:true */
        var factory = cache[moduleId];
        if (typeof factory === 'undefined') throw new ResolutionError(moduleId);

        try {
            factory.__memoized = factory.__memoized || factory.apply(this, factory.__dependencies.map(resolve));
        } catch (e) {
            if (e instanceof ResolutionError) {
                e.resolutionChain.push(moduleId);
            }

            throw e;
        }

        return factory.__memoized;
    }

    function drainRequireQueue() {
        var delayedRequire, queue = requireQueue;
        requireQueue = [];

        while (queue.length > 0) {
            delayedRequire = queue.shift();
            global.require(delayedRequire.dependencies, delayedRequire.callback);
        }
    }

    global.define = function (moduleId, dependencies, factory) {
        if (typeof moduleId === 'string') {
            if (typeof factory === 'function') {
                if (typeof cache[moduleId] !== 'undefined') {
                    if (global.console && global.console.warn) global.console.warn('Duplicate module definition \'' + moduleId + '\'');
                    delete cache[moduleId].__memoized;
                }
                cache[moduleId] = factory;
                cache[moduleId].__dependencies = dependencies;

                drainRequireQueue();
            } else {
                throw new Error('Missing module factory for module \'' + moduleId + '\'');
            }
        }
    };
    global.define.clear = function () {
        cache = {};
        requireQueue = [];
    };
    global.define.isDefined = function (moduleId) {
        return typeof cache[moduleId] !== 'undefined';
    };
    global.define.unusedModules = function () {
        return Object.keys(cache)
                     .filter(function (moduleId) { return typeof cache[moduleId].__memoized === 'undefined'; });
    };
    global.define.unresolvedDependencies = function() {
        var unresolvedResolutionChain = [];

        var dependencies = {};
        requireQueue.forEach(function (delayedRequire) {
            delayedRequire.dependencies.forEach(function (moduleId) {
                dependencies[moduleId] = {};
            });
        });

        Object.keys(dependencies).forEach(function (moduleId) {
            try {
                resolve(moduleId);
            } catch (e) {
                if (e instanceof ResolutionError) {
                    unresolvedResolutionChain.push(e.resolutionChain.reverse());
                }
            }
        });

        return unresolvedResolutionChain;
    };
    global.define.printUnresolvedDependencies = function () {
        global.define.unresolvedDependencies().forEach(printResolutionChain);
    };
    function printResolutionChain(chain) {
        if (chain.length > 1) {
            console.group('%c' + chain[0], 'color:red');
            printResolutionChain(chain.slice(1));
            console.groupEnd();
        } else {
            console.log('%c' + chain[0] + '%c remains unresolved', 'color:red', 'color:inherit');
        }
    }

    global.define.amd = {};

    global.require = function (dependencies, callback) {
        var resolvedDependencies;
        try {
            resolvedDependencies = dependencies.map(resolve);
        } catch (e) {
            requireQueue.push({ dependencies: dependencies, callback: callback });
            return;
        }
        callback.apply(this, resolvedDependencies);
    };
})(this || (1, eval)('this'));
