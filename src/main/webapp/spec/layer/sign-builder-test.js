define([ 'layer/sign-builder', 'testutil' ], function(l) {

  var testutil = require('testutil');
  var SignBuilder = require('layer/sign-builder');

  describe("Sign builder", function() {

    beforeEach(function() {
      builder = new SignBuilder();

    });

    it("Pictogram", function() {
      var state = {
        box : {
          div : $('<div></div>')[0]
        },
        data : testutil.buildGantry('xxxx', [ testutil.buildVms(101, 18, 3, 'M6/1111', [ 'SY10','Horse' ], 'MS4', 10), testutil.buildSignal(102),
            testutil.buildSignal(103) ])
      };
      builder.build(state, 1, false);
      expect($(state.box.div).html()).toContain('Horse');
      expect($(state.box.div).find('img').attr('src')).toContain('sy10.png');
    });
    it("mixed", function() {
      var state = {
        box : {
          div : $('<div></div>')[0]
        },
        data : testutil.buildGantry('xxxx', [ testutil.buildVms(101, 18, 3, 'M6/1111', [ 'Horse', 'Power' ], 'MS4', 10), testutil.buildSignal(102, '', 'off'),
            testutil.buildSignal(103, '', '50r') ])
      };
      builder.build(state, 1, false);
      expect($(state.box.div).html()).toContain('Horse');
      expect($(state.box.div).find('img').eq(0).attr('src')).toContain('off.png');
      expect($(state.box.div).find('img').eq(1).attr('src')).toContain('50r.png');

    });
    it("adjust rcc pictogram high number", function() {
      var state = {
        box : {
          div : $('<div></div>')[0]
        },
        data : testutil.buildGantry('xxxx', [ testutil.buildVms(101, 18, 3, 'M6/1111', [ 'SY11', 'Power' ], 'MS4', 30) ])
      };
      builder.build(state, 1, false);
      expect($(state.box.div).find('img').eq(0).attr('src')).toContain('sy13.png');
    });
    it("adjust rcc pictogram low number", function() {
      var state = {
        box : {
          div : $('<div></div>')[0]
        },
        data : testutil.buildGantry('xxxx', [ testutil.buildVms(101, 18, 3, 'M6/1111', [ 'SY08', 'Power' ], 'MS4', 50) ])
      };
      builder.build(state, 1, false);
      expect($(state.box.div).find('img').eq(0).attr('src')).toContain('sy09.png');
    });
    it("pictogram with placeholders", function() {
      var state = {
        box : {
          div : $('<div></div>')[0]
        },
        data : testutil.buildGantry('xxxx', [ testutil.buildVms(101, 18, 3, 'M6/1111', [ 'SY19 J5', 'M6'], 'MS4', 40) ])
      };
      builder.build(state, 1, false);
      expect($(state.box.div).find('canvas').attr('width')).toBe('81');
      expect($(state.box.div).find('canvas').attr('height')).toBe('54');

      expect($(state.box.div).text()).not.toContain('J5');
      expect($(state.box.div).text()).not.toContain('M6');

    });
    it("too many placeholders", function() {
      var state = {
        box : {
          div : $('<div></div>')[0]
        },
        data : testutil.buildGantry('xxxx', [ testutil.buildVms(101, 18, 3, 'M6/1111', [ 'SY19', 'J5', 'M6', 'horse'], 'MS4', 40) ])
      };
      builder.build(state, 1, false);
      expect($(state.box.div).find('canvas').attr('width')).toBe('81');
      expect($(state.box.div).find('canvas').attr('height')).toBe('54');

      expect($(state.box.div).text()).not.toContain('J5');
      expect($(state.box.div).text()).not.toContain('M6');

    });
  });
});