/**
 * FerdinandJS - AMD-lite JavaScript module resolver
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
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 * @license MIT License (c) copyright 2013 R Birkby 
 */ 
(function(global) {
    "use strict";
    var cache = {};
    
    function resolve(moduleId) {
        var factory = cache[moduleId];
        if (typeof factory === 'undefined') throw new Error('Unknown module \'' + moduleId + '\'');

        factory.__memoized = factory.__memoized || factory.apply(this, factory.__dependencies.map(resolve));
        return factory.__memoized;
    }
    
    global.define = function(moduleId, dependencies, factory) {
        if (typeof moduleId === 'string') {
            if (typeof factory === 'function') {
                if (typeof cache[moduleId] !== 'undefined') {
                    if (global.console && global.console.warn) global.console.warn('Duplicate module definition \'' + moduleId + '\'');
                    delete cache[moduleId].__memoized;
                }
                cache[moduleId] = factory;
                cache[moduleId].__dependencies = dependencies;
            } else {
                throw new Error('Missing module factory for module \'' + moduleId + '\'');
            }
        }
    };
    global.define.isDefined = function(moduleId) {
        return typeof cache[moduleId] !== 'undefined';
    };
    global.define.amd = {};
    
    global.require = function(dependencies, callback) {
        callback.apply(this, dependencies.map(resolve));
    };
})(window);
