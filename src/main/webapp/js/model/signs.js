define([ 'model/base-model' ], function() {

  "use strict";
  var BaseModel = require('model/base-model');

  var Signs = BaseModel.extend({
    name : 'signs',
    url : 'app/signs?v=3.9',
    getData : function(signId) {
      var sign = this.getGroupIdMap()[signId].data;
      return {
        type : sign.type,
        time : sign.time,
        gid : sign.gid
      };
    },
    getRoadId : function(signId) {
      return this.getGantry(signId).road;
    },
    getGantryById : function(gantryId) {
      return this.attributes.content[gantryId];
    },
    getGantry : function(signId) {
      var gantryId = this.getGroupIdMap()[signId].id;
      return this.attributes.content[gantryId];
    },
    getGroupIdMap : function() {
      if (this.groupIdMap) {
      return this.groupIdMap;
      }

      var groupIndex, eachGroup, groupLength;
      var contentIndex, contentLength;
      var content = this.attributes.content;
      var group;
      var groupIdMap = {};
      for (contentIndex = 0, contentLength = content.length; contentIndex < contentLength; contentIndex++) {

      group = content[contentIndex].group;
      for (groupIndex = 0, groupLength = group.length; groupIndex < groupLength; groupIndex++) {
      eachGroup = group[groupIndex];
      /** quick map from sign ID to which group it is in */
      groupIdMap[eachGroup.id] = {
        id : contentIndex,
        data : eachGroup
      };
      }
      }
      this.groupIdMap = groupIdMap;
      return this.groupIdMap;
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
      var gantries = this.attributes.content;
      var gantryIndex, gantriesLength;
      var group, sign, signIndex, groupLength;
      var text;
      for (gantryIndex = 0, gantriesLength = gantries.length; gantryIndex < gantriesLength; gantryIndex++) {
      group = gantries[gantryIndex].group;
      for (signIndex = 0, groupLength = group.length; signIndex < groupLength; signIndex++) {
      sign = group[signIndex];
      text = sign.gid.toLowerCase();
      if (sign.value instanceof Array) {
      text = text + "," + sign.value.join(",").toLowerCase();
      } else if (typeof sign.value === 'string') {
      text = text + "," + sign.value.toLowerCase();
      }
      textIndex.push({
        id : sign.id,
        text : text
      });
      }
      }
      this.textIndex = textIndex;
      }
      return this.textIndex;
    },
    search : function(str, max) {
      if (!this.isLoaded()) {
      return [];
      }
      var strLower = str.toLowerCase();
      var returnValue = [];
      var data = this.getTextIndex();
      var i, datum, length;
      var signData;
      var summary;
      for (i = 0, length = data.length; i < length; i++) {
      datum = data[i];
      if (datum.text.indexOf(strLower) != -1) {
      signData = this.getGroupIdMap()[datum.id].data;
      summary = signData.gid + " " + signData.type;
      if (signData.value instanceof Array) {
      summary = summary + ": " + signData.value.join(",");
      } else if (typeof signData.value === 'string') {
      summary = summary + ": " + signData.value;
      }
      returnValue.push({
        type : signData.w > 0 ? 'vms' : 'signal',
        id : datum.id,
        summary : summary
      });
      if (returnValue.length >= max) {
      break;
      }
      }
      }
      return returnValue;

    },
    getLocation : function(signId) {
      var path = this.getGantry(signId).g;
      var decoded = google.maps.geometry.encoding.decodePath(path);
      return new google.maps.LatLng((decoded[0].lat() + decoded[1].lat()) / 2, (decoded[0].lng() + decoded[1].lng()) / 2);
    },
    getBaseLocation : function(signId) {
      var path = this.getGantry(signId).g;
      var decoded = google.maps.geometry.encoding.decodePath(path);
      return decoded[0];
    }
  });

  return Signs;
});