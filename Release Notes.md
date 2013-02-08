# 0.0.1-beta

* :exclamation: — **[breaking change]** The `validate()` method no longer auto-downloads schemas from HTTP. If you rely on this functionality, the following code is equivalent:
    * Old code (with auto HTTP loading): `var js = new JaySchema();`
    * New equivalent: `var js = new JaySchema(JaySchema.loaders.http);`
* :new: — **[major feature]** Customizable loader for external schemas. You can provide a custom loader that will be called when an external schema is referenced. This allows you to reference schemas that are stored in a database, downloaded from HTTP, or by any other method you choose.
* Upgraded to beta—no further breaking changes are planned for this release.

# 0.0.1-alpha

* :new: — Initial release
