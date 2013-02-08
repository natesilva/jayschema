# JaySchema: JavaScript JSON Schema Validator

## Complete and convenient validator for Node.js

Use **JaySchema** to validate JSON objects using [**JSON Schema Draft v4**](http://json-schema.org/documentation.html). This is a pre-release (beta) version.

## Install

    npm install jayschema

## Usage

### Basic usage

```js
var JaySchema = require('jayschema');
var js = new JaySchema();
var instance = 64;
var schema = { "type": "integer", "multipleOf": 8 };

// synchronous…
console.log('synchronous result:', js.validate(instance, schema));

// …or async
js.validate(instance, schema, function(errs) {
    if (errs) { console.error(errs); }
    else { console.log('async validation OK!'); }
});
```
### Loading schemas from HTTP or from your database

Here a referenced schema is loaded using the example HTTP loader. You can also supply your own loader—for example, if you want to load schemas from a database.

```js
var JaySchema = require('jayschema');
var js = new JaySchema(JaySchema.loaders.http);     // we provide the HTTP loader here

var instance = { "location": { "latitude": 48.8583, "longitude": 2.2945 } };
var schema = {
    "type": "object",
    "properties": {
        "location": { "$ref": "http://json-schema.org/geo" }
    }
};

js.validate(instance, schema, function(errs) {
  if (errs) { console.error(errs); }
  else { console.log('validation OK!'); }
});
```

## Features

* **Complete:** Covers all of the spec. Hundreds of unit tests.
* **Excellent handling of $refs:** Properly handles all `$ref`s, internal and external.
* **Load $refs your way:** Ever want to load schemas from a database? With **JaySchema** you can provide a user-defined loader. When **JaySchema** encounters an external `$ref`, your loader will be called.
* **Helpful:** Error messages tell you:
	* The exact location in your document where validation failed.
	* The exact location in the schema of the rule that caused validation failure.
	* If applicable, the value that was expected and the value that was seen in the document.

## Why JSON Schema?

Have you ever wanted to validate JSON data server-side? Maybe you have a JSON-based API, or are using a NoSQL database that stores JSON documents.

You can use an [ORM](https://npmjs.org/browse/keyword/orm), but that’s overkill if you only need validation. And ORMs are often tied to a single database backend. What if you store session data in Redis and permanent data in MongoDB?

With **JaySchema** you create a rich JSON Schema describing your documents and then validate documents against it. You control the validation. It’s not tied to any database or backend. You get to use the really nice JSON Schema syntax (see the [official examples](http://json-schema.org/examples.html)), you get useful error messages, and it can even do some types of validation that aren’t supported by popular ORMs.

## API

### JaySchema([loader])

**(Constructor)** The optional *loader* will be called each time an external `$ref` is encountered. It should load the referenced schema and return it.

If you don’t reference any external schemas, you don’t need to provide a *loader*.

**If you provide a *loader*, you should call the validate() function asynchronously.** That’s because loading involves disk or network I/O, and I/O operations in Node are asynchronous.

Sample loader skeleton:

```js
function loader(ref, callback) {
    // ref is the schema to load
    // [ load your schema! ]
    if (errorOccurred) {
        callback(err);
    } else {      
        callback(null, schema);
    }
}
```

### JaySchema.prototype.validate(instance, schema [, callback])

Validate a JSON object, *instance*, against the given *schema*. If you provide a *callback*, validation will be done asynchronously.

#### Return value

* **async:** Uses the standard Node callback signature. The first argument will be an array of errors, if any errors occurred, or `undefined` on success.
* **synchronous:** If you don’t provide a callback, an array of errors will be returned. Success is indicated by an empty array.

### JaySchema.prototype.register(schema [, id])

Manually register *schema*. Useful if you have several related schemas you are working with. The optional *id* can be used to register a schema that doesn’t have an `id` property, or which is referenced using a unique id.

**Returns:** an array of missing schemas. A missing schema is one that was `$ref`erenced by the registered schema, but hasn’t been regisetered yet. If no missing schemas were referenced, an empty array is returned.

See [Schema loading](#schema-loading).

### JaySchema.prototype.getMissingSchemas()

Returns an array of missing schemas. A missing schema is one that was `$ref`erenced by a `register()`ed schema, but the referenced schema has not yet been loaded.

See [Schema loading](#schema-loading).

### Loaders

While you can define your own loader to pass to the constructor, JaySchema includes one built-in loader for your convenience.

#### JaySchema.loaders.http

Loads external `$ref`s using HTTP. :warning: **Caveat:** HTTP is inherently unreliable. For example, the network or site may be down, or the referenced schema may not be available any more. You really shouldn’t use this in production, but it’s great for testing.

### Configuration options

### maxRecursion

The maximum depth to recurse when retrieving external `$ref` schemas using a loader. The default is `5`.

## Schema loading

**JaySchema** provides a number of ways to load externally-referenced schemas.

In JSON Schema, you use the `$ref` keyword to pull in an external schema. For example, you might reference a schema that is available in a local database.

Validation will fail if **JaySchema** encounters a validation rule that references an external schema, if that schema is not `register`ed.

There are several ways to ensure that all referenced schemas are registered:

### Using a loader

Pass a `loader` callback to the `JaySchema` constructor. When an external schema is needed, **JaySchema** will call your loader. See the constructor documentation, above. **Using a loader requires you to validate asynchronously.**

### By using the `getMissingSchemas()` method

This works with synchronous or async code.

1. First, `register()` the main schemas you plan to use.
2. Next, call `getMissingSchemas`, which returns an array of externally-referenced schemas. 
3. Retrieve and `register()` each missing schema.
4. Repeat from step 2 until there are no more missing schemas.

### By using the `register()` return value

This works with synchronous or async code.

Each time you call `register(schema)`, the return value will be an array of missing external schemas that were referenced. You can use this to register the missing schemas.

Calling `register(schemaA);` will (1) register `schemaA` and (2) return a list of missing schemas that were referenced by `schemaA`.

If, instead, you want the list of *all* missing schemas referenced by all registrations that have been done so far, use the `getMissingSchemas()` method, above.

## Format specifiers

**JaySchema** supports the following values for the optional `format` keyword:

* `date-time`: Must match the `date-time` specification given in [RFC 3339, Section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
* `hostname`: Must match the “Preferred name syntax” given in [RFC 1034, Section 3.5](https://tools.ietf.org/html/rfc1034#section-3.5), with the exception that hostnames are permitted to begin with a digit, as per [RFC 1123 Section 2.1](http://tools.ietf.org/html/rfc1123#section-2.1).
* `email`: Must match [RFC 5322, Section 3.4.1](https://tools.ietf.org/html/rfc5322#section-3.4.1), with the following limitations: `quoted-string`s, `domain-literal`s, comments, and folding whitespace are not supported; the `domain` portion must be a hostname as in the `hostname` keyword.
* `ipv4`: Must be a dotted-quad IPv4 address.
* `ipv6`: Must be a valid IPv6 address as per [RFC 2373 section 2.2](http://tools.ietf.org/html/rfc2373#section-2.2).
* `uri`: As in [RFC 3986 Appendix A](http://tools.ietf.org/html/rfc3986#appendix-A), with the exception that well-formedness of internal elements, including percent encoding and authority strings, is not verified.