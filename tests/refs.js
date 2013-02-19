// Unit tests. Run with mocha.

/*global describe:true it:true should:true */


var should = require('should')
  , JaySchema = require('../lib/jayschema.js')
  ;

describe('JSON references:',
  function()
{
  describe('reference previously manually-registered schema:', function() {

    var jj = new JaySchema();
    var sch;

    var otherSchema = {
      id: 'http://foo.bar/name#',
      type: 'object',
      required: ['first', 'last'],
      properties: {
        first: { $ref: '#/definitions/nameField' },
        last: { type: 'string' }
      },
      definitions: {
        nameField: { type: 'string' }
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

  describe('validate using the string id of a registered schema', function() {

    var jj = new JaySchema();

    var schema = {
      id: 'http://foo.bar/name#',
      type: 'object',
      required: ['first', 'last'],
      properties: {
        first: { $ref: '#/definitions/nameField' },
        last: { type: 'string' }
      },
      definitions: {
        nameField: { type: 'string' }
      }
    };

    jj.register(schema);

    it('should validate', function() {
      var data = {
        'first': 'John',
        'middle': 'Q.',
        'last': 'Public'
      };

      jj.validate(data, 'http://foo.bar/name#').should.be.empty;
    });

    it('should fail validation', function() {
      var data = {
        'first': 'John'
      };

      jj.validate(data, 'http://foo.bar/name#').should.not.be.empty;
    });

  });

});
