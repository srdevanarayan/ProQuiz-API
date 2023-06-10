const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QBQuestionHistorySchema = new Schema({
  quiztaker: {
    type: String,
    required: true,
  },
  qidhistory: {
    type: Map,
    of: [String],
  },
});

module.exports = mongoose.model("qbquestionhistory", QBQuestionHistorySchema);
