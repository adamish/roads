define(['backbone'], function(Backbone) {

  "use strict";
  var Router = Backbone.Router.extend({
    routes : {
      "road/:roadId" : "showRoad"
    }
  });

  return Router;
});