"use strict";

let mongoose = require("mongoose");
const INVOICE_HEADER_COLLECTION = "invoiceHeader";

// Invoice's Header Schema
let InvoiceHeaderSchema = mongoose.Schema({
  invoiceId: {
    type: String,
    required: true
  },
  registrationDate: {
    type: Date,
    required: true
  },
  status: {
    type: Boolean,
    required: true
  },
  total: {
    type: Number,
    default: 0,
    required: true
  }
});

var InvoiceHeaderModel = mongoose.model(
  INVOICE_HEADER_COLLECTION,
  InvoiceHeaderSchema,
  INVOICE_HEADER_COLLECTION
);

module.exports.createInvoiceHeader = function(newInvoiceHeader, callback) {
  // creating a new Invoice Header Model obj with already validated req.body data
  let newInvoiceHeaderData = new InvoiceHeaderModel(newInvoiceHeader);

  newInvoiceHeaderData.save(callback);
};

module.exports.getInvoiceByInvoiceId = function(id, callback) {
  InvoiceHeaderModel.findById(id, callback);
};
