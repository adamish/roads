define(['view/main-view'], function(MainView) {

  "use strict";

  var App = function() {

  };

  App.prototype.initialize = function() {
    new MainView().render();
  };

  return App;
});