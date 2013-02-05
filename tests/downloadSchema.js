// Unit tests. Run with mocha.

/*global describe:true it:true */


var assert = require('assert')
  , downloadSchema = require('../downloadSchema.js')
  ;

describe('GET request wrapper:',
  function()
{
  describe('retrieve JSON Schema Draft V4 schema:', function() {

    it('should retrieve the schema', function(done) {
      var url = 'http://json-schema.org/draft-04/schema#';
      downloadSchema(url, function(err, schema) {
        if (err) { throw err; }
        assert.equal(url, schema.id);
        done();
      });
    });

    it('should fail to retrieve the URL', function(done) {
      var url = 'http://google.com/404';
      downloadSchema(url, function(err, json) {
        assert(err);
        done();
      });
    });

    it('should fail to get a schema', function(done) {
      var url = 'http://google.com/';
      downloadSchema(url, function(err, json) {
        assert(err);
        done();
      });
    });

  });

});
