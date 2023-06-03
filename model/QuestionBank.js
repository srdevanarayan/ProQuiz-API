const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QBSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    creator: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    usersrated: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Number,
      default: 0,
    },

    reported: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("questionbank", QBSchema);
