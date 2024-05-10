const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const bannerSchema = mongoose.Schema({
    title: { required: true, type: String },
    image: { required: true, type: String },
    targeturl: { required: true, type: String },
    status: { required: true, type: String },
  });
  
  const Banner = mongoose.model('Banner', bannerSchema);
  
  module.exports = Banner;
  
