const mongoose = require('mongoose');

const likedWorkerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User collection
    required: true,
  },
  workerId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker', // Reference to the Worker collection
    required: true,
    unique: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const LikedWorker = mongoose.model('likedWorker', likedWorkerSchema);
module.exports = LikedWorker;

