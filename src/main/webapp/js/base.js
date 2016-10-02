define([ 'underscore', 'backbone', 'moment' ], function() {

  "use strict";
  var _ = require('underscore');
  var Backbone = require('backbone');
  var moment = require('moment');
  var adamish = {};

  adamish.time = function(fn, name, context) {
    var t0 = new Date().getTime();
    var result = fn.apply(context, Array.prototype.slice.call(arguments, 3));
    var t1 = new Date().getTime();
    console.log(name + " took " + (t1 - t0) + " ms");
    return result;
  };

  adamish.humanTime = function(now, unix) {
    var msInSecond = 1000;
    var msInMinute = 60 * 1000;
    var msInHour = 60 * 60 * 1000;
    var msInDay = 24 * 60 * 60 * 1000;
    var relative = now - unix;
    var value;
    var getS = function(value) {
      return value > 1 ? 's': '';
    };
    if (relative <= 0) {
      return "Now";
    } else if (relative < msInMinute) {
      value = Math.floor(relative / msInSecond);
      return value + " second" + getS(value) + " ago";
    } else if (relative < msInHour) {
      value = Math.floor(relative / msInMinute);
      return Math.floor(relative / msInMinute) + " minute" + getS(value) + " ago";
    } else if (relative < msInDay) {
      value = Math.floor(relative / msInHour);
      return Math.floor(relative / msInHour) + " hour" + getS(value) + " ago";
    } else {
      return moment(unix).format("D MMM [at] HH:mm");
    }
  };

  adamish.format = function(str) {
    var args = arguments;
    var i = 1;
    return str.replace(/%s/g, function(match) {
      return args[i++];
    });
  };

  var DebugView = Backbone.View.extend({
    className : 'debug',
    initialize : function() {
      _.bindAll(this, 'info', 'render');
      this.lines = [];
      this.count = 0;
    },
    render : function() {
      this.$el.empty();
      this.lines.forEach(function(line) {
        this.$el.append(line + "\n");
      }, this);
      return this;
    },
    info : function(str) {
      this.count++;
      this.lines.splice(0, 0, this.count + ":" + adamish.format.apply(this, arguments));
      var max = 10;
      if (this.lines.length > max) {
        this.lines = this.lines.slice(0, this.lines.length - 1);
      }
      this.render();
    }
  });

  adamish.debug = new DebugView();

  return adamish;
});