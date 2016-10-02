define([ 'jquery', 'underscore', 'backbone', 'gmaps', 'base' ], function() {

  "use strict";

  // var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');

  var google = {
    maps : require('gmaps')
  };

  var EventLayer = Backbone.View.extend({
    initialize : function(options) {
      _.bindAll(this, 'render', 'showFeature', 'setSelected');
      this.map = options.map;
      this.model = options.model;
      this.model.on('sync', this.render);
      this.markers = [];
    },
    render : function() {
      var view = this;
      this.markers.forEach(function(marker) {
        marker.setMap(null);
        google.maps.event.clearListeners(marker, 'click');
      });
      this.model.attributes.content.forEach(function(model, index) {
        var marker = new google.maps.Marker({
          position : new google.maps.LatLng(model.latitude, model.longitude),
          map : this.map,
          title : 'Unplanned Event',
          data : model
        });
        this.markers.push(marker);

        google.maps.event.addListener(marker, 'click', function() {
          view.setSelected(index);
        });

      }, this);

      return this;
    },
    showFeature : function(eventId) {
      var mid = this.model.getLocation(eventId);
      this.map.panTo(mid);
      this.map.setZoom(12);
    },
    setSelected : function(eventId) {
      this.trigger('select', eventId);

    }
  });

  return EventLayer;
});