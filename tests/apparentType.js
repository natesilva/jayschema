// Unit tests. Run with mocha.

/*global describe:true it:true */


var should = require('should')
  , schemaValidator = require('../lib/suites/draft-04')
  ;

describe('Core § 3.5 JSON Schema primitive types:', function() {
  describe('array:', function() {
    it('should return "array"', function() {
      schemaValidator.apparentType([]).should.equal('array');
      schemaValidator.apparentType([15, 37, 'abcdefg']).should.equal('array');
    });

    it('should not return "array" for non-array types', function() {
      schemaValidator.apparentType(true).should.not.equal('array');
      schemaValidator.apparentType(false).should.not.equal('array');
      schemaValidator.apparentType(0).should.not.equal('array');
      schemaValidator.apparentType(42).should.not.equal('array');
      schemaValidator.apparentType(42.1).should.not.equal('array');
      schemaValidator.apparentType(null).should.not.equal('array');
      schemaValidator.apparentType({foo: [1, 2, 3]}).should.not.equal('array');
      schemaValidator.apparentType('hello world').should.not.equal('array');
    });
  });

  describe('boolean:', function() {
    it('should return "boolean"', function() {
      schemaValidator.apparentType(true).should.equal('boolean');
      schemaValidator.apparentType(false).should.equal('boolean');
      schemaValidator.apparentType(1 === 1).should.equal('boolean');
      schemaValidator.apparentType(1 !== 1).should.equal('boolean');
    });

    it ('should not return "boolean" for non-boolean types', function() {
      schemaValidator.apparentType([true, false]).should.not.equal('boolean');
      schemaValidator.apparentType(0).should.not.equal('boolean');
      schemaValidator.apparentType(42).should.not.equal('boolean');
      schemaValidator.apparentType(42.1).should.not.equal('boolean');
      schemaValidator.apparentType(null).should.not.equal('boolean');
      schemaValidator.apparentType({foo: [1, 2]}).should.not.equal('boolean');
      schemaValidator.apparentType('hello world').should.not.equal('boolean');
    });
  });

  describe('integer:', function() {
    it('should return "integer"', function() {
      schemaValidator.apparentType(42).should.equal('integer');
      schemaValidator.apparentType(42.0).should.equal('integer');
      schemaValidator.apparentType(0).should.equal('integer');
    });

    it ('should not return "integer" for non-integer types', function() {
      schemaValidator.apparentType([true, false]).should.not.equal('integer');
      schemaValidator.apparentType(true).should.not.equal('integer');
      schemaValidator.apparentType(false).should.not.equal('integer');
      schemaValidator.apparentType(42.1).should.not.equal('integer');
      schemaValidator.apparentType(null).should.not.equal('integer');
      schemaValidator.apparentType({foo: [1, 2]}).should.not.equal('integer');
      schemaValidator.apparentType('hello world').should.not.equal('integer');
    });
  });

  describe('number:', function() {
    it('should return "number"', function() {
      schemaValidator.apparentType(42.1).should.equal('number');
    });

    it ('should not return "number" for non-number types', function() {
      schemaValidator.apparentType([true, false]).should.not.equal('number');
      schemaValidator.apparentType(true).should.not.equal('number');
      schemaValidator.apparentType(false).should.not.equal('number');
      schemaValidator.apparentType(0).should.not.equal('number');
      schemaValidator.apparentType(42).should.not.equal('number');
      schemaValidator.apparentType(null).should.not.equal('number');
      schemaValidator.apparentType({foo: [1, 2, 3]}).should.not.equal('number');
      schemaValidator.apparentType('hello world').should.not.equal('number');
    });
  });

  describe('null:', function() {
    it('should return "null"', function() {
      schemaValidator.apparentType(null).should.equal('null');
    });

    it ('should not return "null" for non-null types', function() {
      schemaValidator.apparentType([true, false]).should.not.equal('null');
      schemaValidator.apparentType(true).should.not.equal('null');
      schemaValidator.apparentType(false).should.not.equal('null');
      schemaValidator.apparentType(0).should.not.equal('null');
      schemaValidator.apparentType(42).should.not.equal('null');
      schemaValidator.apparentType(42.1).should.not.equal('null');
      schemaValidator.apparentType({foo: [1, 2, 3]}).should.not.equal('null');
      schemaValidator.apparentType('hello world').should.not.equal('null');
    });
  });

  describe('object:', function() {
    it('should return "object"', function() {
      schemaValidator.apparentType({}).should.equal('object');
      schemaValidator.apparentType({a: 1, b: 2}).should.equal('object');
      schemaValidator.apparentType({foo: {a: 1, b: 2}}).should.equal('object');
      schemaValidator.apparentType({bar: [13, 17, 42]}).should.equal('object');
    });

    it ('should not return "object" for non-object types', function() {
      schemaValidator.apparentType([true, false]).should.not.equal('object');
      schemaValidator.apparentType(true).should.not.equal('object');
      schemaValidator.apparentType(false).should.not.equal('object');
      schemaValidator.apparentType(0).should.not.equal('object');
      schemaValidator.apparentType(42).should.not.equal('object');
      schemaValidator.apparentType(42.1).should.not.equal('object');
      schemaValidator.apparentType(null).should.not.equal('object');
      schemaValidator.apparentType('hello world').should.not.equal('object');
    });

    it('should not mistake null or Array for "object"', function() {
      schemaValidator.apparentType(null).should.not.equal('object');
      schemaValidator.apparentType(['a', 'b', 'c']).should.not.equal('object');
    });
  });

  describe('string:', function() {
    it('should return "string"', function() {
      schemaValidator.apparentType('hello world').should.equal('string');
    });

    it ('should not return "string" for non-string types', function() {
      schemaValidator.apparentType([true, false]).should.not.equal('string');
      schemaValidator.apparentType(true).should.not.equal('string');
      schemaValidator.apparentType(false).should.not.equal('string');
      schemaValidator.apparentType(0).should.not.equal('string');
      schemaValidator.apparentType(42).should.not.equal('string');
      schemaValidator.apparentType(42.1).should.not.equal('string');
      schemaValidator.apparentType(null).should.not.equal('string');
      schemaValidator.apparentType({foo: 'hello'}).should.not.equal('string');
    });
  });
});
