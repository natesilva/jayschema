# JaySchema: JavaScript JSON Schema Validator

## A comprehensive validator for Node.js

**JaySchema** is a validator for testing JSON objects against a [**JSON Schema Draft v4**](http://json-schema.org/documentation.html) schema.

This is the first release and should be considered alpha-quality code.

## What it is

Have you ever wanted to validate JSON data server-side?

Maybe you have a JSON-based API and you need to make sure incoming values are valid. Or perhaps you’re using a database that returns JSON documents, like many of today’s NoSQL databases, and you want to put strong constraints on incoming data.

You can use an [ORM](https://npmjs.org/browse/keyword/orm) to do this, but that solution is overkill if you only need validation. It also ties you to a single database backend. If you want to change databases, you’re stuck. You may even want to use multiple databases simultaneously—for example, session data in Redis and permanent data in MongoDB—and you want to validate both.

With **JaySchema** you create a rich JSON Schema describing your documents and then validate documents against it. You control the validation. It’s not tied to any database or backend. You get to use the really nice JSON Schema syntax (see the [official examples](http://json-schema.org/examples.html)), you get useful error messages, and it can even do some types of validation that aren’t supported by popular ORMs.

## Features

* **Comprehensive:** Covers all of the spec except the optional `format` property.
* **Tested:**
	* Passes all tests from the official [JSON Schema Test Suite](https://github.com/json-schema/JSON-Schema-Test-Suite) except those which are not applicable to Draft v4. (The Test Suite was designed with v3 in mind. When v4 tests are available, **JaySchema** will be tested against them.)
	* Passes hundreds of other unit tests, most written to test very specific aspects of the draft spec.
* **Friendly:** Error messages that tell you:
	* The exact location in your document where validation failed.
	* The exact location in the schema of the rule that caused validation failure.
	* If applicable, the value that was expected and the value that was seen in the document.
* **Handles `$ref`s correctly.** In JSON Schema, the `$ref` keyword is a powerful way to reference *other* schemas, public or private, and incorporate them into your schema.
	* `$ref`s to external documents are resolved and, optionally, downloaded.
	* Internal `$ref`s are resolved, whether using a URI fragment or [JSON Pointer](http://tools.ietf.org/html/draft-ietf-appsawg-json-pointer-07) syntax.

## Compatibility

**JaySchema** is compatible with [**JSON Schema Draft v4**](http://json-schema.org/documentation.html). It will __not__ validate most Draft v3 or earlier schemas.

## Installation

    npm install jayschema

## Usage

```js
// synchronous
var JaySchema = require('jayschema');
var schema = { … };
var doc = { … };
var jj = new JaySchema();
var errors = jj.validate(doc, schema);
if (errors.length) { console.error(errors); }
else { console.log('document validates!'); }
```
```js
// async
var JaySchema = require('jayschema');
var schema = { … };
var doc = { … };
var jj = new JaySchema();
jj.validate(doc, schema, function(errors) {
	if (errors.length) { console.error(errors); }
	else { console.log('document validates!'); }
});
```

## Error message example

Here’s a simple validation showing how error messages work:

```js
var schema = {
    "title": "Example Schema",
    "id": "http://some.site.somewhere/user-schema#",
    "type": "object",
    "required": ["firstName", "lastName"],
    "properties": {
        "firstName": {
            "type": "string"
        },
        "lastName": {
            "type": "string"
        },
        "age": {
            "description": "Age in years",
            "type": "integer",
            "minimum": 0
        }
    }
};

var doc = {
    "firstName": "Bob",
    "age": 22
};

var jj = new JaySchema();
console.log(jj.validate(doc, schema));
```

The result looks like this:

```js
[ { instanceContext: '#',
    resolutionScope: 'http://some.site.somewhere/user-schema#',
    constraintName: 'required',
    constraintValue: [ 'firstName', 'lastName' ],
    desc: 'missing: lastName',
    kind: 'ObjectValidationError' } ]
```

This tells us where the validation failed (`instanceContext`). In this case, it failed at the root level of our document, which is `#` in JSON Pointer syntax.

It also tells us what rule in the schema triggered the failure. The rule that triggered the failure was the constraint called `required`. We can see that the value of `required` is `[ 'firstName', 'lastName' ]`.

The `desc` property gives us more information about the failure. In this case, it tells us that the `lastName` field was missing.

There’s one other field of interest, the `resolutionScope`. This contains the `id` of the schema. If the schema had no `id` property (an *anonymous schema*), you would see an auto-generated `id` here.

## Unit tests

The author would appreciate reports of unit test failures. Use the Github “Issues” feature to report this. To run the unit tests:

* `git clone` the repo.
* Ensure you have [Mocha](http://visionmedia.github.com/mocha/) installed.
* From the repo top directory, run `npm install` to install dev-time dependencies.
* From the repo top directory, run `mocha tests`.

Note that some tests will appear as a yellow dot, indicating they are slow. This is normal for a few tests that do network I/O and does not need to be reported.

## API

### JaySchema([maxPreload])

**(Constructor)** The `maxPreload` option, if specified, is the maximum depth to recurse when retrieving `$ref` schemas over HTTP. The default is `5`.

### JaySchema.prototype.validate(instance, schema [, callback])

#### Return value

* **In synchronous mode:** An array of errors. Success is indicated by an empty array.
* **In async mode:** Returns the standard Node callback signature. The first argument will be an array of errors, if any errors occurred, or `undefined` on success.

#### Synchronous usage

If `callback` is not provided, the validation will be done synchronously.

In synchronous mode, if your schema references an external schema (an HTTP URI) using the `$ref` keyword, validation will fail. This is because retrieving a remote resource over HTTP requires asynchronous operation in Node.js.

If your schema is self contained (or if all external schemas have been registered using the `register` method), you can call `validate` synchronously.

#### Asynchronous usage

In asynchronous mode, external schema references (those with an HTTP URI) will be retrieved automatically (a process called *preloading*). In addition, any external schema references within *those* schemas will be retrieved, etc. To prevent infinite recursion, a `maxPreload` option can be passed to the constructor (default: `5`). This is the maximum depth of schema referrals to allow.

### JaySchema.prototype.register(schema [, resolutionScope])

Manually register a schema. Useful if you have several related schemas you are working with. The optional `resolutionScope` can be used to register a schema that doesn’t have an `id` property, or which is referenced using a unique resolution scope.
