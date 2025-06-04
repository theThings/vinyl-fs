'use strict';

var Transform = require('stream').Transform;
var util = require('util');
var sourcemap = require('vinyl-sourcemap');

function SourcemapStream(optResolver) {
  Transform.call(this, { objectMode: true });
  this.optResolver = optResolver;
}
util.inherits(SourcemapStream, Transform);

SourcemapStream.prototype._transform = function(file, enc, callback) {
  var self = this;
  var srcMap = self.optResolver.resolve('sourcemaps', file);

  if (!srcMap) {
    return callback(null, file);
  }

  sourcemap.add(file, function(sourcemapErr, updatedFile) {
    if (sourcemapErr) {
      return callback(sourcemapErr);
    }
    callback(null, updatedFile);
  });
};

function sourcemapStream(optResolver) {
  return new SourcemapStream(optResolver);
}

module.exports = sourcemapStream;