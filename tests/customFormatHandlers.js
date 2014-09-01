// Unit tests. Run with mocha.

/*global describe:true, it:true */
/*jshint -W110 */

var should = require('should')
  , JaySchema = require('../lib/jayschema.js')
  ;

describe('Custom handlers for the "format" keyword:', function() {
  describe('phone-us:', function() {
    var js = new JaySchema();

    var US_TEL_REGEXP = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    js.addFormat('phone-us', function(inst, schema) {
      if (US_TEL_REGEXP.test(inst)) { return null; }
      return 'must be a US phone number';
    });

    var schema = {
      type: 'string',
      format: 'phone-us'
    };

    it('should be a valid US phone number', function() {
      js.validate('212-555-4444', schema).should.be.empty;
      js.validate('2125554444', schema).should.be.empty;
      js.validate('(212) 555-4444', schema).should.be.empty;
    });

    it('should not be a valid US phone number', function() {
      js.validate('212-555', schema).should.not.be.empty;
      js.validate('212554444', schema).should.not.be.empty;
      js.validate('555-4444', schema).should.not.be.empty;
      js.validate(2125554444, schema).should.not.be.empty;
    });
  });

  describe('uri (override built-in):', function() {
    var jj = new JaySchema();

    var schema = {
      type: 'object',
      properties: {
        uri: { type: 'string', format: 'uri' }
      }
    };

    var CUSTOM_URI_REGEXP = new RegExp(
      "^([a-z0-9+.-]+):(?://(?:((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*)@)" +
      "?((?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*)(?::(\\d*))?(/(?:[a-z0-9-." +
      "_~!$&'()*+,;=:@/]|%[0-9A-F]{2})*)?|(/?(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0" +
      "-9A-F]{2})+(?:[a-z0-9-._~!$&'()*+,;=:@/]|%[0-9A-F]{2})*)?)(?:\\?((?:[a" +
      "-z0-9-._~!$&'()*+,;=:/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+" +
      ",;=:/?@]|%[0-9A-F]{2})*))?$");

    jj.addFormat('uri', function(inst, schema) {
      if (CUSTOM_URI_REGEXP.test(inst)) { return null; }
      return 'must be a valid URI';
    });

    it('should be a valid URI using our custom format', function() {
      var instance = {
        uri: 'http://www.google.com/trends/explore#q=esquivalience'
      };
      jj.validate(instance, schema).should.be.empty;
    });

    it('should not be a valid URI using our custom format', function() {
      var instance = {
        uri: '/trends/explore#q=esquivalience'
      };
      jj.validate(instance, schema).should.not.be.empty;
    });

    it('should not be a valid URI using our custom format', function() {
      var instance = 42;
      jj.validate(instance, schema).should.not.be.empty;
    });
  });
});
