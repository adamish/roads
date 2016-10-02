define([ 'backbone' ], function() {

  "use strict";
  var Backbone = require('backbone');
  var _ = require('underscore');

  var BaseModel = Backbone.Model.extend({
    initialize : function() {
      _.bindAll(this, 'isLoaded', 'setLoaded', 'setProgress', 'getProgress');
      this.on('sync error', function() {
        this.setLoaded(true);
      }, this);
      this.loaded = false;
    },
    getUrl : function() {
      return this.url;
    },
    isLoaded : function() {
      return this.loaded;
    },
    setLoaded : function(loaded) {
      this.loaded = loaded;
      this.trigger('progressChange');
    },
    sync : function(method, model, options) {
      var that = this;
      this.setLoaded(false);
      this.setProgress(0);
      options.beforeSend = function(xhr, settings) {
        settings.xhr = function() {
          var xhr = $.ajaxSettings.xhr();
          // var contentLengthRegex = /Content-Length:\s*(\d+)/i;
          xhr.addEventListener("progress", function(event) {
            // var headers = this.getAllResponseHeaders();
            // var length = contentLengthRegex.exec(headers)[1];
            that.setProgress(Math.round(event.loaded / event.total * 100.0));
          }, false);
          return xhr;
        };
      };
      return Backbone.sync(method, model, options);
    },
    setProgress : function(progress) {
      this.progress = progress;
      this.trigger('progressChange');
    },
    getProgress : function() {
      return this.progress;
    }
  });
  return BaseModel;
});