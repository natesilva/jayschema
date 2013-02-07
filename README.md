# JaySchema: JavaScript JSON Schema Validator

## Complete and convenient validator for Node.js

Use **JaySchema** to validate JSON objects using [**JSON Schema Draft v4**](http://json-schema.org/documentation.html). This is a pre-release version: the API is subject to change.

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
### Using the optional HTTP loader (or load from your database)

Here a referenced schema is loaded using the built-in HTTP loader. You can also supply your own loader—for example, if you want to load schemas from a database.

```js
var JaySchema = require('jayschema');
var js = new JaySchema(JaySchema.loaders.http);     // we provide the HTTP loader here

var instance = { "location": { "latitude": 0, "longitude": 0 } };
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

* **Complete:** Covers all of the spec, except the optional `format` property. Hundreds of unit tests.
* **Excellent handling of $refs:** Properly handles all `$ref`s, internal and external.
* **Load $refs your way:** Ever want to load schemas from a database? With **JaySchema** you can provide a user-defined loader. When **JaySchema** encounters an external `$ref`, your loader will be called.
* **Helpful:** Error messages tell you:
	* The exact location in your document where validation failed.
	* The exact location in the schema of the rule that caused validation failure.
	* If applicable, the value that was expected and the value that was seen in the document.

## Why JSON Schema

Have you ever wanted to validate JSON data server-side?

Maybe you have a JSON-based API, or are using a NoSQL database that stores JSON documents.

You can use an [ORM](https://npmjs.org/browse/keyword/orm) fort this, but that’s overkill if you only need validation. And ORMs are often tied to a single database backend. What if you store session data in Redis and permanent data in MongoDB?

With **JaySchema** you create a rich JSON Schema describing your documents and then validate documents against it. You control the validation. It’s not tied to any database or backend. You get to use the really nice JSON Schema syntax (see the [official examples](http://json-schema.org/examples.html)), you get useful error messages, and it can even do some types of validation that aren’t supported by popular ORMs.

## API

### JaySchema([*loader*])

**(Constructor)** The optional `loader` will be called each time an external `$ref` is encountered. It should load the referenced schema and return it.

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

### JaySchema.prototype.validate(*instance*, *schema* [, *callback*])

Validate a JSON object, *instance*, against the given *schema*. If you provide a *callback*, validation will be done asynchronously.

#### Return value

* **async:** Uses the standard Node callback signature. The first argument will be an array of errors, if any errors occurred, or `undefined` on success.
* **synchronous:** If you don’t provide a callback, an array of errors will be returned. Success is indicated by an empty array.

### JaySchema.prototype.register(*schema* [, *id*])

Manually register *schema*. Useful if you have several related schemas you are working with. The optional *id* can be used to register a schema that doesn’t have an `id` property, or which is referenced using a unique id.

### Loaders

While you can define your own loader to pass to the constructor, JaySchema includes one built-in loader for your convenience.

#### JaySchema.loaders.http

Loads external `$ref`s using HTTP. **Caveat:** HTTP is inherently unreliable. For example, the network or site may be down, or the referenced schema may not be available any more. You really shouldn’t use this in production, but it’s great for testing.

### Configuration options

### maxRecursion

The maximum depth to recurse when retrieving external `$ref` schemas using a loader. The default is `5`.
