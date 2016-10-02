define([ 'gmaps', 'backbone' ], function() {

  "use strict";
  var Backbone = require('backbone');
  var google = {
    maps : require('gmaps')
  };

  var HtmlLayer = function(map) {

    this.setMap(map);
    this.boxes = {};

  };

  HtmlLayer.prototype = new google.maps.OverlayView();

  HtmlLayer.prototype.isReady = function() {
    return this.div !== undefined;
  };

  HtmlLayer.prototype.add = function(box) {
    box.div.style.position = 'absolute';
    this.div.appendChild(box.div);

    this.boxes[box.id] = box;
  };
  HtmlLayer.prototype.remove = function(box) {
    this.div.removeChild(box.div);
    box.div = null;
    delete this.boxes[box.id];
  };

  HtmlLayer.prototype.onAdd = function() {
    this.div = document.createElement('div');
    this.div.style.borderStyle = 'none';
    this.div.style.borderWidth = '0px';
    this.div.style.position = 'absolute';
    this.div.style['z-index'] = 200;

    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.div);

    var that = this;
    this.div.addEventListener('click', function(e) {
      // e.stopPropagation();
      that.trigger('click', e);
    }, false);
    this.div.addEventListener('mouseover', function(e) {
      // e.stopPropagation();
      that.trigger('mouseover', e);
    }, false);
    this.div.addEventListener('mouseout', function(e) {
      // e.stopPropagation();
      that.trigger('mouseout', e);
    }, false);

  };

  HtmlLayer.prototype.metrics = function() {
    var overlayProjection = this.getProjection();
    var i = 0, box;
    var southWest, northWest, southEast;
    for (i in this.boxes) {
      box = this.boxes[i];

      southWest = overlayProjection.fromDivPixelToLatLng(new google.maps.Point(c.x, c.y));
      southEast = overlayProjection.fromDivPixelToLatLng(new google.maps.Point(c.x + box.width, c.y));
      northWest = overlayProjection.fromDivPixelToLatLng(new google.maps.Point(c.x, c.y + box.height));

      box.div.setAttribute("data-width-m", Math.round(google.maps.geometry.spherical.computeDistanceBetween(southWest, southEast)));
      box.div.setAttribute("data-height-m", Math.round(google.maps.geometry.spherical.computeDistanceBetween(southWest, northWest)));

    }
  };

  HtmlLayer.prototype.draw = function() {
    var overlayProjection = this.getProjection();
    var i = 0, box;
    for (i in this.boxes) {
      box = this.boxes[i];
      var c = overlayProjection.fromLatLngToDivPixel(box.pos);
      box.div.style.left = Math.round(c.x - box.width / 2) + 'px';
      box.div.style.top = Math.round(c.y - box.height / 2) + 'px';
    }
  };

  HtmlLayer.prototype.onRemove = function() {
    this.div.parentNode.removeChild(div);
    div_ = null;
  };

  HtmlLayer.prototype.hide = function() {
    if (this.div) {
      this.div.style.visibility = 'hidden';
    }
  };

  HtmlLayer.prototype.show = function() {
    if (this.div) {
      this.div.style.visibility = 'visible';
    }
  };

  HtmlLayer.prototype.toggle = function() {
    if (this.div) {
      if (this.div.style.visibility == 'hidden') {
        this.show();
      } else {
        this.hide();
      }
    }
  };

  // Detach the map from the DOM via toggleDOM().
  // Note that if we later reattach the map, it will be visible again,
  // because the containing <div> is recreated in the overlay's onAdd() method.
  HtmlLayer.prototype.toggleDOM = function() {
    if (this.getMap()) {
      // Note: setMap(null) calls OverlayView.onRemove()
      this.setMap(null);
    } else {
      this.setMap(this.map_);
    }
  };

  _.extend(HtmlLayer.prototype, Backbone.Events);

  window.HtmlLayer = HtmlLayer;

  return {
    create : function() {
      return new HtmlLayer(arguments[0]);
    }
  };

});