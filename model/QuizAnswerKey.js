const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizAnswerKeySchema = new Schema({
  qid: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  quizid: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("quizanswerkey", QuizAnswerKeySchema);
