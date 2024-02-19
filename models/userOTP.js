const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userOTP = new Schema({
  email: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  OTP: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('userOTP', userOTP);
