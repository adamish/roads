define([], function() {

  "use strict";

  var Persistence = function() {};

  Persistence.prototype.isSupported = function() {
    return typeof (Storage) !== "undefined" && window.localStorage;
  };
  Persistence.prototype.getCenter = function() {

    var value = [ 53.4, -2.18 ];
    var localValue;
    if (this.isSupported()) {
      localValue = window.localStorage.getItem('mapCenter');
      if (localValue) {
        try {
          value = JSON.parse(localValue);
        } catch (e) {
          console.log("Could not parse " + localValue);
        }
      }
    }
    return value;
  };
  Persistence.prototype.getZoom = function() {
    var value = 14;
    var localValue;
    if (this.isSupported()) {
      localValue = window.localStorage.getItem('mapZoom');
      if (localValue) {
        value = parseInt(localValue, 10);
      }
    }
    return value;
  };

  Persistence.prototype.setCenter = function(value) {
    if (this.isSupported()) {
      window.localStorage.setItem('mapCenter', JSON.stringify(value));
    }
  };
  Persistence.prototype.setZoom = function(value) {
    if (this.isSupported()) {
      window.localStorage.setItem('mapZoom', value);
    }
  };

  Persistence.prototype.listenMap = function(map) {
    var persistence = this;
    google.maps.event.addListener(map, 'bounds_changed', function() {
      persistence.setCenter([ map.getCenter().lat(), map.getCenter().lng() ]);
      persistence.setZoom([ map.getZoom() ]);
    });
  };

  return Persistence;
});