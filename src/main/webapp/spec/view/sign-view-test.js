define([ 'view/sign-view', 'model/signs', 'testutil' ], function() {
  var view = {};
  var SignView = require('view/sign-view');
  var testutil = require('testutil');

  describe("Sign view", function() {
    var mockRoads = {};
    var mockSigns = {};

    beforeEach(function() {
      mockRoads = jasmine.createSpyObj("model", [ 'getRoadName' ]);
      mockRoads.getRoadName.and.returnValue('M60 J1');
      mockSigns = jasmine.createSpyObj("model", [ 'getData', 'getRoadId', 'getGantry' ]);
      mockSigns.getData.and.returnValue({type: 'VMS', gid: 'M60/5566A2', time: new Date(2014, 0, 4, 9, 30).getTime()/1000});
      mockSigns.getGantry.and.returnValue({type: 'VMS', group: [testutil.buildVms(123,18, 3, 'M6/111')]});

      view = new SignView({roads: mockRoads, signs: mockSigns});
    });
    it("show details", function() {
      view.show(123);
      expect(view.$el.text()).toContain("M60/5566A2");
      expect(view.$el.text()).toContain("M60 J1");
      expect(view.$el.text()).toContain("at 09:30");
    });
  });

});