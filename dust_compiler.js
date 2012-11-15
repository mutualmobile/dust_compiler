#! /usr/bin/env node
// dust_compiler.js  
// Watch directory of dust.js templates and automatically compile them
// inspired by Dan McGrady http://dmix.ca, author of duster.js
// authored by George Henderson, Mutual Mobile
// published by Peter Zhang, Mutual Mobile
var options = process.argv.slice(2),
    input_path = options[0] || "./templates", // directory of dust templates are stored with .dust file extension
    output_path = options[1] || "./compiled_templates/", // directory where the compiled .js files should be saved to
    fs = require('fs'),
    dust = require('dustjs-linkedin'),
    watch = require('watch'),
    wrench = require("wrench"),
    packageInfo = require('./package.json');

switch (options[0]) {
  case undefined:
    console.log('Usage: dust_compiler {input_dir_path} {output_dir_path}');
    return;
    break;
  case '--version':
    console.log(packageInfo.version);
    return;
    break;
}

function compile_dust(path, curr, prev) {
  fs.readFile(path, function(err, data) {
    if (err) throw err;

    var filename = path.split("/").reverse()[0].replace(".html", ""),
        filepath = output_path + filename + ".js",
        compiled = dust.compile(new String(data), filename);

    fs.writeFile(filepath, compiled, function(err) {
      if (err) throw err;
      console.log('Saved ' + filepath);
    });
  });
}

function compileAllTemplates(path) {
  wrench.readdirRecursive(path, function (error, files) {
    if (error) throw error;

    if (!files) {
      return;
    }
    files.forEach(function (file) {
      var pathToFile = path + '/' + file,
          stats = fs.lstatSync(pathToFile);
      if (file.indexOf(".svn") > -1) {
        return;
      }
      if (file.indexOf(".html") > -1 && file.indexOf(".svn") == -1) {
        compile_dust(pathToFile);
      }
      if (stats.isDirectory()) {
        compileAllTemplates(pathToFile);
      }
    });
    
  });
}

// Compile all templates
fs.mkdir(output_path, function() {
  compileAllTemplates(input_path);
});

// Start watch
watch.createMonitor(input_path, function (monitor) {
  console.log("Watching " + input_path);
  monitor.files['*.html', '*/*'];
  monitor.on("created", compile_dust);
  monitor.on("changed", compile_dust);
})