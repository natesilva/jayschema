// Unit tests. Run with mocha.
//
// Execute tests defined in the JSON Schema Test Suite from:
// https://github.com/json-schema/JSON-Schema-Test-Suite
//
// At the time of this writing, the tests are against JSON Schema
// Draft v3 (we support v4). Therefore some of the tests are not
// applicable, or fail due to specification changes. Those tests are
// are blacklisted and skipped below.

/*global describe:true it:true */


var should = require('should')
  , JaySchema = require('../lib/jayschema.js')
  , fs = require('fs')
  , path = require('path')
  , helpers = require("./helpers.js")
  ;

// support Node 0.6.x
var existsSync = fs.existsSync || path.existsSync;

var BLACKLISTED_TESTS = {

  'format.json': {
    '*': '"format": "regex" not in v4 (use the "pattern" keyword instead)'
  },

  'dependencies.json': {
    dependencies: {
      '*': 'dependency values must be array or object in v4 (§ 5.4.5.1)'
    }
  },

  'disallow.json': {
    '*': 'disallow keyword removed from v4'
  },

  'divisibleBy.json': {
    '*': 'divisibleBy keyword removed from v4 (see multipleOf)'
  },

  'required.json': {
    '*': '"required" works differently in v4'
  },

  'type.json': {
    'any type matches any type': {
      '*': 'the "any" type is not in v4'
    },

    'integer type matches integers': {
      'a float is not an integer even without fractional part':
        'no longer enforced in v4'
    },

    'types can include schemas': {
      '*': 'types cannot include schemas in v4'
    },

    'when types includes a schema it should fully validate the schema': {
      '*': 'types cannot include schemas in v4'
    },

    'types from separate schemas are merged': {
      '*': 'types cannot include schemas in v4'
    }
  },

  'extends.json': {
    '*': 'extends keyword removed from v4'
  },

  'jsregex.json': {
    '*': 'feature not in v4 (use the "pattern" keyword instead)'
  },

  'zeroTerminatedFloats.json': {
    '*': 'no longer enforced in v4'

  },

  'ref.json': {
    'remote ref, containing refs itself': {
      '*': 'not testing remote refs in draft3 (we do the draft4 version of ' +
        'this test)'
    }
  }
};

describe('JSON Schema Test Suite:', function() {

  var testPath = path.join(__dirname, 'JSON-Schema-Test-Suite', 'tests',
    'draft3');

  it('should find the JSON-Schema-Test-Suite tests (do `git submodule init; ' +
    'git submodule update` to include them)', function()
  {
    existsSync(testPath).should.be.true;
  });

  if (!existsSync(testPath)) { return; }

  var files = helpers.getTests(testPath);

  for (var index = 0, len = files.length; index !== len; ++index) {
    var jsonFile = files[index];
    var testGroups = require(jsonFile);

    testGroups.forEach(function(group) {
      describe(path.relative('.', jsonFile) + '|' + group.description + ':',
        function()
      {
        group.tests.forEach(function(test) {

          if (!helpers.shouldSkip(jsonFile, group.description, test.description, BLACKLISTED_TESTS)) {
            it(test.description, function() {
              var jj = new JaySchema();
              var result = jj.validate(test.data, group.schema);
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
