'use strict';

var Transform = require('stream').Transform;
var util = require('util');

var readDir = require('./read-dir');
var readStream = require('./read-stream');
var readBuffer = require('./read-buffer');
var readSymbolicLink = require('./read-symbolic-link');

function ReadContents(optResolver) {
  Transform.call(this, { objectMode: true });
  this.optResolver = optResolver;
}
util.inherits(ReadContents, Transform);

ReadContents.prototype._transform = function(file, enc, callback) {
  var self = this;

  function onRead(readErr) {
    if (readErr) {
      return callback(readErr);
    }
    callback(null, file);
  }

  // Skip reading contents if read option says so
  var read = self.optResolver.resolve('read', file);
  if (!read) {
    return callback(null, file);
  }

  // Don't fail to read a directory
  if (file.isDirectory()) {
    return readDir(file, self.optResolver, onRead);
  }

  // Process symbolic links included with `resolveSymlinks` option
  if (file.stat && file.stat.isSymbolicLink()) {
    return readSymbolicLink(file, self.optResolver, onRead);
  }

  // Read and pass full contents
  var buffer = self.optResolver.resolve('buffer', file);
  if (buffer) {
    return readBuffer(file, self.optResolver, onRead);
  }

  // Don't buffer anything - just pass streams
  return readStream(file, self.optResolver, onRead);
};

function readContents(optResolver) {
  return new ReadContents(optResolver);
}

module.exports = readContents;