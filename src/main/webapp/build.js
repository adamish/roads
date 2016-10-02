({
  findNestedDependencies: true,
  baseUrl : "js",
  mainConfigFile : 'js/main.js',
  paths : {
    requireLib: 'third-party/require-2.1.11',
    async : 'third-party/async',
    jquery : 'third-party/jquery-2.1.0.min',
    'jquery-ui' : 'third-party/jquery-ui-1.10.4.custom.min',
    underscore : 'third-party/underscore-1.5.2.min',
    backbone : 'third-party/backbone-1.1.0.min',
    moment : 'third-party/moment.2.5.1.min',
    markerclusterer: 'third-party/markerclusterer.1.0.2',
    gmaps : 'third-party/gmaps',
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
  },
  name: "main",
  out: "production/js/main.min.js",
  include: ["requireLib"]
})
