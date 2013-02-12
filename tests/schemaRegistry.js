// Unit tests. Run with mocha.

/*global describe:true it:true */


var should = require('should')
  , SchemaRegistry = require('../lib/schemaRegistry.js')
  , core = require('../lib/suites/draft-04/core.js')
  ;

describe('SchemaRegistry:', function() {

  describe('register basic schema:', function() {

    var reg = new SchemaRegistry();
    var sch = {
      id: 'http://foo.bar/baz',
      type: 'integer'
    };

    it('should register schema', function() {
      reg.register(sch).should.be.empty;
      var result = reg.get(sch.id);
      core.jsonEqual(result, sch).should.be.true;
    });

    it('should retrieve schema differing only by empty fragment', function() {
      reg.register(sch).should.be.empty;
      var result = reg.get(sch.id + '#');
      core.jsonEqual(result, sch).should.be.true;
    });

  });

  describe('register schema with external reference:', function() {

    var reg = new SchemaRegistry();
    var sch = {
      id: 'http://foo.bar/baz',
      oneOf: [
        { $ref: 'http://this.is.missing/qux#' }
      ]
    };

    it('should register schema', function() {
      reg.register(sch).should.eql(['http://this.is.missing/qux']);
      var result = reg.get(sch.id);
      core.jsonEqual(result, sch).should.be.true;
    });

    it('second register call for the same should return same missing list',
    function()
    {
      reg.register(sch).should.eql(['http://this.is.missing/qux']);
      reg.register(sch).should.eql(['http://this.is.missing/qux']);
    });
  });

  describe('schema with /definitions section:', function() {

    var reg = new SchemaRegistry();
    var sch = {
      id: 'http://foo.bar/baz',
      oneOf: [
        { $ref: '#/definitions/foo' }
      ],
      definitions: {
        foo: { type: 'integer' },
        bar: { id: '#bar', type: 'string' }
      }
    };

    it('should register schema', function() {
      reg.register(sch).should.be.empty;
      reg.get(sch.id + '#/definitions/foo').should.eql({type: 'integer'});
      reg.get(sch.id + '#bar').should.eql({id: '#bar', type: 'string'});
      reg.get(sch.id + '#/definitions/bar').should.eql({id: '#bar',
        type: 'string'});
    });
  });

  describe('multiple missing schemas:', function() {

    var reg = new SchemaRegistry();
    var sch1 = {
      id: 'http://foo.bar/baz',
      oneOf: [
        { $ref: 'http://company.com/foo/' }
      ],
      definitions: {
        foo: { type: 'integer' },
        bar: { id: '#bar', type: 'string' },
        qux: { $ref: 'http://organization.org/bar/' }
      }
    };
    var sch2 = {
      oneOf: [
        { $ref: 'http://organization.org/bar/' },
        { $ref: 'http://foo.bar/qux' },
        { $ref: 'http://some.site/and/some/schema#' }
      ]
    };

    it('should be able to return merged missing schemas', function() {
      reg.register(sch1).should.have.length(2);
      reg.register(sch2).should.have.length(3);
      reg.getMissingSchemas().should.have.length(4);
    });
  });

});
