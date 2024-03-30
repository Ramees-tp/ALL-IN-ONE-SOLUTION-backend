const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AdminAuth = new Schema({
  mastername: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('adminauth', AdminAuth);
