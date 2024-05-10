const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const studentSchema = mongoose.Schema({
  image: { type: String },
  fullname: { required: true, type: String },
  mobile: { required: true, type: String },
  dob: { required: true, type: Date },
  gender: { required: true, type: String },
  maritalstatus: { type: String },
  guardianname: { required: true, type: String },
  guardianmob: { required: true, type: String },
  spousename: { type: String },
  spousemob: { type: String },
  address: { type: String },
  postoffice: { type: String },
  district: { type: String },
  state: { type: String },
  country: { type: String },
  email: { required: true, type: String },
  identity: { type: String },
  passimg: { type: String },
  docimg: { type: String },
  highqual: { type: String },
  institutename: { type: String },
  mark: { type: String },
  course: { required: true, type: String },
  coursefee: { type: String },
  noofinst: { type: String },
  billdate: { type: String },
  batch: { required: true, type: String },
  feestatus: { required: true, type: String },
  paymentstatus: { type: String },
  paymentmethod: { type: String },
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
