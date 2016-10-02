define([ 'jquery', 'underscore', 'backbone', 'base', "text!templates/sign-menu.html" ], function() {

  "use strict";
  // var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var template = require("text!templates/sign-menu.html");

  var SignMenu = Backbone.View.extend({
    id: 'sign-menu',
    events: {
      'click div.menu-item' : 'onClick'
    },
    initialize : function(options) {
      _.bindAll(this, 'render', 'show', 'onClick');
      this.template = _.template(template);
    },
    show : function(e) {
      this.signId = e.signId;
      this.render();
      this.$el.css({
        position : "absolute",
        left : 25 + e.pageX + "px",
        top : 25 + e.pageY + "px"
      }).show();
      $('body').append(this.$el);
    },
    render : function() {
      this.$el.html(this.template());
      this.delegateEvents();
      return this;
    },
    onClick: function() {
      this.trigger("street-view", this.signId);
      this.$el.remove();
    }
  });

  return SignMenu;
});