"use strict";

let mongoose = require("mongoose");
const PHONE_COLLECTION = "phone";
const PHONE_SCHEMA = new mongoose.Schema({
  personalId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  }
});

let phoneModel = mongoose.model(
  PHONE_COLLECTION,
  PHONE_SCHEMA,
  PHONE_COLLECTION
);
module.exports.PhoneModel = phoneModel;

module.exports.createPhone = function(newUserPhone) {
  return new Promise((resolve, reject) => {
    phoneModel
      .findOne({
        phoneNumber: newUserPhone.phoneNumber
      })
      .then((phone, err) => {
        if (phone) {
          err =
            "Another User was already register with this phone number: " +
            newUserPhone.phoneNumber;
          throw err;
        } else {
          // creating a new Phone Model obj with already validated req.body data
          let newPhoneData = new phoneModel(newUserPhone);

          if (err) throw err;
          newPhoneData
            .save()
            .then(phoneModel => {
              return resolve(phoneModel);
            })
            .catch(err => {
              return reject(err);
            });
        }
      })
      .catch(err => {
        return reject(err);
      });
  });
};

module.exports.findByPhone = function(phoneNumber) {
  return new Promise((resolve, reject) => {
    phoneModel
      .findOne({
        phoneNumber: phoneNumber
      })
      .then((user, err) => {
        if (user !== null) {
          return resolve(user);
        } else {
          return resolve(err);
        }
      })
      .catch(err => {
        return reject(err);
      });
  });
};

module.exports.findPhoneByPersonalId = function(personalId) {
  return new Promise((resolve, reject) => {
    phoneModel
      .findOne({
        personalId: personalId
      })
      .then((phone, err) => {
        if (phone !== null) {
          return resolve(phone);
        } else {
          return resolve(err);
        }
      })
      .catch(err => {
        return reject(err);
      });
  });
};
