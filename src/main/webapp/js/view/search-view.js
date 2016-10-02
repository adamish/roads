define([ 'jquery', 'underscore', 'backbone', 'jquery-ui', 'text!templates/search-view.html' ], function() {

  "use strict";
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var template = require("text!templates/search-view.html");

  var Search = Backbone.View.extend({
    className : 'search-view',
    tagName : 'span',
    initialize : function(options) {
      _.bindAll(this, 'search');
      this.models = options.models;
    },
    render : function() {
      this.$el.html(template);
      var view = this;
      var autocomplete = this.$(".search").autocomplete({
        source : function(request, response) {
          var results = view.search(request.term);
          response(results);
        },
        select : function(event, ui) {
          view.trigger('select_' + ui.item.type, ui.item.id);
          view.$(".search").val("").blur();
          return false;
        },
        minLength : 1
      });

      autocomplete.data("ui-autocomplete")._renderItem = function(ul, item) {
        return $("<li>").append("<a>" + item.summary + "</a>").appendTo(ul);
      };
      var typeToCategory = {
        'event' : "Events",
        "vms" : "Signs",
        "road" : "Roads",
        "signal" : "Matrix signals"
      };
      autocomplete.data("ui-autocomplete")._renderMenu = function(ul, items) {
        var that = this, currentCategory = "";
        $.each(items, function(index, item) {
          item.category = typeToCategory[item.type];
          if (item.category != currentCategory) {
            ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
            currentCategory = item.category;
          }
          that._renderItemData(ul, item);
        });
      };
      return this;
    },
    search : function(str) {
      var results = [];
      var max = 5;
      var strCompare = function(a, b) {
        if (a === b) {
          return 0;
        } else if (a > b) {
          return -1;
        } else if (a < b) {
          return 1;
        }
      };
      var compare = function(a, b) {
        if (a.type === b.type) {
          return strCompare(a.summary, b.summary);
        } else {
          return strCompare(a.type, b.type);
        }
      };
      
      this.models.forEach(function(model) {
        var eachResults = model.search(str, max);
        eachResults.sort(compare);
        results = results.concat(eachResults);
      });


      return results;

    }
  });

  return Search;
});
