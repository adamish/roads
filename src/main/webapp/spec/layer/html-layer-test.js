define([ 'layer/html-layer', 'gmaps', 'testutil' ], function() {

  var google = {
    maps : require('gmaps')
  };
  var box;
  var HtmlLayer = require('layer/html-layer');
  describe("HTML layer", function() {

    beforeEach(function() {
      layer = HtmlLayer.create();
      box = {
        div : document.createElement('div'),
        id: 123
      };
      spyOn(google.maps.OverlayView.prototype, 'getPanes').and.returnValue({
        overlayMouseTarget : document.createElement('div')
      });
      layer.onAdd();
    });
    it("adds box", function() {
      layer.add(box);
    });
    it("remove box", function() {
      layer.add(box);
      layer.remove(box);
    });
  });
});