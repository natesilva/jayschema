// Unit tests. Run with mocha.

/*global describe:true it:true */


var should = require('should')
  , JaySchema = require('../lib/jayschema.js')
  , path = require('path')
  , helpers = require('./helpers.js')
  ;

var BLACKLISTED_TESTS = {

  'refsSync.json': {
    '*': 'these tests only apply in non-async mode'
  }

};

describe('Our test suite (running async):', function() {

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
            it(test.description, function(done) {
              var jj = new JaySchema(JaySchema.loaders.http);
              jj.validate(test.data, group.schema, function(errs) {
                if (test.valid) {
                  should.not.exist(errs);
                } else {
                  errs.should.not.be.empty;
                }
                done();
              });
            });
          }

        }, this);
      });
    }, this);

  }
});
