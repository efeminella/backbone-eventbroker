/**
 * Builds the distribution files from /src
 *
 * Includes code from Miller Medeiros, http://blog.millermedeiros.com/node-js-as-a-build-script/
 */

// DEPENDENCIES
var fs = require('fs'),
    util = require('util'),
    _ = require('underscore'),
    uglifyJS = require('uglify-js');

// CONFIG
var outputDir = __dirname + '/../dist',
    srcDir = __dirname + '/../src',
    templateDir = __dirname + '/templates',
    eol = '\n',
    fileEncoding = 'utf-8',
    packageJSON = JSON.parse(fs.readFileSync(__dirname + '/../package.json', fileEncoding));

// SETTINGS
// Use mustache template tags
_.templateSettings.interpolate = /\{\{(.+?)\}\}/g;


// TASKS
/**
 * Build the output by concatenating files and optionally wrapping them in a template
 *
 * @param {String[]} fileList         File paths, relative to current directory
 * @param {String} outputPath         Relative path to output file
 * @param {Object} [options]
 *
 * @param {String} [options.template] Template for adding headers/footers etc. Content will inserted in place of a {{body}} tag
 * @param {Object} [options.data]     Date to populate template tags (in {{tag}} format)
 */
function build(fileList, outputPath, options) {
  var out = fileList.map(function(filePath) {
    filePath = filePath;

    return fs.readFileSync(filePath, fileEncoding);
  });

  var content = out.join(eol);

  if (options && options.template) {
    var data = _.extend(options.data, {
      body: content
    });

    var templateString = fs.readFileSync(options.template, fileEncoding);

    content = _.template(templateString, data);
  }

  fs.writeFileSync(outputPath, content);

  console.log('READY: ' + outputPath);
}

/**
 * Minify files using UglifyJS
 * @param {String} srcPath          Relative path to source file
 * @param {outputPath} outputPath   Relative path to output file
 */
function uglify(srcPath, outputPath) {
  var parse = uglifyJS.parser.parse,
      uglify = uglifyJS.uglify;

  var output = parse(fs.readFileSync(srcPath, fileEncoding));

  output = uglify.ast_mangle(output);
  output = uglify.ast_squeeze(output);

  fs.writeFileSync(outputPath, uglify.gen_code(output), fileEncoding);

  console.log('READY: ' + outputPath);
}

// RUN
var fileList = [
  srcDir + '/backbone-eventbroker.js'
];

var templateData = {
  version: packageJSON.version
};

//Main file
build(fileList, outputDir + '/backbone-eventbroker.js', {
  template: templateDir + '/backbone-eventbroker.js',
  data: templateData
});
uglify(outputDir + '/backbone-eventbroker.js', outputDir + '/backbone-eventbroker.min.js');


//File for AMD (requireJS)
build(fileList, outputDir + '/backbone-eventbroker.amd.js', {
  template: templateDir + '/backbone-eventbroker.amd.js',
  data: templateData
});
uglify(outputDir + '/backbone-eventbroker.amd.js', outputDir + '/backbone-eventbroker.amd.min.js');
