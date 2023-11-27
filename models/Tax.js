"use strict";

let mongoose = require("mongoose");
const TAX_COLLECTION = "tax";

// Invoice's Taxes Schema
let TaxSchema = mongoose.Schema({
  taxId: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    required: true
  },
  taxPrayerType: {
    type: String,
    required: true
  },
  tax: {
    type: Number,
    default: 0,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

var TaxModel = mongoose.model(TAX_COLLECTION, TaxSchema, TAX_COLLECTION);

module.exports.createTax = function(newTax, callback) {
  // creating a new Invoice's Taxes Model obj with already validated req.body data
  let newTaxData = new TaxModel(newTax);

  newTaxData.save(callback);
};

module.exports.getTaxes = function(callback) {
  TaxModel.find(callback);
};
