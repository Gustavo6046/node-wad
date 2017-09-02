// Generated by CoffeeScript 1.12.6
var WHeader,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

WHeader = (function() {
  function WHeader(wad) {
    this.wad = wad;
    this.write = bind(this.write, this);
  }

  WHeader.prototype.write = function(bf) {
    var c, i, len, ref;
    ref = (this.wad.bPWAD ? "PWAD" : "IWAD");
    for (i = 0, len = ref.length; i < len; i++) {
      c = ref[i];
      bf.writeUInt8((new Buffer(c, 'ascii')).readUInt8());
    }
    return bf.writeUInt32LE(this.wad.lumps.length).writeUInt32LE((this.wad.lumps.map(function(l) {
      return l.getSize();
    }).reduce(function(a, b) {
      return a + b;
    })) + 12);
  };

  return WHeader;

})();

module.exports = WHeader;
