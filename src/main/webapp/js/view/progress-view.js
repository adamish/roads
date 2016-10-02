define([ 'jquery', 'underscore', 'backbone', 'jquery-ui', 'text!templates/progress-view.html' ], function() {

  "use strict";
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var template = require("text!templates/progress-view.html");

  var ProgressView = Backbone.View.extend({
    className : 'search-view',
    tagName : 'span',
    initialize : function(options) {
      _.bindAll(this, 'render', 'update');
      this.models = options.models;
      this.models.forEach(function(model) {
        this.listenTo(model, 'sync progressChange error', this.update);
      }, this);
    },
    update : function() {
      var human = {
        'unplanned-events' : 'Events',
        'roads' : 'Road network',
        'signs' : 'Signs',
        'sign-settings' : 'Sign settings',
        'traffic': 'Traffic'
        
      };
      var status = "";
      var notLoaded = this.models.filter(function(model) {
        return !model.isLoaded();
      });
//      this.models.forEach(function(model) {
//        console.log(model.name + " " + model.isLoaded() + model.getProgress());
//      });
      notLoaded = notLoaded.map(function(model) {
        return human[model.name];
      });
      var total = 0;
      var actual = 0;
      var percentage;
      this.models.forEach(function(model) {
        var progress;
        if (!model.isLoaded()) {
          progress = model.getProgress();
          if (_.isNumber(progress)) {
            actual += progress;
          }
        } else {
          actual += 100;
        }
        total += 100;
      });
      status += notLoaded.join(",");
      percentage = Math.round(actual / total * 100.0);
      if (percentage >= 0 && percentage <= 100) {
        status += " " + percentage + "%";
      }
      this.$('.items').text(status);
      this.$el.toggle(notLoaded.length > 0);
    },
    render : function() {
      this.$el.html(template);
      this.update();
      return this;
    }
  });

  return ProgressView;
});
