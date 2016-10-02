define([ 'jquery', 'underscore', 'backbone' ], function() {

  "use strict";
  var _ = require('underscore');
  var Backbone = require('backbone');

  var GpsView = Backbone.View.extend({
    initialize : function(options) {
      _.bindAll(this, 'request', 'onPositionUpdate');
      this.map = options.map;
    },
    request : function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.onPositionUpdate);
      }
    },
    onPositionUpdate : function(position) {
      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      if (this.marker === undefined) {
        this.marker = new google.maps.Marker({
          position : latLng,
          icon : {
            path : google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale : 5
          },
          map : this.map
        });
      } else {
        this.marker.setPosition(latLng);
      }
    }
  });

  return GpsView;
});