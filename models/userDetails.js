const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userDetails = new Schema({
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

module.exports = mongoose.model('userDetails', userDetails);
