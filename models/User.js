const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define user schema
const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Create user model
const User = mongoose.model('User', userSchema);

module.exports = User;
