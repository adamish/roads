define([ 'jquery', 'underscore', 'backbone', 'gmaps', 'base', 'spatial-index' ], function() {

  "use strict";

  var _ = require('underscore');
  var Backbone = require('backbone');

  var SpatialIndex = require('spatial-index');
  var google = {
    maps : require('gmaps')
  };

  var config = {};

  config.roadNormal = {
    strokeColor : '#505050',
  };

  config.roadHover = {
    strokeColor : '#00FF00',
  };

  var RoadLayer = Backbone.View.extend({
    initialize : function(options) {
      _.bindAll(this, 'zoomChanged', 'render', 'loadTraffic', 'showFeature', 'setSelected');
      this.map = options.map;
      this.roads = options.roads;
      this.traffic = options.traffic;
      this.roads.on('sync', this.zoomChanged);
      this.traffic.on('sync', this.loadTraffic);
      google.maps.event.addListener(this.map, 'idle', this.zoomChanged);

      var view = this;
      this.onClick = function() {
        view.setSelected(this.data.id);
      };
      this.selectedRoadId = null;
    },
    setSelected : function(selectedRoadId) {
      var polyline;
      var color;
      if (this.selectedRoadId) {
      color = this.states[this.selectedRoadId].color;
      polyline = this.states[this.selectedRoadId].polyline;
      if (polyline) {
      polyline.setOptions({
        strokeColor : color || config.roadNormal.strokeColor
      });
      }
      }
      this.selectedRoadId = selectedRoadId;
      if (this.selectedRoadId) {
      polyline = this.states[this.selectedRoadId].polyline;
      if (polyline) {
      polyline.setOptions({
        strokeColor : config.roadHover.strokeColor
      });
      }
      }
      this.trigger('select', this.selectedRoadId);

    },
    zoomChanged : function() {
      if (!this.roads.isLoaded()) {
      return;
      }
      this.buildLookup();
      this.updateVisible();
      this.render();
    },
    updateVisible : function() {
      var visibles = this.spatialIndex.getGMap(this.map);
      var roads = this.roads.attributes.content;
      var road;
      var stateIndex, statesLength;
      var visibleIndex, visiblesLength;
      var includeNonCarriageWays = this.map.getZoom() >= 11;
      var states = this.states;
      var minLength;
      var roadId;
      if (this.map.getZoom() >= 11) {
      // show everything
      minLength = 0;
      } else {
      minLength = 100 * Math.pow(2, 12 - this.map.getZoom());
      }

      for (stateIndex = 0, statesLength = states.length; stateIndex < statesLength; stateIndex++) {
      states[stateIndex].visible = false;
      }

      for (visibleIndex = 0, visiblesLength = visibles.length; visibleIndex < visiblesLength; visibleIndex++) {
      roadId = visibles[visibleIndex];
      road = roads[roadId];
      states[roadId].visible = (road[1] === 0 || includeNonCarriageWays) && road[3] >= minLength;
      }
    },
    render : function() {

      var states = this.states;

      var zoom = this.map.getZoom();

      var state, length, i;

      var path;
      var polyline;
      var map = this.map;

      var onClick = this.onClick;

      var startTime = new Date().getTime();
      var maxRenderTime = 200;
      var strokeWeight = 3;
      if (zoom >= 17) {
      strokeWeight = 5;
      } else if (zoom >= 15) {
      strokeWeight = 4;
      } else if (zoom >= 12) {
      strokeWeight = 3;
      } else if (zoom >= 8) {
      strokeWeight = 2;
      } else {
      strokeWeight = 1;
      }
      for (i = 0, length = states.length; i < length; i++) {

      state = states[i];
      polyline = state.polyline;

      if (!state.visible) {
      if (polyline && polyline.data.visible) {
      polyline.setMap(null);
      polyline.data.visible = false;
      polyline.setVisible(false);
      google.maps.event.clearListeners(polyline, "click");
      state.path = undefined;
      state.path2 = undefined;
      state.path3 = undefined;
      state.polyline = null;
      }
      continue;
      }

      if (state.path) {
      path = state.path;
      } else {
      state.path = google.maps.geometry.encoding.decodePath(state.data[2]);
      path = state.path;
      }
      if (zoom <= 9) {
      // just start and end points at higher zoom levels
      path = state.path3 || (state.path3 = [ path[0], path[Math.floor(path.length / 2)], path[path.length - 1] ]);
      } else if (zoom <= 7) {
      // just start and end points at higher zoom levels
      path = state.path2 || (state.path2 = [ path[0], path[path.length - 1] ]);
      }

      if (path === undefined) {
      continue;
      }

      // lazy create
      if (polyline === null) {
      polyline = new google.maps.Polyline({
        path : path,
        data : {
          id : i,
          length : path.length,
          visible : true
        },
        strokeColor : state.color || config.roadNormal.strokeColor,
        strokeWeight : strokeWeight,
        map : map
      });
      state.polyline = polyline;
      google.maps.event.addListener(polyline, "click", onClick);
      } else {

      // update path if different
      if (polyline.data.length !== path.length) {
      polyline.data.length = path.length;
      polyline.setPath(path);
      }
      if (polyline.data.strokeWeight !== strokeWeight) {
      polyline.data.strokeWeight = strokeWeight;
      polyline.setOptions({
        strokeWeight : strokeWeight
      });
      }

      if (!polyline.data.visible) {
      // show if previously not visible
      polyline.setVisible(true);
      polyline.data.visible = true;
      // polyline.setMap(map);
      google.maps.event.addListener(polyline, "click", onClick);
      }
      }
      if (i % 10 === 0 && (new Date().getTime() - startTime) > maxRenderTime) {
      window.setTimeout(this.render, 50);
      break;
      }
      }
      this.setSelected(this.selectedRoadId);
    },
    buildColorLookup : function() {
      var returnValue = {}, i;
      var factor = 255.0 / 120.0;
      var r;
      var g = 0;
      var b;
      var color;
      for (i = 0; i <= 70; i++) {
      r = Math.round(i * factor);
      b = r;
      color = '#' + (r < 16 ? '0' : '') + r.toString(16) + (g < 16 ? '0' : '') + g.toString(16) + (b < 16 ? '0' : '') + b.toString(16);
      returnValue[i] = color;
      }
      return returnValue;
    },
    loadTraffic : function() {
      this.buildLookup();
      var traffic = this.traffic.attributes.content;
      var eachTraffic, trafficIndex, trafficLength;
      var speed;
      var states = this.states;
      var state;
      var colorLookup = this.buildColorLookup();
      for (trafficIndex = 0, trafficLength = traffic.length; trafficIndex < trafficLength; trafficIndex++) {
      eachTraffic = traffic[trafficIndex];
      speed = Math.round(Math.min(70, eachTraffic.speed));
      state = states[eachTraffic.id];
      state.color = colorLookup[speed];

      if (state.visible && state.polyline) {
      state.polyline.setOptions({
        strokeColor : state.color
      });
      }
      }
    },
    buildLookup : function() {
      var states = [];
      var content = this.roads.attributes.content;
      var contentIndex, contentLength;

      if (this.states) {
      return this;
      }
      this.spatialIndex = new SpatialIndex(this.roads.attributes.index);
      for (contentIndex = 0, contentLength = this.roads.attributes.content.length; contentIndex < contentLength; contentIndex++) {

      states.push({
        visible : false,
        polyline : null,
        data : content[contentIndex]
      });
      }
      this.states = states;
    },
    showFeature : function(roadId) {
      var mid = this.roads.getLocation(roadId);
      this.map.panTo(mid);
      this.map.setZoom(12);
      this.setSelected(roadId);
      var infoWindow = new google.maps.InfoWindow({
        content : '<div class="welcome-help">' + this.roads.getRoadName(roadId) + '</div>',
        position : mid,
        disableAutoPan : true,
        maxWidth : 200
      });
      infoWindow.open(this.map);

      setTimeout(function() {
        infoWindow.close();
      }, 2000);

    }
  });

  return RoadLayer;
});