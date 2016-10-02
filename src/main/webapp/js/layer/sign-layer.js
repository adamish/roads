define([ 'jquery', 'underscore', 'backbone', 'gmaps', 'markerclusterer', 'model/signs', 'model/sign-settings', 'spatial-index', 'layer/sign-builder',
    'layer/html-layer' ], function() {

  "use strict";

  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var SpatialIndex = require('spatial-index');
  var HtmlLayer = require('layer/html-layer');
  var SignBuilder = require('layer/sign-builder');
  var MarkerClusterer = require('markerclusterer');

  var google = {
    maps : require('gmaps')
  };
  var minZoomFullDetail = 14;
  /** would just set height and use CSS but firefox does not support it */
  var aspectRatio = {
    sy01 : 87 / 80,
    sy02 : 87 / 80,
    sy03 : 87 / 80,
    sy04 : 87 / 80,
    sy05 : 87 / 80,
    sy06 : 87 / 80,
    sy07 : 87 / 80,
    sy08 : 384 / 256,
    sy09 : 384 / 256,
    sy10 : 384 / 256,
    sy11 : 384 / 256,
    sy12 : 384 / 256,
    sy13 : 384 / 256,
    sy14 : 384 / 256,
    sy15 : 384 / 256
  };

  var markerNormal = {
    path : google.maps.SymbolPath.CIRCLE,
    scale : 7,
    fillColor : '#000000',
    fillOpacity : 1,
    strokeColor : 'orange',
    strokeWeight : 2
  };
  var markerSelected = {
    path : google.maps.SymbolPath.CIRCLE,
    scale : 7,
    fillColor : '#000000',
    fillOpacity : 1,
    strokeColor : '#00FF00',
    strokeWeight : 2
  };

  var SignLayer = Backbone.View.extend({
    initialize : function(options) {
      this.signs = options.signs;
      this.signSettings = options.signSettings;
      _.bindAll(this, 'render', 'onSettingsLoad', 'onIdle', 'onZoomChanged', 'showFeature', 'setSelected');

      this.signSettings.on('sync', this.onSettingsLoad);

      this.map = options.map;
      this.htmlLayer = HtmlLayer.create(this.map);
      this.listenTo(this.htmlLayer, 'click', this.onClick);
      google.maps.event.addListener(this.map, 'idle', this.onIdle);
      google.maps.event.addListener(this.map, 'zoom_changed', this.onZoomChanged);

      this.markerCluster = new MarkerClusterer(this.map);

      this.selectedSignId = null;
    },
    onClick : function(e) {
      var targetId = $(e.target).closest("div[data-id]").attr('data-id');
      if (targetId !== undefined) {
        targetId = parseInt(targetId, 10);
        this.setSelected(targetId);
        e.stopPropagation();
      }
    },
    setSelected : function(selectedSignId) {
      var polyline;
      var dom;
      var state;
      if (this.selectedSignId) {
        state = this.states[this.groupIdMap[this.selectedSignId].id];
        polyline = state.polyline;
        if (polyline) {
          polyline.setOptions({
            strokeWeight : 1,
            strokeColor : '#EE9900'
          });
        }
        if (state.features) {
          dom = state.features[this.selectedSignId];
          dom.style.borderColor = "#505050";
        }
        if (state.marker) {
          state.marker.setIcon(markerNormal);
        }
      }
      this.selectedSignId = selectedSignId;
      if (this.selectedSignId) {
        state = this.states[this.groupIdMap[this.selectedSignId].id];
        polyline = state.polyline;
        if (polyline) {
          polyline.setOptions({
            strokeWeight : 3,
            strokeColor : '#00FF00'
          });
        }
        if (state.features) {
          dom = state.features[this.selectedSignId];
          dom.style.borderColor = "#00FF00";
        }
        if (state.marker) {
          state.marker.setIcon(markerSelected);
        }
      }
      this.trigger('select', this.selectedSignId);
    },
    resetModel: function() {
      var state, states = this.states;
      var i, n; 
      var groupIndex, groupLength, group;
      for (i = 0, n = states.length; i < n; i++) {
        state = states[i];
        for (groupIndex = 0, groupLength = state.data.group.length; groupIndex < groupLength; groupIndex++) {
          group = state.data.group[groupIndex];
          group.value = undefined;
          group.time = undefined;
        }
      }
    },
    onSettingsLoad : function() {
      this.buildLookup();
      this.resetModel();
      var settings = this.signSettings.attributes.content;
      var settingIndex, eachSetting, settingsLength;
      var signsToUpdate = {};
      var group;
      var signIndex = null;
      var states;
      // copy values from settings model into signs model for quick access
      for (settingIndex = 0, settingsLength = settings.length; settingIndex < settingsLength; settingIndex++) {
        eachSetting = settings[settingIndex];
        group = this.groupIdMap[eachSetting.id];
        signsToUpdate[group.id] = true;
        group.data.value = eachSetting.value;
        group.data.time = eachSetting.time;
      }
      states = this.states;
      for (signIndex in signsToUpdate) {
        states[signIndex].dirty = true;
        states[signIndex].hasValue = true;
      }
      this.render();
    },
    onIdle : function() {
      if (!this.signs.isLoaded()) {
        return;
      }
      this.render();
      this.htmlLayer.show();
    },
    onZoomChanged : function() {
      if (!this.signs.isLoaded()) {
        return;
      }
      this.htmlLayer.hide();
      this.updateVisible();
      this.renderDestroy();
    },
    updateVisible : function() {
      this.buildLookup();

      var state, states = this.states;
      var i, n;
      var visibles;

      for (i = 0, n = states.length; i < n; i++) {
        states[i].visibleDetail = false;
        states[i].visibleMarker = false;
      }
      visibles = this.spatialIndex.getGMap(this.map);

      if (this.map.getZoom() >= minZoomFullDetail) {
        for (i = 0, n = visibles.length; i < n; i++) {
          states[visibles[i]].visibleDetail = true;
        }
      } else {
        for (i = 0, n = visibles.length; i < n; i++) {
          state = states[visibles[i]];
          state.visibleMarker = state.hasValue;
        }
      }
    },
    onMarkerSelected : function(gantryId) {},
    renderOverview : function() {
      var view = this;
      var onClick = function() {
        view.setSelected(view.signs.getGantryById(this.gantryId).group[0].id);
      };

      var i, n;
      var state, marker, path;
      var states = this.states;
      var markers = [];

      for (i = 0, n = states.length; i < n; i++) {

        state = states[i];
        marker = state.marker;

        if (!state.visibleMarker) {
          continue;
        }

        // create line if one does not exist
        if (marker === null) {
          // lazy fetch the path from encoded polyline string
          path = state.path || (state.path = google.maps.geometry.encoding.decodePath(state.data.g));

          marker = new google.maps.Marker({
            position : path[0],
            icon : markerNormal,
            gantryId : i,
            map : this.map
          });
          state.marker = marker;
          google.maps.event.addListener(state.marker, 'click', onClick);

        }
        markers.push(marker);
      }

      this.markerCluster.clearMarkers();
      this.markerCluster.addMarkers(markers);
    },
    render : function() {
      this.updateVisible();
      this.renderDestroy();
      this.renderAdd();
    },
    /*
     * destroy an unused features
     */
    renderDestroy : function() {
      if (!this.htmlLayer.isReady()) {
        return;
      }
      var i, n;
      var states = this.states;
      var state;
      var marker, polyline, box;
      for (i = 0, n = states.length; i < n; i++) {

        state = states[i];
        polyline = state.polyline;
        box = state.box;
        marker = state.marker;

        if (!state.visibleDetail) {
          if (polyline) {
            // destroy line
            polyline.setMap(null);
            state.polyline = null;

            // remove the old box
            this.htmlLayer.remove(box);
            state.box = null;
            state.features = null;
          }
        }

        if (!state.visibleMarker) {
          if (marker) {
            marker.setMap(null);
            state.marker = null;
            google.maps.event.clearListeners(marker, 'click');
          }
        }

      }
    },
    renderAdd : function() {
      if (!this.htmlLayer.isReady()) {
        return;
      }
      var animations = this.map.getZoom() >= 15;
      var scale = Math.pow(2, this.map.getZoom() - 15);

      var i, n;
      var states = this.states;
      var state;
      var path = null;
      var polyline, box;
      var zoom = this.map.getZoom();

      for (i = 0, n = states.length; i < n; i++) {

        state = states[i];
        polyline = state.polyline;
        box = state.box;

        if (!state.visibleDetail) {
          continue;
        }

        // create line if one does not exist
        if (polyline === null) {
          // lazy fetch the path from encoded polyline string
          path = state.path || (state.path = google.maps.geometry.encoding.decodePath(state.data.g));

          polyline = new google.maps.Polyline({
            path : path,
            strokeColor : '#EE9900',
            strokeWeight : 1,
            map : this.map
          });
          state.polyline = polyline;

          // create box if there isn't already one
          box = {
            pos : path[1],
            id : i,
            div : document.createElement('div'),
            zoom : zoom
          };
          state.box = box;
          SignBuilder.build(state, scale, animations);
          this.htmlLayer.add(box);
        } else {
          // consider an update
          if (box.zoom !== zoom || state.dirty) {
            SignBuilder.build(state, scale, animations);
            box.zoom = zoom;
            state.dirty = false;
          }
        }

      }
      this.renderOverview();
      this.htmlLayer.draw();
      this.setSelected(this.selectedSignId);
    },
    buildLookup : function() {
      var states = [];
      var contentIndex, eachContent, contentLength;
      var content = this.signs.attributes.content;
      if (this.states) {
        return;
      }

      this.spatialIndex = new SpatialIndex(this.signs.attributes.index);
      for (contentIndex = 0, contentLength = content.length; contentIndex < contentLength; contentIndex++) {
        eachContent = content[contentIndex];
        states.push({
          visible : false,
          polyline : null,
          marker : null,
          box : null,
          data : eachContent
        });
      }
      this.groupIdMap = this.signs.getGroupIdMap();
      this.states = states;
    },
    showFeature : function(signId) {
      var mid = this.signs.getLocation(signId);
      this.map.panTo(mid);
      this.map.setZoom(minZoomFullDetail + 1);
      this.setSelected(signId);
    }
  });

  return SignLayer;

});