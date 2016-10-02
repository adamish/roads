define([ 'model/unplanned-events', 'testutil' ], function(UnplannedEvents, testutil) {

  describe("Unplanned events model", function() {
    var model = {};
    beforeEach(function() {
      model = new UnplannedEvents({
        content : [ testutil.buildEvent('horse on M60 between J1 and J2', 53, -1), testutil.buildEvent('horse on M62 between J3 and J4', 54, -2) ]
      });
      spyOn(model, 'isLoaded').and.returnValue(true);
    });
    it("get map location", function() {
      spyOn(google.maps, 'LatLng').and.returnValue(testutil.buildLatLng(53, 1));
      var pos = model.getLocation(1);
      expect(pos.lat()).toBe(53);
    });
    it("can search single result", function() {
      var result = model.search("m62", 5);
      expect(result[0].type).toBe('event');
      expect(result[0].id).toBe(1);
      expect(result[0].summary).toContain('horse');
    });
    it("can search no results", function() {
      var result = model.search("cow", 5);
      expect(result).toEqual([]);
    });
    it("can search many results", function() {
      var result = model.search("horse", 5);
      expect(result.length).toEqual(2);
    });
  });
});