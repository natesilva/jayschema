// Unit tests. Run with mocha.

/*global describe:true it:true should:true */


var should = require('should')
  , JJSchema = require('../jjschema.js')
  ;

describe('JSON references:',
  function()
{
  describe('reference previously manually-registered schema:', function() {

    var jj = new JJSchema();
    jj.debug = true;
    var sch;

    var otherSchema = {
      id: 'http://foo.bar/name#',
      type: 'object',
      required: ['first', 'last'],
      properties: {
        first: { type: 'string' },
        last: { type: 'string' }
      }
    };

    jj.register(otherSchema);

    it('should validate', function() {
      sch = {
        type: 'object',
        properties: {
          name: { $ref: 'http://foo.bar/name#' }
        }
      };

      jj.validate({name: {first: 'Mohammed', last: 'Chang'}}, sch)
        .should.be.empty;
    });

    it('should fail validation', function() {
      sch = {
        type: 'object',
        properties: {
          name: { $ref: 'http://foo.bar/name#' }
        }
      };

      jj.validate({name: {last: 'Chang'}}, sch).should.not.be.empty;
    });

  });

});
