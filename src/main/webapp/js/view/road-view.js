define([ 'jquery', 'underscore', 'backbone', 'text!templates/road-view.html', 'base' ], function() {

  "use strict";
  var _ = require('underscore');
  var Backbone = require('backbone');
  var template = require("text!templates/road-view.html");
  var base = require('base');

  var RoadView = Backbone.View.extend({
    className : 'road-view',
    initialize : function(options) {
      _.bindAll(this, 'render', 'show');
      this.template = _.template(template);
      this.roads = options.roads;
      this.traffic = options.traffic;
    },
    show : function(roadId) {
      if (roadId !== null) {
        this.$el.show();
        this.$el.html(this.template({
          road : this.roads.getData(roadId),
          traffic : this.traffic.isLoaded() ? this.traffic.getData(roadId) : null,
          base: base,
          time: this.traffic.isLoaded() ? this.traffic.getTime() : null
        }));
      } else {
        this.$el.hide();
      }
    },
    render : function() {
      this.$el.hide();
      return this;
    }
  });

  return RoadView;
});