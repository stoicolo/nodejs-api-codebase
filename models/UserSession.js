"use strict";

let mongoose = require("mongoose");
let jwt = require("jsonwebtoken");
let moment = require("moment");
const USER_SESSION_COLLECTION = "userSession";
const USER_SESSION_SCHEMA = new mongoose.Schema({
  personalId: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  registrationDate: {
    type: String,
    required: true
  }
});
let userSessionModel = mongoose.model(
  USER_SESSION_COLLECTION,
  USER_SESSION_SCHEMA,
  USER_SESSION_COLLECTION
);

module.exports.userSessionModel = userSessionModel;

/**
 * configure, creates, and registers a new token session with user data.
 * @param  {} newActivation
 */
module.exports.addSession = function(newActivation) {
  return new Promise((resolve, reject) => {
    let create_Token = async () => {
      return this.createToken(newActivation);
    };
    create_Token()
      .then(response => {
        const newToken = response;
        let today = moment().format("MM/DD/YYYY HH:mm");
        let newActivationData = new userSessionModel({
          personalId: newActivation.personalId,
          token: newToken,
          registrationDate: today
        });

        newActivationData
          .save()
          .then(userSessionModel => {
            return resolve(userSessionModel);
          })
          .catch(err => {
            return reject(err);
          });
      })
      .catch(err => {
        return reject(err);
      });
  });
};

/**
 * finds all active session of any user by its personal Id.
 * @param  {} userData
 */
module.exports.findSessionByPersonalId = userData => {
  return new Promise((resolve, reject) => {
    userSessionModel
      .findOne({
        personalId: userData.personalId
      })
      .then((response, err) => {
        if (response == null) {
          return resolve(null);
        } else {
          return resolve(response);
        }
      })
      .catch(err => {
        return reject(err);
      });
  });
};

/**
 * Deletes all sessions documents related to a specific personalId.
 * personalId is within activation paramenter of type object.
 * @param  {} personalId
 */
module.exports.deleteSession = personalId => {
  return new Promise((resolve, reject) => {
    userSessionModel
      .deleteMany(
        {
          personalId: personalId
        },
        (err) => {
          if (err) {
            return resolve(false);
          } else {
            return resolve(true);
          }
        }
      )
      .catch(err => {
        return reject(err);
      });
  });
};

/**
 * Creates a new Token document following Token Model obj structure with already validated email data. 
 * Also, token expires in 1h, it will be a 1h session..
 * @param  {} personalId
 */
module.exports.createToken = payload => {
  return new Promise((resolve, reject) => {
    try {
      return resolve(
        jwt.sign(payload, "drbookincostarica2018", { expiresIn: "30m" })
      );
    } catch (error) {
      return reject(error);
    }
  });
};
