define([ 'view/progress-view', 'model/signs' ], function() {
  var view = {};
  var ProgressView = require('view/progress-view');
  var Signs = require('model/signs');

  describe("Progress view", function() {

    beforeEach(function() {
      mockRoads = new Signs();
      mockSigns = new Signs();
      
      view = new ProgressView({
        models : [ mockRoads, mockSigns ]
      });
      view.render();
    });
    afterEach(function() {
      view.remove();
    });

    it("some models loaded", function() {
      view.render();
      expect(view.$el.text()).toContain('Signs,Signs');
      mockRoads.trigger('sync');
      expect(view.$el.text()).toContain('Signs');
      mockSigns.trigger('sync');
      expect(view.$el.text()).not.toContain('Signs');
    });
  });
});