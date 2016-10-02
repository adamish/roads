define([ 'jquery', 'underscore', 'backbone', "text!templates/about-view.html" ], function() {

  "use strict";
  var _ = require('underscore');
  var Backbone = require('backbone');
  var template = require("text!templates/about-view.html");

  var AboutView = Backbone.View.extend({
    className : 'dialog',
    events : {
      'click button.close' : 'hide'
    },
    initialize : function(options) {
      _.bindAll(this, 'show', 'hide');
      this.template = _.template(template);
    },
    render : function() {
      this.$el.html(this.template());
      this.delegateEvents();
    },
    show : function() {
      this.render();
      $('body').append(this.$el);
    },
    hide : function() {
      this.$el.remove();
      Backbone.history.navigate("main", true);
    }
  });
  return AboutView;
});