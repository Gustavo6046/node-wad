// Generated by CoffeeScript 1.12.6

/*
Doom map editing.

Does not support nodebuilding
yet.
 */
var Bitfield, BufferWriter, MapEdit, WLinedef, WSector, WSidedef, WThing, WVertex, defaultFlags, isClockwise, writeChars,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

BufferWriter = require("buffer-utils").BufferWriter;

Bitfield = require("bitfield");

isClockwise = function(positions) {
  var edges, i, i1, i2, ref;
  edges = [];
  for (i1 = i = 0, ref = positions.length - 1; 0 <= ref ? i <= ref : i >= ref; i1 = 0 <= ref ? ++i : --i) {
    if (i1 === positions.length - 1) {
      i2 = 0;
    } else {
      i2 = i1 + 1;
    }
    edges.push((positions[i2][0] - positions[i1][0]) * (positions[i2][1] + positions[i1][1]));
  }
  return edges.reduce(function(x, y) {
    return x + y;
  }) > 0;
};

writeChars = function(st, bw, cap, maxLen) {
  var c, data, i, len, padding, ref, results;
  if (cap == null) {
    cap = 0;
  }
  if (maxLen == null) {
    maxLen = st.toString('ascii').length;
  }
  if (cap > 0) {
    padding = "\x00".repeat(cap - st.length);
  } else {
    padding = "";
  }
  ref = st.slice(0, maxLen).toString() + padding;
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    c = ref[i];
    data = new Buffer(c, 'ascii');
    results.push(bw.writeUInt8(data.readUInt8()));
  }
  return results;
};

WSector = (function() {
  function WSector(floorHeight, ceilHeight, floorTex, ceilTex, lighting, special, tag, index) {
    this.floorHeight = floorHeight;
    this.ceilHeight = ceilHeight;
    this.floorTex = floorTex;
    this.ceilTex = ceilTex;
    this.lighting = lighting;
    this.special = special;
    this.tag = tag;
    this.index = index;
    this.write = bind(this.write, this);
    if (this.floorHeight == null) {
      this.floorHeight = 0;
    }
    if (this.ceilHeight == null) {
      this.ceilHeight = 128;
    }
    if (this.floorTex == null) {
      this.floorTex = "FLAT1";
    } else {
      this.floorTex = this.floorTex.toString('ascii');
    }
    if (this.ceilTex == null) {
      this.ceilTex = "FLAT2";
    } else {
      this.ceilTex = this.ceilTex.toString('ascii');
    }
    if (this.lighting == null) {
      this.lighting = 192;
    }
    if (this.special == null) {
      this.special = 0;
    }
    if (this.tag == null) {
      this.tag = 0;
    }
  }

  WSector.prototype.write = function(bw) {
    bw.writeInt16LE(this.floorHeight).writeInt16LE(this.ceilHeight);
    writeChars(this.floorTex, bw, 8);
    writeChars(this.ceilTex, bw, 8);
    bw.writeInt16LE(this.lighting).writeUInt16LE(this.special).writeUInt16LE(this.tag);
    return this;
  };

  return WSector;

})();

defaultFlags = new Bitfield(16);

defaultFlags.set(0);

defaultFlags.set(1);

defaultFlags.set(2);

defaultFlags.set(8);

defaultFlags.set(9);

defaultFlags.set(10);

defaultFlags = defaultFlags.buffer.readUInt16LE();

WThing = (function() {
  function WThing(xpos, ypos, angle1, type1, flags1) {
    this.xpos = xpos;
    this.ypos = ypos;
    this.angle = angle1;
    this.type = type1;
    this.flags = flags1;
    this.write = bind(this.write, this);
    if (this.flags == null) {
      this.flags = defaultFlags;
    }
    if (this.angle == null) {
      this.angle = 0;
    }
  }

  WThing.prototype.write = function(bw) {
    bw.writeInt16LE(this.xpos).writeInt16LE(this.ypos).writeUInt16LE(this.angle).writeUInt16LE(this.type).writeUInt16LE(this.flags);
    return this;
  };

  return WThing;

})();

WSidedef = (function() {
  function WSidedef(xoffs, yoffs, uptex, midtex, lowtex, frontSector, index) {
    this.xoffs = xoffs;
    this.yoffs = yoffs;
    this.uptex = uptex;
    this.midtex = midtex;
    this.lowtex = lowtex;
    this.frontSector = frontSector;
    this.index = index;
    this.write = bind(this.write, this);
    if (this.frontSector instanceof WSector) {
      this.frontSector = this.frontSector.index;
    }
    if (this.midtex == null) {
      this.midtex = "STARTAN2";
    }
    if (this.uptex == null) {
      this.uptex = "-";
    }
    if (this.lowtex == null) {
      this.lowtex = "-";
    }
    if (this.xoffs == null) {
      this.xoffs = 0;
    }
    if (this.yoffs == null) {
      this.yoffs = 0;
    }
  }

  WSidedef.prototype.write = function(bw) {
    bw.writeInt16LE(this.xoffs).writeInt16LE(this.yoffs);
    writeChars(this.uptex, bw, 8);
    writeChars(this.lowtex, bw, 8);
    writeChars(this.midtex, bw, 8);
    bw.writeUInt16LE(this.frontSector);
    return this;
  };

  return WSidedef;

})();

