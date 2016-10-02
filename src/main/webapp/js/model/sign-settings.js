define([ 'model/base-model' ], function() {

  "use strict";
  var BaseModel = require('model/base-model');

  var SignSettings = BaseModel.extend({
    name : 'sign-settings',
    url : 'app/sign-settings'
  });

  return SignSettings;
});