const mongoose = require("mongoose");

const schema = mongoose.Schema;

const userOTP = new schema({
  email: {
    type: String,
    required: true,
  },
  OTP: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("userOTP", userOTP);


