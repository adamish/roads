define([ 'base' ], function(base) {

  describe("base", function() {
    it("human time seconds", function() {
      var t0 = new Date(2014, 0, 31, 9, 30).getTime();
      expect(base.humanTime(t0, new Date(2014, 0, 31, 9, 31, 01).getTime())).toBe('Now');

      expect(base.humanTime(t0, new Date(2014, 0, 31, 9, 29, 59).getTime())).toBe('1 second ago');
      expect(base.humanTime(t0, new Date(2014, 0, 31, 9, 29, 58).getTime())).toBe('2 seconds ago');

      expect(base.humanTime(t0, new Date(2014, 0, 31, 9, 29).getTime())).toBe('1 minute ago');
      expect(base.humanTime(t0, new Date(2014, 0, 31, 9, 28).getTime())).toBe('2 minutes ago');

      expect(base.humanTime(t0, new Date(2014, 0, 31, 8, 29).getTime())).toBe('1 hour ago');
      expect(base.humanTime(t0, new Date(2014, 0, 31, 7, 29).getTime())).toBe('2 hours ago');

      expect(base.humanTime(t0, new Date(2014, 0, 30, 8, 30).getTime())).toBe('30 Jan at 08:30');

    });
  });
});