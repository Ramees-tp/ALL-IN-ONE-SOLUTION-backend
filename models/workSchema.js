const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const workDetails= new Schema({
  jobName: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  wage: {
    type: Number,
    required: true,
  },
  jobImage: {
    type: String,
  },
});

module.exports = mongoose.model('jobDetails', workDetails);
