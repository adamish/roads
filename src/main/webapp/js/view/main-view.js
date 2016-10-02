define([ 'jquery', 'persistence', 'model/traffic', 'model/signs', 'model/sign-settings', 'model/roads', 'model/unplanned-events', 'layer/event-layer',
    'layer/road-layer', 'layer/sign-layer', 'view/event-view', 'view/road-view', 'view/sign-view', 'view/street-view', 'base', 'gmaps', 'view/search-view',
    'view/progress-view', 'view/gps-view', "text!templates/main-view.html", "router" ], function() {

  "use strict";
  var Backbone = require('backbone');
  var template = require("text!templates/main-view.html");
  var Persistence = require('persistence');
  var Traffic = require('model/traffic');
  var Roads = require('model/roads');
  var Signs = require('model/signs');
  var UnplannedEvents = require('model/unplanned-events');
  var SignSettings = require('model/sign-settings');

  var RoadLayer = require('layer/road-layer');
  var SignLayer = require('layer/sign-layer');
  var EventLayer = require('layer/event-layer');

  var EventView = require('view/event-view');
  var RoadView = require('view/road-view');
  var SignView = require('view/sign-view');
  var StreetView = require('view/street-view');
  var GpsView = require('view/gps-view');
  var SearchView = require('view/search-view');
  var ProgressView = require('view/progress-view');

  var Router = require('router');

  var google = {
    maps : require('gmaps')
  };

  var MainView = Backbone.View.extend({
    initialize : function(options) {
    },
    createMap : function() {
      var persistence = new Persistence();

      var mapOptions = {
        center : new google.maps.LatLng(persistence.getCenter()[0], persistence.getCenter()[1]),
        zoom : persistence.getZoom(),
        minZoom : 7,
      };
      var map = new google.maps.Map(document.getElementById("map"), mapOptions);
      persistence.listenMap(map);

      var infoWindow = new google.maps.InfoWindow({
        content : '<div class="welcome-help">Click on roads, events or signs for more information...</div>',
        position : map.getCenter(),
        disableAutoPan : true,
        maxWidth : 200
      });
      infoWindow.open(map);

      setTimeout(function() {
        infoWindow.close();
      }, 5000);
      return map;
    },
    render : function() {
      $('body').append(template);
      var traffic = new Traffic();
      var roads = new Roads();
      var signs = new Signs();
      var signSettings = new SignSettings();
      var unplannedEvents = new UnplannedEvents();

      var searchView = new SearchView({
        models : [ roads, signs, unplannedEvents ]
      });
      var progressView = new ProgressView({
        models : [ roads, signs, traffic, signSettings, unplannedEvents ]
      });

      var map = this.createMap();
      var roadLayer = new RoadLayer({
        map : map,
        roads : roads,
        traffic : traffic
      });

      var signLayer = new SignLayer({
        map : map,
        signs : signs,
        signSettings : signSettings
      });
      var eventLayer = new EventLayer({
        map : map,
        model : unplannedEvents,
      });
      var gpsView = new GpsView({
        map : map
      });
      gpsView.request();
      searchView.on('select_road', roadLayer.showFeature);
      searchView.on('select_vms', signLayer.showFeature);
      searchView.on('select_signal', signLayer.showFeature);
      searchView.on('select_event', eventLayer.showFeature);

      roads.on('sync', function() {
        var router = new Router();
        router.on('route:showRoad', function(roadId) {
          _.defer(function() {
            roadLayer.showFeature(parseInt(roadId, 10));
          });
        });
        Backbone.history.start();

      });
      signs.fetch({
        success : function() {
          signSettings.fetch();
        }
      });
      unplannedEvents.fetch();

      var roadView = new RoadView({
        roads : roads,
        traffic : traffic
      });
      var eventView = new EventView({
        unplannedEvents : unplannedEvents
      });
      var signView = new SignView({
        roads : roads,
        signs : signs
      });
      var streetView = new StreetView({
        map : map,
        signs : signs
      });
      google.maps.event.addListener(map, 'click', function() {
        signLayer.setSelected(null);
        roadLayer.setSelected(null);
        eventLayer.setSelected(null);

      });

      roadLayer.on('select', function(roadId) {
        if (_.isNumber(roadId)) {
        eventLayer.setSelected(null);
        signLayer.setSelected(null);
        }
        roadView.show(roadId);
      });
      signLayer.on('select', function(signId) {
        if (_.isNumber(signId)) {
        eventLayer.setSelected(null);
        roadLayer.setSelected(null);
        }
        signView.show(signId);
      });
      eventLayer.on('select', function(eventId) {
        if (_.isNumber(eventId)) {
        roadLayer.setSelected(null);
        signLayer.setSelected(null);
        }
        eventView.show(eventId);
      });

      signView.on('street-view', function(signId) {
        streetView.showSign(signId);
      });

      $(".searchPlaceholder").replaceWith(searchView.render().$el);
      $('body').append(roadView.render().$el);
      $('body').append(signView.render().$el);
      $('body').append(eventView.render().$el);
      $('body').append(progressView.render().$el);
      $('body').append(streetView.render().$el);

      $('button.about').click(function() {
        $("#about").show();
      });
      $('button.refresh').click(function() {
        traffic.fetch();
        unplannedEvents.fetch();
        signSettings.fetch();
      });
      $("#about button.close").click(function() {
        $("#about").hide();
      });

      $('#loading').hide();

      roads.fetch({
        success : function() {
          traffic.fetch();
        }
      });
    }
  });

  return MainView;
});