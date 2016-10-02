define([ 'model/base-model' ], function() {
  "use strict";
  var BaseModel = require('model/base-model');

  var TrafficData = BaseModel.extend({
    name : 'traffic',
    url : 'app/traffic',
    getData : function(id) {
      return this.getIdMap()[id];
    },
    getTime : function() {
      return this.attributes.header.time;
    },
    getIdMap : function() {
      var idMap = {};

      if (this.idMap) {
      return this.idMap;
      }
      var index, length;
      var traffic = this.attributes.content;
      var eachTraffic;
      for (index = 0, length = traffic.length; index < length; index++) {
      eachTraffic = traffic[index];
      idMap[eachTraffic.id] = eachTraffic;
      }
      this.idMap = idMap;
      return this.idMap;
    }
  });
  return TrafficData;
});
