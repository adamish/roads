define([ 'layer/road-layer', 'model/roads', 'gmaps', 'testutil' ], function(Layer, Roads, foo, testutil) {

  var google = {
    maps : require('gmaps')
  };
  var BackBone = require('backbone');
  
  var buildRoad = function(text, type, geometry, length) {
    return [ text, type, geometry, length ];
  };
  var mockMap = {};
  var mockTraffic = {};
  
  describe("Road layer", function() {
    var layer = {};

    var countVisible = function() {
      return layer.states.filter(function(it) {
        return it.polyline !== null;
      }).length;
    };
    beforeEach(function() {
      spyOn(google.maps, 'OverlayView').and.returnValue(testutil.buildOverlay());
      testutil.mockPolyline();

      mockMap = testutil.buildMap();
      var mockRoads = new Roads({
        content : [ buildRoad('M60 J1-J2', 0, 'gpkyHvmjNiLtGgEbCEBoNhIm@j@', 9000), buildRoad('M60 J2-J3', 0, 'gpkyHvmjNiLtGgEbCEBoNhIm@j@', 500),
            buildRoad('M60 J3 exit', 1, 'gpkyHvmjNiLtGgEbCEBoNhIm@j@', 50), buildRoad('M60 J3 roundabout', 1, 'gpkyHvmjNiLtGgEbCEBoNhIm@j@', 50) ],
        index : {
          index : [ [ 0, 1, 2, 3 ], [], [], [] ],
          parameters : {
            x0 : -1,
            x1 : 1,
            y0 : 50,
            y1 : 51,
            gw : 2,
            gh : 2
          }
        }
      });
      spyOn(mockRoads, 'isLoaded').and.returnValue(true);
      mockTraffic = new BackBone.Model();
      
      mockMap.getBounds.and.returnValue(testutil.buildBounds(-1, 50, -0.1, 50.4));
      mockMap.getZoom.and.returnValue(14);
      layer = new Layer({
        map : mockMap,
        roads : mockRoads,
        traffic : mockTraffic
      });

      spyOn(google.maps.geometry.encoding, 'decodePath').and.returnValue([ 0, 1, 2 ]);
    });

    it("all details when zoomed in", function() {
      mockMap.getZoom.and.returnValue(14);
      layer.zoomChanged();
      expect(google.maps.Polyline.calls.count()).toBe(4);
    });

    it("show feature", function() {
      layer.zoomChanged();
      layer.showFeature(2);
      expect(mockMap.panTo).toHaveBeenCalled();
    });
    
    it("show traffic", function() {
      mockTraffic.set('content', [testutil.buildTraffic(1,70),testutil.buildTraffic(2,50)]);
      mockTraffic.trigger('sync');
    });
    
    it("only builds polygons once", function() {
      mockMap.getZoom.and.returnValue(14);
      layer.zoomChanged();
      expect(google.maps.Polyline.calls.count()).toBe(4);
      layer.zoomChanged();
      expect(google.maps.Polyline.calls.count()).toBe(4);
    });

    it("only long roads when zoomed out", function() {
      mockMap.getZoom.and.returnValue(7);
      layer.zoomChanged();
      expect(google.maps.Polyline.calls.count()).toBe(1);
    });

    it("pan to different area", function() {
      mockMap.getZoom.and.returnValue(14);
      layer.zoomChanged();
      expect(countVisible()).toBe(4);
      mockMap.getBounds.and.returnValue(testutil.buildBounds(0.1, 50.6, 1, 51));
      layer.zoomChanged();
      expect(countVisible()).toBe(0);
    });

    it("load test", function() {
      var i;
      var content = [];
      var index = [ [], [], [], [] ];
      for (i = 0; i < 1000; i++) {
        content.push(buildRoad('M60 J' + i, i % 4, 'gpkyHvmjNiLtGgEbCEBoNhIm@j@', i % 100));
        index[0].push(i);
        index[3].push(i);
      }

      layer.roads.get('index').index = index;
      layer.roads.set('content', content);
      layer.zoomChanged();
      expect(google.maps.Polyline).toHaveBeenCalled();
    });
  });
});