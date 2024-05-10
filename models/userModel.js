const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
  email: { required: true, type: String, unique: true },
  password: { required: true, type: String },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    // Only hash the password if it's not already hashed
    if (!this.password.startsWith('$2b$')) {
      try {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
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

const User = mongoose.model('User', userSchema);

module.exports = User;
