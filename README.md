FerdinandJS
===========

AMD-lite JavaScript module resolver

Supports a subset of AMD with the following restrictions:
 *  Static dependencies only, no module loading
 *  Absolute module id paths only
 *  Delayed factory invocation
 *  Named modules only
 *  Acyclic dependencies only
 *  Mandatory dependencies list
 *  No CommonJS support
 *  ES5

Getting Started
---------------

```JavaScript
define('HelloWorldModule', [], function() {
  return {message: 'Hello World'};
});

require(['HelloWorldModule'], function(helloWorldModule) {
  console.log(helloWorldModule.message);
});
```

Suppose you like to structure your JavaScript with objects and constructor functions, then:
```JavaScript
define('HelloWorldModule', [], function() {
  function HelloWorldModule() {}

  HelloWorldModule.prototype.printMessage = function() {
    console.log('Hello World');
  };

  return HelloWorldModule;
});

require(['HelloWorldModule'], function(HelloWorldModule) {
  var helloWorldModule = new HelloWorldModule();
  helloWorldModule.printMessage();
});
```

Now let's assume we need to pass a localization dictionary into the HelloWorldModule as a dependency
```JavaScript
define('LocalizationModule', [], function() {
  return {'HelloWorld': 'Hello World'};
});
define('HelloWorldModule', ['LocalizationModule'], function(localizationModule) {
  function HelloWorldModule() {}

  HelloWorldModule.prototype.printMessage = function() {
    console.log(localizationModule.HelloWorld);
  };

  return HelloWorldModule;
});

require(['HelloWorldModule'], function(HelloWorldModule) {
  var helloWorldModule = new HelloWorldModule();
  helloWorldModule.printMessage();
});
```

Module order is irrelevant. The require() call can come before define(), and defines can be in any order too.
Only when all dependencies can be satisfied does the require callback get executed.
```JavaScript
require(['HelloWorldModule'], function(HelloWorldModule) {
  var helloWorldModule = new HelloWorldModule();
  helloWorldModule.printMessage();
});

define('HelloWorldModule', [], function() {
  function HelloWorldModule() {}

  HelloWorldModule.prototype.printMessage = function() {
    console.log('Hello World');
  };

  return HelloWorldModule;
});

```
This allows scripts to be loaded asynchronously using the HTML5 async attribute:
```html
<script src='helloworldmodule.js' async></script>
<script src='localizationmodule.js' async></script>
<script src='main.js' async></script>
```


Download
--------

[Latest release](https://github.com/rbirkby/ferdinandJS/raw/master/ferdinand.js)

Debugging
---------

FerdinandJS provides 4 mechanisms for discovering failed dependencies:

 * [unusedModules](#unusedmodules)
 * [printUnresolvedDependencies](#printunresolveddependencies)
 * [unresolvedDependencies](#unresolveddependencies)
 * [isDefined](#isdefined)

### unusedModules

Given the following code:
```JavaScript
define('module1', ['module2'], function() {});
define('module2', ['module3', 'module4'], function() {});
define('module3', [], function() {});
define('module5', ['module6'], function() {});
define('module6', ['module7'], function() {});
require(['module1'], function () {});
require(['module5'], function () {});
```
then calling `require.unusedModules()` will return:
```JavaScript
["module1", "module2", "module3", "module5", "module6"]
```
because module4 and module7 are not defined.

### printUnresolvedDependencies

It is much more interesting to know which dependencies have been required, but have been unable to be resolved. To find these dependencies, calling `require.printUnresolvedDependencies()` will produce:

![Image](docs/printUnresolvedDependencies.png?raw=true)

### unresolvedDependencies

Called internally by printUnresolvedDependencies, this function returns a list of all unresolved dependency chains for programmatic consumption.

### isDefined

To know whether a module ID has been declared, you can ask FerdinandJS with `require.isDefined('module3')`. For the example above, this returns true, whereas `require.isDefined('module7')` returns false.
