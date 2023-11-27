"use strict";

let mongoose = require("mongoose");
const LOG_COLLECTION = "log";
const LOG_SCHEMA = new mongoose.Schema({
  personalId: {
    type: String,
    required: false,
  },
  action: {
    type: String,
    required: true,
  },
  registrationDate: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    required: true,
  },
});

let logModel = mongoose.model(LOG_COLLECTION, LOG_SCHEMA, LOG_COLLECTION);
module.exports.LogModel = logModel;

module.exports.createLog = function (newLog) {
  console.log("new log:", newLog);
  return new Promise((resolve, reject) => {
    let newLogData = new logModel({
      personalId: newLog.personalId,
      action: newLog.action,
      registrationDate: newLog.registrationDate,
      error: newLog.error,
    });

    newLogData
      .save()
      .then((activationModel) => {
        return resolve(activationModel);
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

module.exports.findToken = function (personalId) {
  return new Promise((resolve, reject) => {
    logModel
      .find({
        personalId: personalId,
      })
      .then((logs, err) => {
        if (logs !== null) {
          return resolve(logs);
        } else {
          return resolve(err);
        }
      })
      .catch((err) => {
        return reject(err);
      });
  });
};
