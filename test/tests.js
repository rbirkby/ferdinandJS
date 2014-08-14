var assert = require("assert");
var ferdinand = require("../ferdinand");
var sinon = require("sinon");

describe('ferdinand', function(){
  "use strict";

  afterEach(function() {
    ferdinand.require.clear();
    console.warn.restore();
  });

  beforeEach(function() {
    sinon.stub(console, "warn");
  });

  describe('define', function() {
    it('should define a module', function(){
      ferdinand.define('moduleId', [], function() {});

      assert.ok(ferdinand.require.isDefined('moduleId'));
    });

    it('should throw with missing factory function', function(){
      assert.throws(function() {ferdinand.define('moduleId', []);});
    });

    it('should throw with missing dependencies', function(){
      assert.throws(function() {ferdinand.define('moduleId');});
    });

    it('should report duplicate module definitions', function(){
      ferdinand.define('moduleId', [], function() {});
      ferdinand.define('moduleId', [], function() {});

      assert.ok(console.warn.calledOnce);
    });

    it('should define module with dependencies', function() {
      ferdinand.define('moduleId1', [], function() {});
      ferdinand.define('moduleId', ['moduleId1'], function() {});

      assert.ok(ferdinand.require.isDefined('moduleId'));
    });

    it('should cache the factory function', function() {
      var i = 42;

      ferdinand.define('moduleId', [], function() {return i++;});

      ferdinand.require(['moduleId'], function(value) {
        assert.strictEqual(value, 42);
      });
      ferdinand.require(['moduleId'], function(value) {
        assert.strictEqual(value, 42);
      });
    });

    it('should lazily initialize the factory function', function() {
      var i = 42;

      ferdinand.define('moduleId', [], function() {var value = i; return value;});
      i = 43;

      ferdinand.require(['moduleId'], function(value) {
        assert.strictEqual(value, 43);
      });

      i = 44;
      ferdinand.require(['moduleId'], function(value) {
        assert.strictEqual(value, 43);
      });
    });
  });

  describe('require', function() {
    it('should require defined modules', function() {
      var required = false;

      ferdinand.define('moduleId', [], function() {});
      ferdinand.require(['moduleId'], function() {
        required = true;
      });

      assert.ok(required);
    });

    it('should not care about the order of require/define calls', function() {
      var required = false;

      ferdinand.require(['moduleId'], function() {
        required = true;
      });
      ferdinand.define('moduleId', [], function() {});

      assert.ok(required);
    });

    it('should not call require function with unresolved dependencies', function() {
      var required = false;

      ferdinand.require(['moduleId'], function() {
        required = true;
      });

      assert.ok(!required);
    });

    it('should surface factory function exceptions', function() {
      ferdinand.define('moduleId', [], function() {
        throw new Error('error in factory function');
      });

      assert.throws(function() {ferdinand.require(['moduleId'], function() {}); });
    });

    it('should throw factory function exceptions on each require', function() {
      ferdinand.define('moduleId', [], function() {
        throw new Error('error in factory function');
      });

      try {
        ferdinand.require(['moduleId'], function() {});
      } catch(e) {}

      assert.throws(function() {ferdinand.require(['moduleId'], function() {}); });
    });
  });

  describe('unusedModules', function() {
    it('should return unused modules', function() {
      ferdinand.define('moduleId1', [], function() {});
      ferdinand.define('moduleId', ['moduleId1'], function() {});

      assert.deepEqual(ferdinand.require.unusedModules(), ['moduleId1', 'moduleId']);
    });
  });

  describe('unresolvedDependencies', function() {
    it('should return unresolved dependencies', function() {
      ferdinand.define('moduleId1', ['module2'], function() {});
      ferdinand.define('moduleId', ['moduleId1'], function() {});

      ferdinand.require(['moduleId'], function() {});

      assert.deepEqual(ferdinand.require.unresolvedDependencies(), [['moduleId','moduleId1','module2']]);
    });
  });
});
