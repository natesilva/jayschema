# 0.1.5

* **FEATURE**: You can now query to see if a schema has been registered, by calling the `isRegistered(id)` method of the `JaySchema` class.

# 0.1.4

* **BUGFIX**: More consistent checks for registered schemas. Fixes issue #2: the `register()` method return value was showing some schemas missing, when in fact, they were registered.

# 0.1.3

* **BUGFIX**: The `getMissingSchemas()` method is fixed. It was showing some schemas as missing, when in fact, they were registered.
* **FEATURE**: You can pass a string instead of a schema to the `validate()` function. If the string is the `id` of a registered schema, your instance will be validated against that schema.

# 0.1.2

* The `JaySchema.errors` object is now exposed. Authors of schema loaders may wish to use the `JaySchema.errors.SchemaLoaderError` to signal failure to load a requested schema.
* The included HTTP loader now works with HTTPS as well, and follows 3XX redirects.

# 0.1.1

* Nested `$ref`s which refer to other `$ref`s are now handled correctly.

# 0.1.0

* First non-beta release.

# 0.1.0-beta.5

* Updated test suite to include the new draft4 tests in JSON-Schema-Test-Suite.
* Better internal handling of schema registration.
* Fixed bugs related to using a URN schema id.
* Fixed a bug affecting the "multipleOf" keyword when using very small numbers.

# 0.1.0-beta.4

* Improved performance and reduced memory usage.
* Internal code organization clean-up.

# 0.1.0-beta.3

* Improved performance as indicated by profiling.

# 0.1.0-beta

* Updated version number to 0.1.0-beta, as 0.1.0 is the likely version number of the first non-beta release.
* :new: — Support for the `format` keyword. All formats defined in the spec are supported: `date-time`, `email`, `hostname`, `ipv4`, `ipv6` and `uri`.

# 0.0.1-beta

* :exclamation: — **[breaking change]** The `validate()` method no longer auto-downloads schemas from HTTP. If you rely on this functionality, the following code is equivalent:
    * Old code (with auto HTTP loading): `var js = new JaySchema();`
    * New equivalent: `var js = new JaySchema(JaySchema.loaders.http);`
* :new: — **[major feature]** Customizable loader for external schemas. You can provide a custom loader that will be called when an external schema is referenced. This allows you to reference schemas that are stored in a database, downloaded from HTTP, or by any other method you choose.
* Upgraded to beta—no further breaking changes are planned for this release.

# 0.0.1-alpha

* :new: — Initial release
