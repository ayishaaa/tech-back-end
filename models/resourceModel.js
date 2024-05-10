const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const resourceSchema = mongoose.Schema({
  name: { required: true, type: String },
  email: { required: true, type: String, unique: true },
  address: { required: true, type: String },
  qualification: { required: true, type: String },
  phone: { required: true, type: Number },
  role: { required: true, type: String },
  image: { required: true, type: String },
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
