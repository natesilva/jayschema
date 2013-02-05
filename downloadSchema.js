//
// Wrapper for http.get.
//

var http = require('http')
  , Errors = require('./errors.js')
  ;


module.exports = function(url, callback) {

  http.get(url, function(res) {

    if (res.statusCode < 200 || res.statusCode >= 300) {
        var desc = 'could not GET URL: ' + url + ' (error' + res.statusCode +
          ')';
        var err = new Errors.ValidationError(null, null, null, null, null,
          desc);
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
      } catch (SyntaxError) {
        var desc = 'could not parse data from URL as JSON: ' + url;
        var err = new Errors.ValidationError(null, null, null, null, null,
          desc);
        return callback(err);
      }
    });

    res.on('error', function() {
      var desc = 'could not GET URL: ' + url;
      var err = new Errors.ValidationError(null, null, null, null, null, desc);
      callback(err);
    });

  });

};
