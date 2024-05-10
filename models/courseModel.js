const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const courseSchema = mongoose.Schema({
    name: { required: true, type: String },
    banner: { required: true, type: String, unique: true },
    description: { required: true, type: String },
    duration: { required: true, type: String },
    syllabus: { required: true, type: String },
    price: { required: true, type: Number },
    offerprice: { required: true, type: Number },
    status: { required: true, type: String },
    resource: [{ type: String }],
    icon: { required: true, type: String },
  });
  
  const Course = mongoose.model('Course', courseSchema);
  
  module.exports = Course;
  
