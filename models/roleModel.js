const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const roleSchema = mongoose.Schema({
  role: { required: true, type: String, unique: true },
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
