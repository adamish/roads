define([ 'layer/event-layer', 'model/unplanned-events', 'gmaps', 'testutil' ], function(l) {

  var google = {
    maps : require('gmaps')
  };
  var testutil = require('testutil');
  var EventLayer = require('layer/event-layer');
  var UnplannedEvents = require('model/unplanned-events');

  describe("Event layer", function() {
    var layer = {};
    var mockEvents = {};

    var mockMap = {};
    beforeEach(function() {

      mockEvents = new UnplannedEvents();
      layer = new EventLayer({
        map : mockMap,
        model : mockEvents
      });

      mockEvents
          .set('content', [ testutil.buildEvent('horse on M60 between J1 and J2', 53, -1), testutil.buildEvent('horse on M62 between J3 and J4', 54, -2) ]);

    });

    it("render", function() {
      layer.render();
    });
  });
});