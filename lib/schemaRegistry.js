//
// Register schemas and retrieve previously-registered schemas.
//

var url = require('url')
  , jsonPointer = require('./jsonPointer')
  ;


// ******************************************************************
// Constructor
// ******************************************************************
var SchemaRegistry = function() {
  this._schemas = {};
  this._missingSchemas = {};
};

// ******************************************************************
// [static] Given a schema’s id, returns the base URI name, removing
// any fragment sections.
// ******************************************************************
SchemaRegistry._getBaseUri = function(id) {
  var parts = url.parse(id);
  delete parts.hash;
  return url.format(parts);
};


// ******************************************************************
// Return boolean indicating whether the specified schema id has
// previously been registered.
// ******************************************************************
SchemaRegistry.prototype.isRegistered = function(id) {
  if (!id) { return false; }
  if (this._schemas.hasOwnProperty(id)) { return true; }
  var baseUri = SchemaRegistry._getBaseUri(id);
  return this._schemas.hasOwnProperty(baseUri);
};


// ******************************************************************
// [static] Helper to descend into an object, recursively gathering
// all $refs values from the given object and its sub-objects.
// ******************************************************************
SchemaRegistry._gatherRefs = function(obj) {
  var result = [];

  var currentObj = obj;
  var subObjects = [];

  do {

    if (currentObj.hasOwnProperty('$ref')) { result.push(currentObj.$ref); }

    var keys = Object.keys(currentObj);
    for (var index = 0, len = keys.length; index !== len; ++index) {
      var prop = currentObj[keys[index]];
      if (typeof prop === 'object') { subObjects.push(prop); }
    }

    currentObj = subObjects.pop();

  } while(currentObj);

  return result;
};


// ******************************************************************
// [static] Helper to descend into an object, recursively gathering
// all sub-objects that contain an id property.
// ******************************************************************
SchemaRegistry._getSubObjectsHavingIds = function(obj, resolutionScope) {
  var result = [];

  resolutionScope = resolutionScope || '#';
  var descentPath = '#';
  var currentObj = obj;
  var subObjects = [];
  var nextItem;

  do {

    if (currentObj.hasOwnProperty('id') && typeof currentObj.id === 'string') {
      resolutionScope = jsonPointer.resolve(resolutionScope, currentObj.id);
      result.push([currentObj, resolutionScope, descentPath]);
    }

    var keys = Object.keys(currentObj);
    for (var index = 0, len = keys.length; index !== len; ++index) {
      var prop = currentObj[keys[index]];
      if (typeof prop === 'object') {
        subObjects.push([prop, resolutionScope + '/' + keys[index],
          descentPath + '/' + keys[index]]);
      }
    }

    nextItem = subObjects.pop();
    if (nextItem) {
      currentObj = nextItem[0];
      resolutionScope = nextItem[1];
      descentPath = nextItem[2];
    }
  } while(nextItem);

  return result;
};


// ******************************************************************
// Return currently-unregistered schemas $referenced by the given
// schema.
// ******************************************************************
SchemaRegistry.prototype._missingRefsForSchema = function(schema) {
  var allRefs = SchemaRegistry._gatherRefs(schema);
  var missingRefs = [];

  allRefs.forEach(function(ref) {
    if (ref[0] !== '#') {
      var baseUri = SchemaRegistry._getBaseUri(ref);
      if (!this._schemas.hasOwnProperty(baseUri)) {
        missingRefs.push(baseUri);
      }
    }
  }, this);

  return missingRefs;
};


// ******************************************************************
// Register a schema (internal implementation)
// ******************************************************************
SchemaRegistry.prototype._registerImpl = function(schema, id, _resolutionScope,
  _path)
{
  // sanity check
  if (typeof schema !== 'object' || Array.isArray(schema)) { return []; }

  if (id) {
    var resolvedId = jsonPointer.resolve(_resolutionScope || id, id);
    var baseUri = SchemaRegistry._getBaseUri(resolvedId);

    var parts = url.parse(id);
    var isFragment = !(!parts.hash || parts.hash === '#' || parts.hash === '');
    if (!isFragment && this.isRegistered(baseUri)) { return; }

    if (isFragment) {
      // not necessary to register JSON pointer fragments
      if (parts.hash.slice(0, 2) === '#/') { return; }

      // fragment of a top-level schema
      if (this.isRegistered(baseUri)) {
        if (!this._schemas[baseUri].fragments.hasOwnProperty(parts.hash)) {
          this._schemas[baseUri].fragments[parts.hash] = _path;
        }
      }
    } else {
      // a top-level schema
      if (!this._schemas.hasOwnProperty(baseUri)) {
        this._schemas[baseUri] = { schema: schema, fragments: {} };
        _path = '#';
      }
    }
  }
};

// ******************************************************************
// Register a schema (public interface)
// ******************************************************************
SchemaRegistry.prototype.register = function(schema, id) {
  id = id || schema.id;
  this._registerImpl(schema, id);

  // register any id'd sub-objects
  var toRegister = SchemaRegistry._getSubObjectsHavingIds(schema, id);
  toRegister.forEach(function(item) {
    this._registerImpl(item[0], item[0].id, item[1], item[2]);
  }, this);

  // save any missing refs to support the getMissingSchemas method
  var missing = this._missingRefsForSchema(schema);
  missing.forEach(function(item) {
    this._missingSchemas[item] = true;
  }, this);

  return missing;
};

// ******************************************************************
// Get an array of $refs for which we don’t have a schema yet.
// ******************************************************************
SchemaRegistry.prototype.getMissingSchemas = function() {
  var result = Object.keys(this._missingSchemas);
  result = result.filter(function(item) {
    return !this.isRegistered(item);
  }, this);
  return result;
};

// ******************************************************************
// Retrieve a previously-registered schema.
// ******************************************************************
SchemaRegistry.prototype.get = function(id) {
  var parts = url.parse(id);
  var fragment = parts.hash;
  delete parts.hash;
  var baseUri = url.format(parts);

  if (!this.isRegistered(baseUri)) { return null; }

  if (!fragment || fragment === '#' || fragment === '') {
    // base, non-fragment URI
    return this._schemas[baseUri].schema;
  } else {

    // It’s a fragment, and can be either a JSON pointer or a URI
    // fragment identifier. In the latter case, look up the
    // corresponding JSON pointer and proceed.

    if (fragment.slice(0, 2) !== '#/') {  // URI fragment
      fragment = this._schemas[baseUri].fragments[fragment] || fragment;
    }

    var path = fragment.slice(2).split('/');
    var currentSchema = this._schemas[baseUri].schema;
    while (path.length) {
      var element = jsonPointer.decode(path.shift());
      if (!currentSchema.hasOwnProperty(element)) { return null; }
      currentSchema = currentSchema[element];
    }

    return currentSchema;
  }
};

module.exports = SchemaRegistry;
