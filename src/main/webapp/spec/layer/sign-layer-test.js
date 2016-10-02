define([ 'layer/sign-layer', 'model/signs', 'model/sign-settings', 'gmaps', 'testutil' ], function(l) {

  var google = {
    maps : require('gmaps')
  };
  var testutil = require('testutil');
  var SignLayer = require('layer/sign-layer');
  var HtmlLayer = require('layer/html-layer');
  var Signs = require('model/signs');
  var SignSettings = require('model/sign-settings');

  describe("Sign layer", function() {
    var layer = {};
    var mockSigns = {};
    var mockSignSettings = {};
    var mockHtmlLayer = {};

    var mockMap = {};
    beforeEach(function() {
      testutil.mockPolyline();

      mockHtmlLayer = jasmine.createSpyObj('htmlLayer', [ 'add', 'draw', 'remove', 'on', 'show', 'hide', 'isReady' ]);
      spyOn(HtmlLayer, 'create').and.returnValue(mockHtmlLayer);
      mockHtmlLayer.isReady.and.returnValue(true);
      mockMap = testutil.buildMap();

      spyOn(google.maps.geometry.encoding, 'decodePath').and.returnValue([]);
      spyOn(google.maps, 'Marker').and.returnValue(jasmine.createSpyObj('marker', [ 'setMap' ]));

      mockMap.getBounds.and.returnValue(testutil.buildBounds(-0.5, 51, -0.1, 51.4));
      mockMap.getZoom.and.returnValue(14);

      mockSignSettings = new SignSettings();
      mockSigns = new Signs();
      layer = new SignLayer({
        map : mockMap,
        signs : mockSigns,
        signSettings : mockSignSettings
      });

      mockSigns.set('content', [ testutil.buildGantry('gpkyHvmjNiLtGgEbCEBoNhIm@j@', [ testutil.buildVms(100, 12, 2), testutil.buildSignal(101) ]),
          testutil.buildGantry('gpkyHvmjNiLtGgEbCEBoNhIm@j@', [ testutil.buildSignal(102), testutil.buildSignal(103), testutil.buildSignal(104) ]),
          testutil.buildGantry('gpkyHvmjNiLtGgEbCEBoNhIm@j@', [ testutil.buildVms(105, 18, 4, 'M60/5558', [], 'SPICE MS4 4x') ]) ]);

      mockSigns.set('index', {
        index : [ [ 0 ], [ 2 ], [], [ 1 ] ],
        parameters : {
          x0 : -0.5,
          x1 : 0.5,
          y0 : 51,
          y1 : 52,
          gw : 2,
          gh : 2
        }
      });

    });

    it("render", function() {

      layer.render();
      expect(google.maps.Polyline).toHaveBeenCalled();
      expect(mockHtmlLayer.add).toHaveBeenCalled();
      var html = $(mockHtmlLayer.add.calls.argsFor(0)[0].div);
      expect(html.text()).toBe('');
      expect(html.attr('class')).toContain('gantry');
    });

    it("only builds polygons once", function() {
      layer.render();
      expect(google.maps.Polyline.calls.count()).toBe(1);
      layer.render();
      expect(google.maps.Polyline.calls.count()).toBe(1);
    });

    it("pan to different area", function() {
      layer.render();
      mockMap.getBounds.and.returnValue(testutil.buildBounds(0.1, 51.5, 0.5, 52));
      layer.render();
      expect(mockHtmlLayer.remove).toHaveBeenCalled();
    });
    it("show summary markers at high zoom levels", function() {
      mockMap.getZoom.and.returnValue(5);
      mockSignSettings.set('content', [ testutil.buildSignSetting(100, [ 'HORSE', 'attack' ]) ]);
      mockSignSettings.trigger('sync');
      layer.render();
      expect(google.maps.Marker).toHaveBeenCalled();
      expect(google.maps.Marker.calls.count()).toBe(1);
    });

    it("show current VMS message", function() {
      mockSignSettings.set('content', [ testutil.buildSignSetting(100, [ 'HORSE', 'attack' ]) ]);
      mockSignSettings.trigger('sync');
      layer.render();
      expect(mockHtmlLayer.add).toHaveBeenCalled();
      var html = $(mockHtmlLayer.add.calls.argsFor(0)[0].div);
      expect(html.text()).toBe('horseattack');
      expect(html.attr('class')).toContain('gantry');
      expect(google.maps.Marker).not.toHaveBeenCalled();

    });
    it("show MS4 message", function() {
      mockMap.getBounds.and.returnValue(testutil.buildBounds(0.1, 51.0, 0.5, 51.4));

      mockSignSettings.set('content', [ testutil.buildSignSetting(105, [ 'aBcD' ]) ]);
      mockSignSettings.trigger('sync');
      layer.render();
      expect(mockHtmlLayer.add).toHaveBeenCalled();
      var html = $(mockHtmlLayer.add.calls.argsFor(0)[0].div);
      expect(html.text()).toBe('aBcD');
    });
    it("show current signal setting", function() {
      mockMap.getBounds.and.returnValue(testutil.buildBounds(0.1, 51.5, 0.5, 52));

      mockSignSettings.set('content', [ testutil.buildSignSetting(102, '20r'), testutil.buildSignSetting(103, '30r') ]);
      mockSignSettings.trigger('sync');
      layer.render();
      expect(mockHtmlLayer.add).toHaveBeenCalled();
      var html = $(mockHtmlLayer.add.calls.argsFor(0)[0].div);
      expect(html.find("img").eq(0).attr('src')).toContain("20r");
      expect(html.find("img").eq(1).attr('src')).toContain("30r");

    });

    it("show feature", function() {
      spyOn(layer.signs, 'getLocation').and.returnValue('foo');
      layer.render();
      layer.showFeature(102);
      expect(mockMap.panTo).toHaveBeenCalled();
    });

  });
});