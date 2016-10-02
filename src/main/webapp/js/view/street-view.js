define([ 'jquery', 'underscore', 'backbone', "text!templates/street-view.html" ], function() {

  "use strict";
  var _ = require('underscore');
  var Backbone = require('backbone');
  var template = require("text!templates/street-view.html");

  var StreetView = Backbone.View.extend({
    events : {
      "click button.close" : 'onClose'
    },
    tagName : 'div',
    id : 'pano',
    initialize : function(options) {
      _.bindAll(this, 'showSign', 'onClose', 'onStreetView');
      this.map = options.map;
      this.signs = options.signs;
      this.template = _.template(template);

      this.streetViewService = new google.maps.StreetViewService();

    },
    mapMini : function() {
      $("#map").addClass('map-mini').removeClass('map-full');
      google.maps.event.trigger(this.map, 'resize');
    },
    mapFull : function() {
      $("#map").removeClass('map-mini').addClass('map-full');
      google.maps.event.trigger(this.map, 'resize');
    },
    getRoadDirection : function(signId) {
      var gantry = this.signs.getGantry(signId);
      return gantry.d || 0;
    },
    showSign : function(signId) {
      var gantryPos = this.signs.getBaseLocation(signId);
      var roadDirection = this.getRoadDirection(signId);
      var oppositeDirection;
      oppositeDirection = roadDirection - 180;
      if (oppositeDirection < 0) {
        oppositeDirection = oppositeDirection + 360;
      }

      var beforeSign = google.maps.geometry.spherical.computeOffset(gantryPos, 40, oppositeDirection);

      this.streetViewService.getPanoramaByLocation(beforeSign, 20, this.onStreetView);
      this.signId = signId;
      this.requestedPosition = beforeSign;
      this.targetPosition = gantryPos;
    },
    onStreetView : function(data, status) {
      var signId = this.signId;
      var roadDirection = this.getRoadDirection(signId);

      var sign = this.signs.getData(signId);
      var target = this.$('.target')[0];
      var panoramaOptions;
      var actualDistance;
      if (status == google.maps.StreetViewStatus.OK) {

        actualDistance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(this.targetPosition, data.location.latLng));
        console.log("actual distance " + actualDistance);
        
        this.$('.title').text("View of " + sign.gid);
        this.$el.show();
        this.mapMini();

        panoramaOptions = {
          pov : {
            heading : roadDirection,
            pitch : 10
          },
          pano : data.location.pano,
          enableCloseButton : false,
          addressControl : false
        };

        if (this.panorama === undefined) {
          this.panorama = new google.maps.StreetViewPanorama(target, panoramaOptions);
        } else {
          this.panorama.setOptions(panoramaOptions);
        }
        this.panorama.setVisible(true);

        this.map.setCenter(this.signs.getLocation(signId));
        this.map.setStreetView(this.panorama);

      }
    },
    onClose : function() {
      this.$el.hide();
      this.panorama.setVisible(false);
      this.mapFull();
    },
    render : function() {
      this.$el.html(this.template());
      return this;
    }
  });

  return StreetView;
});