"use strict";

let mongoose = require("mongoose");
const SETTING_COLLECTION = "setting";

// User Settings Schema
const SETTING_SCHEMA = new mongoose.Schema({
  settingId: {
    type: String,
    required: true
  },
  personalId: {
    type: String,
    required: true
  },
  lenguage: {
    type: String,
    required: true
  },
  countryPhoneExt: {
    type: Number,
    required: true
  },
  businessName: {
    type: String,
    required: false
  },
  businessAddress: {
    type: String,
    required: false
  },
  invoiceInitNumber: {
    type: Number,
    required: false
  }
});

let SettingModel = mongoose.model(SETTING_COLLECTION, SETTING_SCHEMA);

module.exports.createSetting = function(newSetting, callback) {
  SettingModel.findOne({
    setting: newSetting.setting
  })
    .then((setting, err) => {
      if (setting) {
        err = "Another User was already register with this setting.";
        throw err;
      } else {
        // creating a new User Settings Model obj with already validated req.body data
        let newSettingData = new SettingModel(newSetting);

        if (err) throw err;
        newSettingData
          .save()
          .then(SettingModel => {
            console.log("User setting was register.");
            callback(null, SettingModel);
          })
          .catch(err => {
            console.log("User setting was not register. ", err);
            callback(null, err);
          });
      }
    })
    .catch(err => {
      console.log("User setting was not register. ", err);
      callback(null, err);
    });
};

module.exports.getUserSettingByUserId = function(personalId, callback) {
  // query where personalId matches with an existing personalId
  let query = {
    personalId: personalId
  };
  SettingModel.findOne(query, callback);
};
