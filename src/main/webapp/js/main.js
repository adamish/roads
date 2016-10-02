requirejs.config({
  baseUrl : 'js',
});

require([ 'config' ], function() {
  require([ 'app', 'jquery'], function(App, $) {
    $(document).ready(function() {
      new App().initialize();
    });
  });
});
