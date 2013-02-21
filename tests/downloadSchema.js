// Unit tests. Run with mocha.

/*global describe:true it:true */


var assert = require('assert')
  , httpLoader = require('../lib/httpLoader.js')
  ;

describe('GET request wrapper:',
  function()
{
  describe('retrieve JSON Schema Draft V4 schema:', function() {

    it('should retrieve the schema', function(done) {
      var url = 'http://json-schema.org/draft-04/schema#';
      httpLoader(url, function(err, schema) {
        if (err) { throw err; }
        assert.equal(url, schema.id);
        done();
      });
    });

    it('should follow 3xx redirects to retrieve a schema', function(done) {
      var url = 'http://www.json-schema.org/draft-04/schema#';
      httpLoader(url, function(err, schema) {
        if (err) { throw err; }
        assert.equal('http://json-schema.org/draft-04/schema#', schema.id);
        done();
      });
    });

    it('should retrieve a schema over HTTPS (SSL)', function(done) {
      var url =
        'https://raw.github.com/json-schema/json-schema/master/draft-04/schema';
      httpLoader(url, function(err, schema) {
        if (err) { throw err; }
        assert.equal('http://json-schema.org/draft-04/schema#', schema.id);
        done();
      });
    });

    it('should fail to retrieve the URL', function(done) {
      var url = 'http://www.google.com/404';
      httpLoader(url, function(err) {
        assert(err);
        done();
      });
    });

    it('should fail to get a schema', function(done) {
      var url = 'http://www.google.com/';
      httpLoader(url, function(err) {
        assert(err);
        done();
      });
    });

  });

});
