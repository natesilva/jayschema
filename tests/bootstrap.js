// Unit tests. Run with mocha.

/*global describe:true it:true should:true */


var should = require('should')
  , JJSchema = require('../jjschema.js')
  , v4Schema = require('../metaschemas/json-schema-draft-v4.json')
  ;

var schemaUrl = 'http://json-schema.org/draft-04/schema#';

describe('JSON schema self-validation test:', function() {
  describe('validate meta-schema (synchronously):', function() {
    var jj = new JJSchema();
    it('should self-validate the JSON Schema schema', function() {
      jj.validate(v4Schema, v4Schema).should.be.empty;
    });
  });

  describe('validate meta-schema (asynchronously):', function() {
    var jj = new JJSchema();
    it('should self-validate the JSON Schema schema', function(done) {
      jj.validate(v4Schema, {$ref: schemaUrl}, function(errs) {
        should.not.exist(errs);
        done();
      });
    });
  });

});
