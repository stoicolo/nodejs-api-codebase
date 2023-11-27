"use strict";

let mongoose = require("mongoose");
const LEGAL_AGREEMENT_HISTORY_COLLECTION = "legalAgreementHistory";

// Legal Agreements History Schema
const LEGAL_AGREEMENT_HISTORY_SCHEMA = new mongoose.Schema({
  legalAgreementId: {
    type: String,
    required: true
  },
  personalId: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: false
  },
  agreed: {
    type: Boolean,
    required: true
  },
  agreementDate: {
    type: Date,
    default: Date.now,
    required: true
  }
});

let LegalAgreementHistoryModel = mongoose.model(
  LEGAL_AGREEMENT_HISTORY_COLLECTION,
  LEGAL_AGREEMENT_HISTORY_SCHEMA
);

module.exports.createLegalAgreement = function(
  newLegalAgreementHistory,
  callback
) {
  LegalAgreementHistoryModel.findOne({
    legalAgreementHistory: newLegalAgreementHistory.legalAgreementHistory
  })
    .then((legalAgreementHistory, err) => {
      if (legalAgreementHistory) {
        err = "This Legal Agreement History was already register.";
        throw err;
      } else {
        // creating a new Legal Agreements History Model obj with already validated req.body data
        let newLegalAgreementHistoryData = new LegalAgreementHistoryModel(
          newLegalAgreementHistory
        );

        if (err) throw err;
        newLegalAgreementHistoryData
          .save()
          .then(LegalAgreementHistoryModel => {
            console.log("Legal Agreement History was register.");
            callback(null, LegalAgreementHistoryModel);
          })
          .catch(err => {
            console.log("Legal Agreement History was not register. ", err);
            callback(null, err);
          });
      }
    })
    .catch(err => {
      console.log("Legal Agreement History was not register. ", err);
      callback(null, err);
    });
};

module.exports.getLegalAgreementsByUserId = function(personalId, callback) {
  // query where personalId matches with an existing personalId
  let query = {
    personalId: personalId
  };
  LegalAgreementHistoryModel.findOne(query, callback);
};
