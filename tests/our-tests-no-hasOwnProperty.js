// Unit tests. Run with mocha.
//
// These tests ensure that JaySchema works with instances that are
// not derived from Object.

/*global describe:true it:true */


var should = require('should')
  , JaySchema = require('../lib/jayschema.js')
  , path = require('path')
  , helpers = require('./helpers.js')
  ;


var BLACKLISTED_TESTS = {

  'refsAsync.json': {
    '*': 'these tests only apply in async mode'
  }

};

function duplicateWithNullPrototype(src) {
  if (!(src instanceof Object)) { return src; }

  if (Array.isArray(src)) {
    return Array.prototype.map.call(src, duplicateWithNullPrototype);
  }

  var dest = Object.create(null);
  Object.keys(src).forEach(function(key) {
    if (src[key] instanceof Object) {
      dest[key] = duplicateWithNullPrototype(src[key]);
    } else {
      dest[key] = src[key];
    }
  });
  return dest;
}

describe('Our test suite (running synchronously, instances without ' +
  'Object.prototype):', function()
{

  var files = helpers.getTests(path.join(__dirname, 'our-tests'));

  for (var index = 0, len = files.length; index !== len; ++index) {
    var jsonFile = files[index];
    var testGroups = require(jsonFile);

    testGroups.forEach(function(group) {
      describe(path.relative('.', jsonFile) + '|' + group.description + ':',
        function()
      {
        var nullPrototypeSchema = duplicateWithNullPrototype(group.schema);

        group.tests.forEach(function(test) {

          if (!helpers.shouldSkip(jsonFile, group.description, test.description, BLACKLISTED_TESTS)) {
            it(test.description, function() {
              var jj = new JaySchema();
              var result = jj.validate(duplicateWithNullPrototype(test.data),
                nullPrototypeSchema);
              if (test.valid) {
                result.should.be.empty;
              } else {
                result.should.not.be.empty;
              }
            });
          }

        }, this);
      });
    }, this);

  }
});
