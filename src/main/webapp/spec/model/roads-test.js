define([ 'model/roads', 'testutil' ], function(Roads, testutil) {

  describe("Roads model", function() {
    var model = {};
    beforeEach(function() {
      model = new Roads({
        content : [ testutil.buildRoad('M60 J1'), testutil.buildRoad('M60 J2'), testutil.buildRoad('M60 J27') ]
      });
    });
    it("can get road name by id", function() {
      expect(model.getRoadName(0)).toEqual('M60 J1');
      expect(model.getRoadName(2)).toEqual('M60 J27');

    });
    it("can get road data by id", function() {
      expect(model.getData(2).name).toEqual('M60 J27');

    });
    it("get map location", function() {
      spyOn(google.maps.geometry.encoding, 'decodePath').and.returnValue(['a', 'b', 'c']);
      expect(model.getLocation(2)).toEqual("b");
    });
    it("can search single result", function() {
      var result = model.search("j27", 5);
      expect(result[0].type).toBe('road');
      expect(result[0].id).toBe(2);
      expect(result[0].summary).toBe("M60 J27");
    });
    it("can search no results", function() {
      var result = model.search("horse", 5);
      expect(result).toEqual([]);
    });
    it("can search many results", function() {
      var result = model.search("m60", 5);
      expect(result.length).toEqual(3);
    });
  });
});