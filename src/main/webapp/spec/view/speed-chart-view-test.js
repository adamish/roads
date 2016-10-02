define([ 'view/speed-chart-view', 'testutil' ], function() {
  var view = {};
  var SpeedChartView = require('view/speed-chart-view');
  var testutil = require('testutil');

  describe("Speed chart view", function() {
    var mockRoads = {};
    var mockTraffic = {};

    beforeEach(function() {
      mockRoads = jasmine.createSpyObj("model", [ 'getRoadName' ]);
      mockRoads.getRoadName.and.returnValue("M60 J1");
      mockTraffic = new Backbone.Model({
        content : [ testutil.buildTraffic(1, 70 * 1.609344),
                    testutil.buildTraffic(2, 60 * 1.609344),
                    testutil.buildTraffic(3, 50 * 1.609344),
                    testutil.buildTraffic(4, 40 * 1.609344),
                    testutil.buildTraffic(5, 30 * 1.609344),
                    testutil.buildTraffic(6, 20 * 1.609344)]
      });
      mockTraffic.getTime = function() {
        return 0;
      };
      view = new SpeedChartView({
        roads : mockRoads,
        traffic : mockTraffic
      });
    });
    it("show details", function() {
      view.maxResults = 3;
      view.render();
      expect(view.$el.html()).toContain("M60 J1");

      expect(view.$el.html()).toContain(70);
      expect(view.$el.html()).toContain(60);
      expect(view.$el.html()).toContain(50);
      expect(view.$el.html()).not.toContain(40);
      expect(view.$el.html()).not.toContain(30);
      expect(view.$el.html()).not.toContain(20);
    });
  });

});