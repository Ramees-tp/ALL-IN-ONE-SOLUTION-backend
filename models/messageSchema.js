
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const messages = new Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
  },
  receiver: {
    type: String,
  },
  requestId: {
    type: String,
  },
});

module.exports = mongoose.model('messages', messages);
