const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnswerKeySchema = new Schema({
  qid: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("answerkey", AnswerKeySchema);
