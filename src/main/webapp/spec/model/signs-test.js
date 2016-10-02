define([ 'model/signs', 'testutil' ], function(Signs, testutil) {

  describe("Sign model", function() {
    var model = {};
    beforeEach(function() {
      model = new Signs({
        content : [
            testutil.buildGantry('gpkyHvmjNiLtGgEbCEBoNhIm@j@', [ testutil.buildVms(100, 12, 2, 'M60/2222B', [ 'horse', 'on fire' ]),
                testutil.buildSignal(101, 'M60/2222B') ], 123),
            testutil.buildGantry('gpkyHvmjNiLtGgEbCEBoNhIm@j@', [ testutil.buildSignal(102, 'M60/1111A1', 'tt11'), testutil.buildSignal(103, 'M60/1111A2'),
                testutil.buildSignal(104, 'M60/1111A3') ], 456) ]
      });
      spyOn(model, 'isLoaded').and.returnValue(true);
    });
    it("build ID map", function() {
      var result = model.getGroupIdMap();
      expect(result[100].id).toBe(0);
      expect(result[102].id).toBe(1);
    });
    it("get map location", function() {
      spyOn(google.maps.geometry.encoding, 'decodePath').and.returnValue([ testutil.buildLatLng(1, 2), testutil.buildLatLng(3, 4) ]);
      expect(model.getLocation(100).lat()).toEqual(2);
      expect(model.getLocation(100).lng()).toEqual(3);
    });
    it("get associated road id", function() {
      expect(model.getRoadId(100)).toBe(123);
    });
    it("can search single result", function() {
      var result = model.search("1111a3", 5);
      expect(result[0].type).toBe('signal');
      expect(result[0].id).toBe(104);
      expect(result[0].summary).toBe("M60/1111A3 AMI");
    });
    it("can search by sign content", function() {
      var result = model.search("horse", 5);
      expect(result[0].type).toBe('vms');
      expect(result[0].id).toBe(100);
      expect(result[0].summary).toBe("M60/2222B VMS 12x2: horse,on fire");
    });
    it("can search by signal content", function() {
      var result = model.search("tt11", 5);
      expect(result[0].type).toBe('signal');
      expect(result[0].id).toBe(102);
      expect(result[0].summary).toBe("M60/1111A1 AMI: tt11");
    });

    it("can search no results", function() {
      var result = model.search("cows", 5);
      expect(result).toEqual([]);
    });
    it("can search many results", function() {
      var result = model.search("/2222b", 5);
      expect(result.length).toEqual(2);
    });
  });
});