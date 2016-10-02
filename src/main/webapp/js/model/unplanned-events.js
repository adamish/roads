define([ 'model/base-model', 'gmaps' ], function() {

  "use strict";
  var BaseModel = require('model/base-model');
  var google = {
    maps : require('gmaps')
  };

  var UnplannedEvents = BaseModel.extend({
    name : 'unplanned-events',
    url : 'app/unplanned-events',
    initialize : function() {
      BaseModel.prototype.initialize.apply(this, arguments);
    },
    getLocation : function(eventId) {
      var datum = this.getData(eventId);
      return new google.maps.LatLng(datum.latitude, datum.longitude);
    },
    getData : function(id) {
      return this.attributes.content[id];
    },
    sync : function() {
      this.textIndex = undefined;
      return BaseModel.prototype.sync.apply(this, arguments);
    },
    /*
     * tried lunr but took too long to build index. just doing poor-mans
     * substring search
     */
    getTextIndex : function() {
      if (this.textIndex === undefined) {
      var textIndex = [];
      var content = this.attributes.content;
      var contentIndex, contentLength;
      for (contentIndex = 0, contentLength = this.attributes.content.length; contentIndex < contentLength; contentIndex++) {
      textIndex.push({
        id : contentIndex,
        text : content[contentIndex].description.toLowerCase()
      });
      }
      this.textIndex = textIndex;
      }
      return this.textIndex;
    },
    search : function(str, max) {
      if (this.attributes.content === undefined) {
      return [];
      }
      var strLower = str.toLowerCase();
      var returnValue = [];
      var data = this.getTextIndex();
      var i, datum, length;
      for (i = 0, length = data.length; i < length; i++) {
      datum = data[i];
      if (datum.text.indexOf(strLower) != -1) {
      returnValue.push({
        type : 'event',
        id : datum.id,
        summary : this.getData(datum.id).description
      });
      if (returnValue.length >= max) {
      break;
      }
      }
      }
      return returnValue;

    }
  });

  return UnplannedEvents;
});
