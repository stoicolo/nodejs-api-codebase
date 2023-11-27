"use strict";

let mongoose = require("mongoose");
const ADDRESS_COLLECTION = "address";

// Address Schema
let DoctorAddressSchema = mongoose.Schema({
  personalId: {
    type: String,
    required: true
  },
  addressId: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  canton: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  description: {
    type: Number,
    required: false
  },
  coordinates: {
    type: Date,
    required: false
  }
});

var AddressModel = mongoose.model(
  ADDRESS_COLLECTION,
  DoctorAddressSchema,
  ADDRESS_COLLECTION
);

module.exports.createAddress = function(newAddress, callback) {
  // creating a new Address Model obj with already validated req.body data
  let newAddressData = new AddressModel(newAddress);

  newAddressData.save(callback);
};

module.exports.getAddressByUserId = function(id, callback) {
  AddressModel.findById(id, callback);
};
