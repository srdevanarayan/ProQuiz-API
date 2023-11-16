const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    quizid: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("quizquestion", QuestionSchema);
