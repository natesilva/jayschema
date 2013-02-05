// Unit tests. Run with mocha.

/*global describe:true it:true */


var should = require('should')
  , schemaValidator = require('../suites/draft-04.js')
  ;

describe('Core § 3.6 JSON value equality:', function() {
  describe('null:', function() {
    it('should be equal', function() {
      schemaValidator.jsonEqual(null, null).should.be.true;
    });

    it('should not be equal', function() {
      schemaValidator.jsonEqual(null, undefined).should.be.false;
      schemaValidator.jsonEqual(null, {}).should.be.false;
      schemaValidator.jsonEqual(null, 0).should.be.false;
      schemaValidator.jsonEqual(null, false).should.be.false;
      schemaValidator.jsonEqual(null, '').should.be.false;
    });
  });

  describe('boolean:', function() {
    it('should be equal', function() {
      schemaValidator.jsonEqual(true, true).should.be.true;
      schemaValidator.jsonEqual(false, false).should.be.true;
    });

    it('should not be equal', function() {
      schemaValidator.jsonEqual(true, false).should.be.false;
      schemaValidator.jsonEqual(false, true).should.be.false;
      schemaValidator.jsonEqual(true, {}).should.be.false;
      schemaValidator.jsonEqual(true, 0).should.be.false;
      schemaValidator.jsonEqual(true, '').should.be.false;
    });
  });

  describe('string:', function() {
    it('should be equal', function() {
      schemaValidator.jsonEqual('hello', 'hello').should.be.true;
    });

    it('should not be equal', function() {
      schemaValidator.jsonEqual('hello', 'goodbye').should.be.false;
      schemaValidator.jsonEqual('hello', {}).should.be.false;
      schemaValidator.jsonEqual('hello', 0).should.be.false;
      schemaValidator.jsonEqual('hello', '').should.be.false;
      schemaValidator.jsonEqual('0', 0).should.be.false;
    });
  });

  describe('number:', function() {
    it('should be equal', function() {
      schemaValidator.jsonEqual(17, 17).should.be.true;
      schemaValidator.jsonEqual(17, 17.0).should.be.true;
      schemaValidator.jsonEqual(3.14195, 3.14195).should.be.true;
      schemaValidator.jsonEqual(1/3, 1/3).should.be.true;
    });

    it('should not be equal', function() {
      schemaValidator.jsonEqual(7, '7').should.be.false;
      schemaValidator.jsonEqual(0, false).should.be.false;
      schemaValidator.jsonEqual(42.1, 42.2).should.be.false;
      schemaValidator.jsonEqual(42.1, 42).should.be.false;
    });
  });

  describe('array:', function() {
    it('should be equal', function() {
      schemaValidator.jsonEqual([], []).should.be.true;
      schemaValidator.jsonEqual(['a', 'b', 'c'], ['a', 'b', 'c'])
        .should.be.true;

      schemaValidator.jsonEqual(
        ['a', 'b', {foo: 'bar', baz: 42}],
        ['a', 'b', {baz: 42, foo: 'bar'}]
      ).should.be.true;
    });

    it('should not be equal', function() {
      schemaValidator.jsonEqual(['a', 'b', 'c'], ['a', 'c', 'b'])
        .should.not.be.true;
      schemaValidator.jsonEqual(['a', 'b', 'c'], ['a', 'b'])
        .should.not.be.true;
      schemaValidator.jsonEqual(['a', 'b'], ['a', 'b', 'c'])
        .should.not.be.true;
      schemaValidator.jsonEqual(
        ['a', 'b', {foo: 'bar', baz: 42}],
        ['a', 'b', {baz: 42, foo: 'bar', x:10}]
      ).should.not.be.true;
      schemaValidator.jsonEqual(['a', 'b'], {}).should.not.be.true;
    });
  });


  describe('object:', function() {
    it('should be equal', function() {
      schemaValidator.jsonEqual({}, {}).should.be.true;
      schemaValidator.jsonEqual({foo: 'bar', baz: 42}, {foo: 'bar', baz: 42})
        .should.be.true;
      schemaValidator.jsonEqual({foo: 'bar', baz: 42}, {baz: 42, foo: 'bar'})
        .should.be.true;

      schemaValidator.jsonEqual(
        {id: 1, posts: [37, 42], user: {name: 'Fred', friends: 55}},
        {user: {friends: 55, name: 'Fred'}, posts: [37, 42], id: 1}
      ).should.be.true;
    });

    it('should not be equal', function() {
      schemaValidator.jsonEqual({}, {age: 42}).should.not.be.true;
      schemaValidator.jsonEqual({}, null).should.not.be.true;
      schemaValidator.jsonEqual(
        {foo: 'bar', baz: 42},
        {foo: 'bar', baz: 42, qux: 37}
      ).should.not.be.true;
      schemaValidator.jsonEqual(
        {id: 1, posts: [37, 42], user: {name: 'Fred', friends: 55}},
        {user: {friends: 55, name: 'Fred'}, posts: [37, 42], id: 2}
      ).should.not.be.true;
    });
  });
});
