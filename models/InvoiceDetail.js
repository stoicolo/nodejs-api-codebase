"use strict";

let mongoose = require("mongoose");
const INVOICE_DETAIL_COLLECTION = "invoiceDetail";

// Invoice's Details Schema
let InvoiceDetailSchema = mongoose.Schema({
  invoiceId: {
    type: String,
    required: true
  },
  serviceId: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    required: true
  },
  subTotal: {
    type: Number,
    default: 0,
    required: true
  }
});

var InvoiceDetailModel = mongoose.model(
  INVOICE_DETAIL_COLLECTION,
  InvoiceDetailSchema,
  INVOICE_DETAIL_COLLECTION
);

module.exports.createInvoiceDetail = function(newInvoiceDetail, callback) {
  // creating a new Invoice Detail Model obj with already validated req.body data
  let newInvoiceDetailData = new InvoiceDetailModel(newInvoiceDetail);

  newInvoiceDetailData.save(callback);
};

module.exports.getInvoiceByInvoiceId = function(id, callback) {
  InvoiceDetailModel.findById(id, callback);
};
