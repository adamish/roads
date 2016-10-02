define([], function() {
  requirejs.config({
    baseUrl : 'js',
    paths : {
      async : 'third-party/async',
      jquery : 'third-party/jquery-2.1.0.min',
      'jquery-ui' : 'third-party/jquery-ui-1.10.4.custom.min',
      underscore : 'third-party/underscore-1.5.2.min',
      backbone : 'third-party/backbone-1.1.0.min',
      moment : 'third-party/moment.2.5.1.min',
      gmaps : 'third-party/gmaps',
      markerclusterer: 'third-party/markerclusterer.1.0.2',
      templates : '../templates'
    },
    shim : {
      'backbone' : {
        deps : [ 'underscore', 'jquery' ],
        exports : 'Backbone'
      },
      'underscore' : {
        exports : '_'
      },
      markerclusterer : {
        deps : [ 'gmaps'],
        exports : 'MarkerClusterer'
      },
    }
  });
});
