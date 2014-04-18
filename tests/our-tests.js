// Unit tests. Run with mocha.

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

describe('Our test suite (running synchronously):', function() {

  var files = helpers.getTests(path.join(__dirname, 'our-tests'));

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
