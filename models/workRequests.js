const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'workerDetails',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDetails',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  coordinates: {
    type: [Number],
    index: '2dsphere',
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  payment: {
    type: Boolean,
    default: false,
  },
  orderId: {
    type: String,
  },
  paymentId: {
    type: String,
  },
  secretcode: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  wage: {
    type: Number,
    required: true,
  },
  gotWage: {
    type: Boolean,
  },
});

module.exports = mongoose.model('workRequests', requestSchema);
