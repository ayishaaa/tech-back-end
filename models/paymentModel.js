const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const paymentSchema = mongoose.Schema({
  studentid: { required: true, type: String },
  date: { required: true, type: String },
  amount: { required: true, type: String },
  method: { required: true, type: String },
  comment: { type: String },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
