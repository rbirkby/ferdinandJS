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


Debugging
---------

FerdinandJS provides 2 mechanisms for discovering failed dependencies:

 * unusedModules
 * printUnresolvedDependencies

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
will produce:
```JavaScript
["module1", "module2", "module3", "module5", "module6"]
```
because module4 and module7 are not defined.

It is much more interesting to know which dependencies have been required, but have been unable to be resolved. To find these dependencies, call:
    define.printUnresolvedDependencies()
will produce:
![Image](docs/printUnresolvedDependencies.png?raw=true)
