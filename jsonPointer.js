//
// http://tools.ietf.org/html/draft-ietf-appsawg-json-pointer-07
//

'use strict';

var url = require('url')
  ;

// ******************************************************************
// decode escape sequences
// ******************************************************************
exports.decode = function(pointer) {
  var result = pointer.replace(/\~1/g, '/');
  return result.replace(/\~0/g, '~');
};

// ******************************************************************
// resolve a relative id against its parent scope
// ******************************************************************
exports.resolve = function(from, to) {
  var result = url.resolve(from, to);
  var parts = url.parse(result);
  if (!parts.hash) {
    parts.hash = '#';
    result = url.format(parts);
  }
  return result;
};
