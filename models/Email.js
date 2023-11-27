"use strict";

let mongoose = require("mongoose");
const EMAIL_COLLECTION = "email";
const EMAIL_SCHEMA = new mongoose.Schema({
  personalId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

let emailModel = mongoose.model(
  EMAIL_COLLECTION,
  EMAIL_SCHEMA,
  EMAIL_COLLECTION
);
module.exports.EmailModel = emailModel;

module.exports.createEmail = function(newUserEmail) {
  return new Promise((resolve, reject) => {
    emailModel
      .findOne({
        email: newUserEmail.email
      })
      .then((email, err) => {
        if (email) {
          err =
            "Another User was already register with this email: " +
            newUserEmail.email;
          throw err;
        } else {
          // creating a new Email Model obj with already validated req.body data
          let newEmailData = new emailModel(newUserEmail);

          if (err) throw err;
          newEmailData
            .save()
            .then(emailModel => {
              return resolve(emailModel);
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

module.exports.findByEmail = function(email) {
  return new Promise((resolve, reject) => {
    emailModel
      .findOne({
        email: email
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

module.exports.getUserEmailByPersonalId = function(personalId, callback) {
  // query where personalId matches with an existing personalId
  let query = {
    personalId: personalId
  };

  return new Promise((resolve, reject) => {
    emailModel.findOne(query)
      .then((result, err) => {
        if (result) {
          return resolve(result);
        } else {
          return resolve(err);
        }
      })
      .catch(err => {
        return reject(err);
      });
  });
};
