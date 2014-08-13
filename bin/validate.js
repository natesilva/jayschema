#!/usr/bin/env node

// simple command-line validation

var JaySchema = require('../lib/jayschema.js')
  , fs = require('fs')
  , path = require('path')
  ;
var packagejson = require(path.join(__dirname, '..', 'package.json'));  

// support Node 0.6.x
var existsSync = fs.existsSync || path.existsSync;

var META_SCHEMA_PATH = path.join(__dirname, '..', 'lib', 'suites', 'draft-04', 'json-schema-draft-v4.json');
var META_SCHEMA = require(META_SCHEMA_PATH);

// init yargs
var yargs = require('yargs')
    .usage('jayschema [Options] <instance> [<schema>]\n\tif <schema> is omitted, the <instance> will be validated\n\tagainst the JSON Schema Draft v4 meta-schema')
    .example("jayschema path/to/instance path/to/schema", "example without register")
    .example("jayschema --register path/to/schema/register path/to/instance path/to/schema", "example with one register")
    .example("jayschema --register path/to/schema/register1,path/to/file/register2 path/to/instance path/to/schema", "example to add multiple register")
    .options('r', {
        "alias" : 'register',
        //~ "default" : [],
        "describe" : 'register externally-referenced schemas'
    })
    .options('h', {
        "alias" : 'help',
        "describe" : ' output usage information'
    })
    .options('v', {
        "alias" : 'version',
        "describe" : ' output version'
    })
;    
options = yargs.argv;
    
// read commands <instance> and <schema>
var instance = undefined;
var schema = META_SCHEMA_PATH;
if (options._.length > 0) { instance = options._[0]; }
if (options._.length > 1) { schema = options._[1]; }

var syntax = function() {
  yargs.showHelp();
  process.exit(0);
};

if (options.h) {
  return syntax();
}

if (options.v) {
  var version = []
  version.push(packagejson.name)
  version.push(" v")
  version.push(packagejson.version)
  version = version.join("")
  console.log(version)
  process.exit(0);
}

var registers = [];
if (options.r) {
  registers = options.r.split(",");
  for ( idx in registers) {
    if (!existsSync(registers[idx])) {
      console.error('ERR: register', '"' + registers[idx] + '"', 'not found');
      return;
    }
  }
}

if (!instance || !schema) {
  return syntax();
}

if (!existsSync(instance)) {
  console.error('ERR: instance', '"' + instance + '"', 'not found');
  return;
}

if (!existsSync(schema)) {
  console.error('ERR: schema', '"' + schema + '"', 'not found');
  return;
}

var instanceRaw = fs.readFileSync(instance);
var schemaRaw = fs.readFileSync(schema);

try {
  var instanceJson = JSON.parse(instanceRaw);
} catch (e) {
  console.error('ERR: instance is not valid JSON');
  return;
}

try {
  var schemaJson = JSON.parse(schemaRaw);
} catch (e) {
  console.error('ERR: schema is not valid JSON');
  return;
}

var js = new JaySchema();
for (idx in registers) {
  js.register(require(registers[idx]));
}

var schemaErrors = js.validate(schemaJson, META_SCHEMA);
if (schemaErrors.length) {
  console.error('ERR: schema is not valid JSON Schema Draft v4');
  console.log(require('util').inspect(schemaErrors, false, null));
  return;
}

var result = js.validate(instanceJson, schemaJson);

if (result.length === 0) {
  console.log('validation OK');
} else {
  console.log('validation errors:');
  console.log(require('util').inspect(result, false, null));
}
