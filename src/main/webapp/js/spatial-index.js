define([], function() {

  "use strict";
  
  var SpatialIndex = function(container) {
    this.index = container.index;
    this.x0 = container.parameters.x0;
    this.y0 = container.parameters.y0;
    this.x1 = container.parameters.x1;
    this.y1 = container.parameters.y1;
    this.gridWidth = container.parameters.gw;
    this.gridHeight = container.parameters.gh;
    this.cellWidth = (this.x1 - this.x0) / this.gridWidth;
    this.cellHeight = (this.y1 - this.y0) / this.gridHeight;
  };

  SpatialIndex.prototype.getGMap = function(map) {
    var bounds = map.getBounds();
    if (bounds === undefined) {
      return [];
    }
    var x0 = bounds.getSouthWest().lng();
    var x1 = bounds.getNorthEast().lng();
    var y0 = bounds.getSouthWest().lat();
    var y1 = bounds.getNorthEast().lat();

    var w = x1 - x0;
    var h = y1 - y0;
    x0 = x0 - w * 0.1;
    x1 = x1 + w * 0.1;

    y0 = y0 - h * 0.1;
    y1 = y1 + h * 0.1;
    return this.get(x0, y0, x1, y1);
  };
  SpatialIndex.prototype.get = function(x0, y0, x1, y1) {
    var a0 = this.getGridIndexX(x0);
    var b0 = this.getGridIndexY(y0);
    var a1 = this.getGridIndexX(x1);
    var b1 = this.getGridIndexY(y1);
    if (a0 < 0 && a1 < 0 || a0 >= this.gridWidth && a1 >= this.gridWidth) {
      return [];
    }
    if (b0 < 0 && b1 < 0 || b0 >= this.gridHeight && b1 >= this.gridHeight) {
      return [];
    }
    a0 = this.minMax(a0, 0, this.gridWidth - 1);
    b0 = this.minMax(b0, 0, this.gridHeight - 1);
    a1 = this.minMax(a1, 0, this.gridWidth - 1);
    b1 = this.minMax(b1, 0, this.gridHeight - 1);

    var i, j;
    var cell = 0;
    var ids;
    var all = {};
    var c;
    for (i = a0; i <= a1; i++) {
      for (j = b0; j <= b1; j++) {
        cell = i + j * this.gridWidth;
        ids = this.index[cell];
        for (c = ids.length - 1; c >= 0; c--) {
          all[ids[c]] = true;
        }
      }
    }
    return Object.keys(all);
  };

  SpatialIndex.prototype.minMax = function(value, min, max) {
    return Math.max(Math.min(value, max), min);
  };

  SpatialIndex.prototype.getGridIndexX = function(x) {
    return Math.floor((x - this.x0) / this.cellWidth);
  };
  SpatialIndex.prototype.getGridIndexY = function(y) {
    return Math.floor((y - this.y0) / this.cellHeight);
  };

  return SpatialIndex;
});
