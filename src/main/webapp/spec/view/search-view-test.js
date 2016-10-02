define([ 'view/search-view' ], function() {
  var view = {};
  var SearchView = require('view/search-view');
  var mockRoads = {};

  describe("Search view", function() {

    beforeEach(function() {
      mockRoads = jasmine.createSpyObj("model", [ 'search' ]);
      view = new SearchView({
        models : [ mockRoads ]
      });
      view.render();
      $('body').append(view.$el);
      jasmine.clock().install();

    });
    afterEach(function() {
      view.remove();
    });

    it("shows results when user enters substring", function(done) {
      mockRoads.search.and.returnValue([{
        type: 'Road',
        id: 123,
        summary : 'M60 J1 Horse Power'
      }]);
      view.$(".search").val('M');
      view.$(".search").trigger("keydown");
      jasmine.clock().tick(1000);
      expect($('ul.ui-autocomplete').text()).toContain('Horse Power');
      done();
    });
  });
});