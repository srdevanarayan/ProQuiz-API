const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "unverified",
  },
  roles: {
    User: {
      type: Number,
      default: 2001,
    },
    Expert: Number,
    Admin: Number,
  },
  password: {
    type: String,
    required: true,
  },
  rated: {
    type: [String],
    default: [],
  },
  reported: {
    type: [String],
    default: [],
  },
  verified: {
    type: [String],
    default: [],
  },
  contributed: {
    type: [String],
    default: [],
  },
  customquizcreated: {
    type: [String],
    default: [],
  },
  generalquizcreated: {
    type: [String],
    default: [],
  },
  customquizanswered: {
    type: [String],
    default: [],
  },
  generalquizanswered: {
    type: [String],
    default: [],
  },
  quiztobecompleted: {
    type: [String],
    default: [],
  },

  refreshToken: String,
});

module.exports = mongoose.model("User", userSchema);
