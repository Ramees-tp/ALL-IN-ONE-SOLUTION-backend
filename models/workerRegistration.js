const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workerRegistration = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  pinCode: {
    type: Number,
    required: true,
  },
  profileImage: {
    type: String,
  },
  jobType: {
    type: String,
    required: true,
  },
  workArea: {
    type: String,
    required: true,
  },
  adharNumber: {
    type: Number,
    required: true,
  },
  IFC: {
    type: Number,
    required: true,
  },
  accountNumber: {
    type: Number,
    required: true,
  },
  panCardNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  coordinates: {
    type: [Number],
    index: '2dsphere',
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isHalfDay: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('workerDetails', workerRegistration);
