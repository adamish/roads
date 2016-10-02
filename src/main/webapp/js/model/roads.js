define([ 'model/base-model' ], function() {

  "use strict";
  var BaseModel = require('model/base-model');

  var Roads = BaseModel.extend({
    name: 'roads',
    url : 'app/roads',
    initialize : function() {
      BaseModel.prototype.initialize.apply(this, arguments);
    },
    getRoadName : function(id) {
      if (this.attributes.content === undefined) {
        return "Unknown";
      }
      return this.attributes.content[id][0];
    },
    getLocation : function(roadId) {
      var path = this.attributes.content[roadId][2];
      var decoded = google.maps.geometry.encoding.decodePath(path);
      return decoded[Math.floor(decoded.length / 2)];
    },
    getData : function(roadId) {
      return {
        name : this.attributes.content[roadId][0]
      };
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
            text : content[contentIndex][0].toLowerCase()
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
            type : 'road',
            id : datum.id,
            summary : this.getRoadName(datum.id)
          });
          if (returnValue.length >= max) {
            break;
          }
        }
      }
      return returnValue;

    }
  });

  return Roads;
});
