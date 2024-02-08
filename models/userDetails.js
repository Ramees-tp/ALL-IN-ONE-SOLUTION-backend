const mongoose = require("mongoose");

const schema = mongoose.Schema;

const userDetails = new schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: String,
  },
});

module.exports = mongoose.model("userDetails", userDetails);
