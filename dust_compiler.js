#! /usr/bin/env node
// dust_compiler.js
// Watch directory of dust.js templates and automatically compile them
// inspired by Dan McGrady http://dmix.ca, author of duster.js
// authored by George Henderson, Mutual Mobile
// published by Peter Zhang, Mutual Mobile
var options = process.argv.slice(2),
    allowedFileExtensions = ['.html', '.dust'],
    inputPath = options[0] || '.', // directory of dust templates are stored with .dust file extension
    outputPath = options[1] || '.', // directory where the compiled .js files should be saved to
    path = require('path'),
    exec = require('child_process').execFile,
    fs = require('fs'),
    dust = require('dustjs-linkedin'),
    watch = require('watch'),
    wrench = require('wrench'),
    packageInfo = require('./package.json'),
    watchOptions, root, notificationCenterBinary;

// Paths for OSX Notifications
notificationCenterBinary = 'osx/terminal-notifier.app/Contents/MacOS/terminal-notifier';

switch (options[0]) {
  case undefined:
    console.log('Usage: dust_compiler {input_dir_path} {output_dir_path}');
    return;
  case '--version':
    console.log(packageInfo.version);
    return;
}

function showNotification(success, filename) {
  var title = success ? 'Success' : 'Error',
      message = success ? 'Compiled ' + filename : 'Failed to compile ' + filename,
      group = 'dust_compiler',
      args = ['-title', title,
              '-message', message,
              '-group', group];
  exec(notificationCenterBinary, args);
}

function normalizeDirPath(dirPath) {
  // Force adding trailing slash
  return path.normalize(dirPath + path.sep);
}

function shouldProcessFile(filePath) {
  var ext = path.extname(filePath),
      filename = path.basename(filePath, ext),
      stats = fs.lstatSync(filePath),
      isDir = stats.isDirectory(),
      toReturn = false;

  if (isDir) {
  } else if (!filename) {
  } else if (allowedFileExtensions.indexOf(ext) == -1) {
  } else if (filename.charAt(0) == '.') {
  } else {
    return true;
  }

  return false;
}

function compileDust(sourceFilePath, stat) {
  if(!shouldProcessFile(sourceFilePath)) {
    return;
  }
  fs.readFile(sourceFilePath, function(err, data) {
    if (err) throw err;

    var ext = path.extname(sourceFilePath),
        filename = path.basename(sourceFilePath, ext),
        outputFilePath = outputPath + filename + '.js',
        compiled;

    try {
      compiled = dust.compile(new String(data), filename);
    } catch (e) {
      console.log('Error compiling ' + sourceFilePath);
      showNotification(false, filename + ext);
      return;
    }

    fs.writeFile(outputFilePath, compiled, function(err) {
      if (err) throw err;
      console.log('Saved ' + sourceFilePath);
      showNotification(true, filename + ext);
    });
  });
}

function compileAllTemplates(inputDirPath) {
  wrench.readdirRecursive(inputDirPath, function (error, files) {
    if (error) throw error;

    if (!files) {
      return;
    }
    files.forEach(function (file) {
      var fullPath = inputPath + file;
      compileDust(fullPath);
    });

  });
}

inputPath = normalizeDirPath(inputPath);
outputPath = normalizeDirPath(outputPath);

// Compile all templates
fs.mkdir(outputPath, function() {
  compileAllTemplates(inputPath);
});

// Start watch
watch.createMonitor(inputPath, function (monitor) {
  console.log('Watching ' + inputPath);
  monitor.on('created', compileDust);
  monitor.on('changed', compileDust);
});