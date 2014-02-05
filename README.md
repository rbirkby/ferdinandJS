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
  
  return HelloWorldModule()
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
  
  return HelloWorldModule()
});

require(['HelloWorldModule'], function(HelloWorldModule) {
  var helloWorldModule = new HelloWorldModule();
  helloWorldModule.printMessage();
});
```


Debugging
---------

FerdinandJS provides 3 mechanisms for discovering failed dependencies:

 * unusedModules
 * printUnresolvedDependencies
 * isDefined

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
then calling
    define.unusedModules()
will return:
```JavaScript
["module1", "module2", "module3", "module5", "module6"]
```
because module4 and module7 are not defined.

### printUnresolvedDependencies

It is much more interesting to know which dependencies have been required, but have been unable to be resolved. To find these dependencies, calling
    define.printUnresolvedDependencies()
will produce:
![Image](docs/printUnresolvedDependencies.png?raw=true)

### isDefined

Calling define.isDefined('module4') returns true, whereas define.isDefined('module7') returns false.
