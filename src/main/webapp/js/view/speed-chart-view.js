define([ 'jquery', 'underscore', 'backbone', 'text!templates/road-table-view.html' ], function() {

  "use strict";
  var _ = require('underscore');
  var Backbone = require('backbone');
  var template = require("text!templates/speed-chart-view.html");

  var SpeedChartView = Backbone.View.extend({
    className : 'speed-chart-view',
    initialize : function(options) {
      _.bindAll(this, 'render', 'onRoadsLoad');
      this.template = _.template(template);
      this.roads = options.roads;
      this.roads.on('sync', this.onRoadsLoad);
    },
    onRoadsLoad : function() {
      var table = document.createElement('tbody');
      var i, length;
      var roads = this.roads.attributes.content, road;
      var row, cell;
      for (i = 0, length = this.roads.attributes.content.length; i < length; i++) {
      road = roads[i];
      if (road[1] !== 0) {
      continue;
      }
      row = document.createElement('tr');
      cell = document.createElement('td');
      cell.innerHTML = road[0];
      row.appendChild(cell);
      table.appendChild(row);
      
      }
      this.$('table tbody').replaceWith(table);
    },
    render : function() {
      this.$el.html(this.template());
      return this;
    }
  });

  return SpeedChartView;
});