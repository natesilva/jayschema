// Unit tests. Run with mocha.

/*global describe:true it:true should:true */


var should = require('should')
  , JaySchema = require('../lib/jayschema.js')
  ;

describe('Sub-schemas:',
  function()
{
  // test for issue found in #42
  describe('anonymous sub-schemas used in failed oneOf validation should not ' +
    'overwrite earlier error messages:', function()
  {
    var js = new JaySchema();

    var schema = {
      type: 'object',
      properties: {
        result: {
          oneOf: [
            { type: 'string' },
            { type: 'number', 'enum': [400, 401, 404, 500] }
          ]
        }
      }
    };

    var instance = { result: false };
    var errs = js.validate(instance, schema);

    it('should show separate validation errors for each sub-schema', function()
    {
      errs.should.be.instanceOf(Array).and.have.lengthOf(1);
      errs[0].should.have.property('subSchemaValidationErrors');
      var ssves = errs[0].subSchemaValidationErrors;
      ssves.should.have.property('sub-schema-1');
      ssves.should.have.property('sub-schema-2');
    });
  });

  describe('anonymous sub-schemas used in failed anyOf validation should not ' +
    'overwrite earlier error messages:', function()
  {
    var js = new JaySchema();

    var schema = {
      type: 'object',
      properties: {
        result: {
          anyOf: [
            { type: 'string' },
            { type: 'number', 'enum': [400, 401, 404, 500] }
          ]
        }
      }
    };

    var instance = { result: false };
    var errs = js.validate(instance, schema);

    it('should show separate validation errors for each sub-schema', function()
    {
      errs.should.be.instanceOf(Array).and.have.lengthOf(1);
      errs[0].should.have.property('subSchemaValidationErrors');
      var ssves = errs[0].subSchemaValidationErrors;
      ssves.should.have.property('sub-schema-1');
      ssves.should.have.property('sub-schema-2');
    });
  });
});
