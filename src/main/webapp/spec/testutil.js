define([], function() {

  var testutil = {};
  testutil.buildLatLng = function(lat, lng) {
    var mock = jasmine.createSpyObj('latlng', [ 'lat', 'lng' ]);
    mock.lat.and.returnValue(lat);
    mock.lng.and.returnValue(lng);
    return mock;
  };

  testutil.buildBounds = function(x0, y0, x1, y1) {
    var bounds = jasmine.createSpyObj('bounds', [ 'getSouthWest', 'getNorthEast' ]);
    bounds.getSouthWest.and.returnValue(testutil.buildLatLng(y0, x0));
    bounds.getNorthEast.and.returnValue(testutil.buildLatLng(y1, x1));
    return bounds;
  };

  testutil.buildMap = function() {
    return jasmine.createSpyObj('map', [ 'getZoom', 'getBounds', 'panTo', 'setZoom', 'getCenter' ]);
  };
  testutil.buildOverlay = function() {
    return jasmine.createSpyObj('overlay', [ 'setMap' ]);
  };
  testutil.buildPolyline = function() {
    return jasmine.createSpyObj('polyline', [ 'getPath', 'setPath', 'getVisible', 'setVisible', 'setOptions', 'setMap' ]);
  };
  testutil.mockPolyline = function() {
    spyOn(google.maps, 'Polyline').and.callFake(function(options) {
      var val = testutil.buildPolyline();
      _.extend(val, options);
      return val;
    });
  };

  testutil.buildSignSetting = function(id, value, time) {
    return {
      id : id,
      value : value,
      time : time
    };
  };
  testutil.buildVms = function(id, w, h, gid, value, type, rcc) {
    return {
      id : id,
      w : w,
      h : h,
      gid: gid,
      type: type === undefined ? 'VMS ' + w + "x" + h : type,
      value: value,
      rcc: rcc
    };
  };
  testutil.buildSignal = function(id, gid, value, rcc) {
    return {
      id : id,
      gid : gid,
      type: 'AMI',
      value: value,
      rcc: rcc
    };
  };
  testutil.buildGantry = function(geometry, group, road) {
    return {
      g : geometry,
      group : group,
      road : road
    };
  };
  testutil.buildRoad = function(name, type, geometry, length) {
    return [ name, type, geometry, length ];
  };
  testutil.buildEvent = function(description, latitude, longitude) {
    return {description:description, latitude: latitude, longitude: longitude};
  };
  testutil.buildTraffic = function(id, speed) {
    return {id: id, speed: speed};
  };
  return testutil;
});