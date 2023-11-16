const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const approvalSchema = new Schema({
  quizid: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "open",
  },
  requested: {
    type: [String],
    default: [],
  },
  blocked: {
    type: [String],
    default: [],
  },
  approved: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("approvallist", approvalSchema);
