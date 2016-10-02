define([ 'jquery', 'underscore', 'backbone', 'text!templates/event-view.html', 'base' ], function() {

  "use strict";
  var _ = require('underscore');
  var Backbone = require('backbone');
  var template = require("text!templates/event-view.html");
  var base = require('base');

  var RoadView = Backbone.View.extend({
    className : 'event-view',
    initialize : function(options) {
      _.bindAll(this, 'render', 'show');
      this.template = _.template(template);
      this.unplannedEvents = options.unplannedEvents;
    },
    show : function(eventId) {
      if (eventId !== null) {
        this.$el.show();
        this.$el.html(this.template({
          event : this.unplannedEvents.getData(eventId),
          base: base
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