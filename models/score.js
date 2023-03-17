const mongoose = require("mongoose");
const Schema = mongoose.Schema; 

const scoresSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  score: {
    type: Number,
    required: true
  }
});

const Score = mongoose.model('Scores', scoresSchema);
module.exports = Score;
