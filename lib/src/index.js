'use strict';

var gs = require('glob-stream');
var pipeline = require('stream').pipeline || require('pump'); // streamx y pipeline no son compatibles con Node 4.x
var toThrough = require('to-through');
var isValidGlob = require('is-valid-glob');
var normalizePath = require('normalize-path');
var createResolver = require('resolve-options');

var config = require('./options');
var prepare = require('./prepare');
var wrapVinyl = require('./wrap-vinyl');
var sourcemap = require('./sourcemap');
var readContents = require('./read-contents');
var resolveSymlinks = require('./resolve-symlinks');

function normalize(glob) {
  return normalizePath(glob, false);
}

function src(glob, opt) {
  var optResolver = createResolver(config, opt);

  if (!isValidGlob(glob)) {
    throw new Error('Invalid glob argument: ' + glob);
  }

  if (!Array.isArray(glob)) {
    glob = [glob];
  }

  glob = glob.map(normalize);

  // Cambia gs(glob, opt) por gs.create(glob, opt)
  var outputStream = gs.create(glob, opt);

  // Encadena los demás pasos usando .pipe, ya que pipeline no existe en Node 4.x estándar
  outputStream = outputStream
    .pipe(wrapVinyl(optResolver))
    .pipe(resolveSymlinks(optResolver))
    .pipe(prepare(optResolver))
    .pipe(readContents(optResolver))
    .pipe(sourcemap(optResolver));

  return toThrough(outputStream);
}

module.exports = src;