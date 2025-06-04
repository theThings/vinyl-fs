'use strict';

var File = require('vinyl');
var Transform = require('stream').Transform; // CAMBIO CLAVE
var util = require('util');

function wrapVinyl() {
  function wrapFile(globFile, encoding, callback) { // stream.Transform espera encoding aquí
    var file = new File(globFile);
    callback(null, file);
  }

  // Implementa transform clásico
  function WrapVinylStream(options) {
    Transform.call(this, { objectMode: true });
  }
  util.inherits(WrapVinylStream, Transform);

  WrapVinylStream.prototype._transform = function (globFile, encoding, callback) {
    var file = new File(globFile);
    this.push(file);
    callback();
  };

  return new WrapVinylStream();
}

module.exports = wrapVinyl;