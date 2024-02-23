const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userMoreDetails = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  DOB: {
    type: String,
    required: true,
  },

  street: { type: String, required: true },
  district: { type: String, required: true },
  pinCode: { type: String, required: true },

  photo: {
    type: String,
  },
});

module.exports = mongoose.model("userMoreDetails", userMoreDetails);