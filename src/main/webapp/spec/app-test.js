define([ 'app', 'testutil', 'gmaps' ], function(App, testutil) {
  var google = {
    maps : require('gmaps')
  };

  describe("app", function() {
    it("initialize", function() {
      spyOn(google.maps, 'Map').and.returnValue(testutil.buildMap());
      (new App()).initialize();
    });
  });
});