const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizCodeSchema = new Schema({
  code: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("quizcode", QuizCodeSchema);
