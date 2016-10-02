define([ 'jquery', 'underscore', 'backbone', 'base', "text!templates/sign-view.html", 'layer/sign-builder' ], function() {

  "use strict";
  var _ = require('underscore');
  var Backbone = require('backbone');
  var template = require("text!templates/sign-view.html");
  var base = require('base');
  var SignBuilder = require('layer/sign-builder');
  var SignView = Backbone.View.extend({
    className : 'sign-view',
    events : {
      "click button.street-view" : 'onStreetView'
    },
    initialize : function(options) {
      _.bindAll(this, 'render', 'show', 'onStreetView');
      this.template = _.template(template);
      this.roads = options.roads;
      this.signs = options.signs;
    },
    show : function(signId) {
      var sign;
      var road;
      this.signId = signId;
      var state;
      if (signId !== null) {
        sign = this.signs.getData(signId);
        road = this.roads.getRoadName(this.signs.getRoadId(signId));
        this.$el.show();
        this.$el.html(this.template({
          sign : sign,
          road : road,
          base : base,
        }));
        state = {
          box : {
            div : this.$('.gantry-overview div')[0]
          },
          data : this.signs.getGantry(signId)
        };
        SignBuilder.build(state, 1, true);
        state.features[signId].style.border = "1px solid #00FF00";
      } else {
        this.$el.hide();
      }
    },
    render : function() {
      this.$el.hide();
      return this;
    },
    onStreetView : function() {
      this.trigger('street-view', this.signId);
    }
  });

  return SignView;
});