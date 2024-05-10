const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const adminSchema = mongoose.Schema({
  name: { required: true, type: String },
  username: { required: true, type: String, unique: true },
  password: { required: true, type: String },
  email: { required: true, type: String, unique: true },
  address: { type: String },
  country: { type: String },
  state: { type: String },
  phone: { required: true, type: Number },
  role: { required: true, type: String },
  status: { required: true, type: String },
  image: { required: true, type: String },
  description: { type: String },
  token: { type: String }
});

adminSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    if (!this.password.startsWith('$2b$')) {
      try {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;

        if (this.isNew) {
          const token = jwt.sign({ username: this.username }, 'myjwtsecretkey');
          this.token = token;
      }
        next();
      } catch (error) {
        return next(error);
      }
    } else {
      return next();
    }
  } else {
    return next();
  }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
