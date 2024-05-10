const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const batchSchema = mongoose.Schema({
  batchname: { required: true, type: String },
  startdate: { required: true, type: Date },
  enddate: { required: true, type: Date },
  timing: { required: true, type: String },
  course: { required: true, type: String },
});

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
