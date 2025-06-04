'use strict';

var Transform = require('stream').Transform;
var util = require('util');

function PrepareRead(optResolver) {
  Transform.call(this, { objectMode: true });
  this.optResolver = optResolver;
}
util.inherits(PrepareRead, Transform);

PrepareRead.prototype._transform = function(file, enc, callback) {
  var since = this.optResolver.resolve('since', file);

  if (file.stat) {
    // Skip this file if since option is set and current file is too old
    if (Math.max(file.stat.mtime, file.stat.ctime) <= since) {
      return callback();
    }
  }

  return callback(null, file);
};

function prepareRead(optResolver) {
  return new PrepareRead(optResolver);
}

module.exports = prepareRead;