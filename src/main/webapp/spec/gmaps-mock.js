define([], function() {
  google = {};
  google.maps = {
    event : {
      addListener : function() {},
      clearListeners : function() {}
    },
    geometry : {
      encoding : {
        decodePath : function() {}
      }
    },
    SymbolPath : {
      CIRCLE : 'a'
    },
    OverlayView : function() {},
    Polyline : function() {},
    LatLng : function(y, x) {
      return {
        lat : function() {
          return y;
        },
        lng : function() {
          return x;
        }
      };
    },
    Marker : function() {
      return {
        setMap : function() {
        }
      };
    },
    Map : function() {
      return {};
    },
    InfoWindow : function() {
      return {open: function(){
      
      }, close:function() {
      
      }};
    },
    StreetViewService : function() {

    }
  };
  google.maps.OverlayView.prototype.getPath = function() {

  };
  google.maps.OverlayView.prototype.getPanes = function() {

  };
  google.maps.OverlayView.prototype.setMap = function() {

  };
  google.maps.OverlayView.prototype.getProjection = function() {

  };
  window.google = google;

  return google.maps;

});