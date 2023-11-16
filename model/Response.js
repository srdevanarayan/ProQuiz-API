const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const responseSchema = new Schema(
  {
    quizid: {
      type: String,
      required: true,
    },
    quiztaker: {
      type: String,
      required: true,
    },
    responses: {
      type: Map,
      of: String,
      default: {},
    },
    starttime: {
      type: Date,
    },
    score: {
      type: Number,
      default: -99,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("response", responseSchema);
