//
// Wrapper for http.get.
//

var http = require('http')
  , Errors = require('./errors.js')
  ;


module.exports = function(url, callback) {

  http.get(url, function(res) {

    if (res.statusCode < 200 || res.statusCode >= 300) {
        var desc = 'could not GET URL: ' + url + ' (error ' + res.statusCode +
          ')';
        var err = new Errors.SchemaLoaderError(url, desc);
        return callback(err);
    }

    var json = '';
    res.on('data', function(chunk) {
      json += chunk;
    });

    res.on('end', function() {
      try {
        var schema = JSON.parse(json);
        return callback(null, schema);
      } catch (jsonError) {
        var desc = 'could not parse data from URL as JSON: ' + url;
        var err = new Errors.SchemaLoaderError(url, desc, jsonError);
        return callback(err);
      }
    });

    res.on('error', function(httpError) {
      var desc = 'could not GET URL: ' + url;
      var err = new Errors.SchemaLoaderError(url, desc, httpError);
      callback(err);
    });

  });

};
