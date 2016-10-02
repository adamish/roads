define([ 'view/road-view', 'model/traffic', 'model/roads', 'testutil' ], function() {
  var view = {};
  var RoadView = require('view/road-view');
  var mockRoads = {};
  var mockTraffic = {};

  describe("Road view", function() {

    beforeEach(function() {
      mockRoads = jasmine.createSpyObj("model", [ 'getData' ]);
      mockRoads.getData.and.returnValue({
        name : 'M60 J1'
      });
      mockTraffic = jasmine.createSpyObj("model", [ 'getData', 'getTime', 'isLoaded' ]);
      mockTraffic.isLoaded.and.returnValue(true);
      view = new RoadView({
        roads : mockRoads,
        traffic : mockTraffic
      });
    });
    it("road without traffic data", function() {
      view.show(123);
      expect(view.$el.text()).toContain("M60 J1");
    });
    it("road with traffic data", function() {
      mockTraffic.getTime.and.returnValue(new Date(2014, 0, 31, 9, 30));
      mockTraffic.getData.and.returnValue({
        flow : 22,
        speed : 100,
        occupancy : 44,
      });
      view.show(123);
      expect(view.$el.text()).toContain("22");
      expect(view.$el.text()).toContain("62");
      expect(view.$el.text()).toContain("44");
      expect(view.$el.text()).toContain("M60 J1");
      $('body').append(view.$el);
    });
  });

});