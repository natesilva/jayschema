var fs = require('fs')
  , path = require('path');

function getTests(dir) {
  var dirEntries = fs.readdirSync(dir);

  var files = [];
  var dirs = [];

  dirEntries.forEach(function(entry) {
    var fullPath = path.join(dir, entry);
    var stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      dirs.push(fullPath);
    } else if (stats.isFile()) {
      if (path.extname(entry) === '.json') {
        files.push(fullPath);
      }
    }
  });

  dirs.forEach(function(dir) {
    files = files.concat(getTests(dir));
  });

  return files;
}
exports.getTests = getTests;

function shouldSkip(jsonFile, testGroup, test, BLACKLISTED_TESTS) {
  var basename = path.basename(jsonFile);
  if (basename in BLACKLISTED_TESTS) {
    var items = BLACKLISTED_TESTS[basename];
    if ('*' in items) { return true; }
    if (testGroup in items) {
      if ('*' in items[testGroup] || test in items[testGroup]) {
        return true;
      }
    }
  }

  return false;
}
exports.shouldSkip = shouldSkip;
