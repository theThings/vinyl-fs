'use strict';

var Transform = require('stream').Transform;
var util = require('util');
var fo = require('../file-operations');

function ResolveSymlinks(optResolver) {
  Transform.call(this, { objectMode: true });
  this.optResolver = optResolver;
}
util.inherits(ResolveSymlinks, Transform);

ResolveSymlinks.prototype._transform = function(file, enc, callback) {
  var self = this;

  fo.reflectLinkStat(file.path, file, onReflect);

  function onReflect(statErr) {
    if (statErr) {
      return callback(statErr);
    }

    if (!file.stat.isSymbolicLink()) {
      return callback(null, file);
    }

    var resolveSymlinks = self.optResolver.resolve('resolveSymlinks', file);

    if (!resolveSymlinks) {
      return callback(null, file);
    }

    fo.findSymlinkHardpath(file.path, onSymlinkHardpath);
  }

  function onSymlinkHardpath(readlinkErr, path) {
    if (readlinkErr) {
      return callback(readlinkErr);
    }
    fo.reflectStat(path, file, onReflect);
  }
};

function resolveSymlinks(optResolver) {
  return new ResolveSymlinks(optResolver);
}

module.exports = resolveSymlinks;