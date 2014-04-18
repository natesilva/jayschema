var Errors = require('../lib/errors.js')
  , JaySchema = require('../lib/jayschema.js')
  , should = require('should');

describe("Errors", function() {
  describe("falsy values", function() {
    it("should set all values", function() {
      var error = new Errors.ValidationError(0, 0, 0, 0, 0, 0);
      
      error.resolutionScope.should.equal(0);
      error.instanceContext.should.equal(0);
      error.constraintName.should.equal(0);
      error.constraintValue.should.equal(0);
      error.testedValue.should.equal(0);
    });
    
    it("should set constraintValue", function() {
      var jj = new JaySchema();
      var result = jj.validate(1, {maximum: 0});
      result[0].constraintValue.should.equal(0);
    });
  });
});
