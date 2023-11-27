"use strict";

let mongoose = require("mongoose");
const RATING_HISTORY_COLLECTION = "ratingHistory";

// Rating History Schema
let RatingHistorySchema = mongoose.Schema({
  appointmentId: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  patientId: {
    type: String,
    required: true
  },
  respondentType: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: false
  },
  registrationDate: {
    type: Date,
    default: Date.now,
    required: true
  }
});

var RatingHistoryModel = mongoose.model(
  RATING_HISTORY_COLLECTION,
  RatingHistorySchema,
  RATING_HISTORY_COLLECTION
);

module.exports.createRatingHistory = function(newDoctorService, callback) {
  // creating a new Rating History Model obj with already validated req.body data
  let newRatingHistoryData = new RatingHistoryModel(newDoctorService);

  newRatingHistoryData.save(callback);
};

module.exports.getRatingByUserId = function(id, callback) {
  RatingHistoryModel.findById(id, callback);
};