WLinedef = (function() {
  function WLinedef(begin, end, flags1, linetype, tag, frontSidedef, backSidedef) {
    this.begin = begin;
    this.end = end;
    this.flags = flags1;
    this.linetype = linetype;
    this.tag = tag;
    this.frontSidedef = frontSidedef;
    this.backSidedef = backSidedef;
    this.write = bind(this.write, this);
    if (this.begin instanceof WVertex) {
      this.begin = this.begin.index;
    }
    if (this.end instanceof WVertex) {
      this.end = this.end.index;
    }
    if (this.frontSidedef instanceof WSidedef) {
      this.frontSidedef = this.frontSidedef.index;
    }
    if (this.backSidedef instanceof WSidedef) {
      this.backSidedef = this.backSidedef.index;
    }
    if (this.frontSidedef == null) {
      this.frontSidedef = 0xFFFF;
    }
    if (this.backSidedef == null) {
      this.backSidedef = 0xFFFF;
    }
    if (this.flags == null) {
      this.flags = (this.backSidedef !== 0xFFFF ? 0x4 : 0x1);
    }
  }

  WLinedef.prototype.write = function(bw) {
    bw.writeUInt16LE(this.begin).writeUInt16LE(this.end).writeUInt16LE(this.flags).writeUInt16LE(this.linetype).writeUInt16LE(this.tag).writeUInt16LE(this.frontSidedef).writeUInt16LE(this.backSidedef);
    return this;
  };

  return WLinedef;

})();

WVertex = (function() {
  function WVertex(x1, y1, index) {
    this.x = x1;
    this.y = y1;
    this.index = index;
    this.write = bind(this.write, this);
  }

  WVertex.prototype.write = function(bw) {
    bw.writeUInt16LE(this.x).writeUInt16LE(this.y);
    return this;
  };

  return WVertex;

})();

MapEdit = (function() {
  function MapEdit(mapName) {
    this.mapName = mapName;
    this.buildSector = bind(this.buildSector, this);
    this.addThing = bind(this.addThing, this);
    this.addVertex = bind(this.addVertex, this);
    this.toLumps = bind(this.toLumps, this);
    this.vertexes = [];
    this.linedefs = [];
    this.sidedefs = [];
    this.things = [];
    this.sectors = [];
  }

  MapEdit.read = function(wad, pos) {
    var m;
    m = new MapEdit(wad.lumps[pos].name);
    return m;
  };

  MapEdit.prototype.toLumps = function(wad) {
    var data, vb;
    wad.addLump(this.mapName);
    vb = new BufferWriter();
    this.things.forEach(function(s) {
      return s.write(vb);
    });
    wad.addLump("THINGS", vb.getContents());
    this.linedefs.forEach(function(l) {
      return l.write(vb);
    });
    wad.addLump("LINEDEFS", vb.getContents());
    this.sidedefs.forEach(function(s) {
      return s.write(vb);
    });
    wad.addLump("SIDEDEFS", vb.getContents());
    this.vertexes.forEach(function(v) {
      return v.write(vb);
    });
    data = vb.getContents();
    wad.addLump("VERTEXES", data);
    this.sectors.forEach(function(v) {
      return v.write(vb);
    });
    wad.addLump("SECTORS", vb.getContents());
    return this;
  };

  MapEdit.prototype.addVertex = function(x, y) {
    this.vertexes.push(new WVertex(x, y, this.vertexes.length));
    return this;
  };

  MapEdit.prototype.addThing = function(x, y, type, angle, flags) {
    this.things.push(new WThing(x, y, angle, type, flags));
    return this;
  };

  MapEdit.prototype.buildSector = function(positions, sectorData, lineData) {
    var i, j, k, l, len, len1, len2, line, newlines, newpos, newv, p, ref, sector, side, v, v1, v2, vi;
    if (sectorData == null) {
      sectorData = {};
    }
    if (lineData == null) {
      lineData = {};
    }
    newv = [];
    newlines = [];
    newpos = this.vertexes.length;
    for (i = 0, len = positions.length; i < len; i++) {
      p = positions[i];
      if (indexOf.call(this.vertexes.map(function(v) {
        return [v.x, v.y];
      }), p) >= 0) {
        v = this.vertexes[this.vertexes.map(function(v) {
          return [v.x, v.y];
        }).indexOf(p)];
      } else {
        v = new WVertex(p[0], p[1], this.vertexes.length);
        this.vertexes.push(v);
      }
      newv.push(v);
    }
    vi = 0;
    sector = new WSector(sectorData.floorHeight, sectorData.ceilHeight, sectorData.floorTex, sectorData.ceilTex, sectorData.light, sectorData.special, sectorData.tag, this.sectors.index + 1);
    this.sectors.push(sector);
    for (j = 0, len1 = newv.length; j < len1; j++) {
      v1 = newv[j];
      v2 = newv[vi < newv.length - 1 ? vi + 1 : 0];
      side = new WSidedef(lineData.xOff, lineData.yOff, lineData.upTex, lineData.midTex, lineData.lowTex, sector, this.sidedefs.length);
      this.sidedefs.push(side);
      if (v1.index >= newpos && v2.index >= newpos) {
        line = new WLinedef(v1, v2, lineData.flags, lineData.lineType, lineData.tag, side, null);
        this.linedefs.push(line);
      } else {
        ref = this.linedefs;
        for (k = 0, len2 = ref.length; k < len2; k++) {
          l = ref[k];
          if (l.begin === v1.index && l.end === v2.index) {
            line = l;
            break;
          }
        }
        if (line.backSidedef != null) {
          line.frontSidedef = side;
        } else {
          line.backSidedef = side;
        }
      }
      vi++;
    }
    return this;
  };

  return MapEdit;

})();

module.exports = MapEdit;
