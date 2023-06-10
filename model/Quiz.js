const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizSchema = new Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      default: "custom",
    },
    name: {
      type: String,
      required: true,
    },
    quizmaker: {
      type: String,
      required: true,
    },
    questions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      default: "new",
    },
    timer: {
      type: Number,
      default: 0,
    },
    approvalrequired: {
      type: Boolean,
      default: true,
    },
    participants: {
      type: Number,
      default: 0,
    },
    responses: {
      type: Number,
      default: 0,
    },
    responsesarray: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("quiz", QuizSchema);
