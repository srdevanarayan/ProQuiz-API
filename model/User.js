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
    type: Number,
    default: 2001,
  },
  password: {
    type: String,
    required: true,
  },

  refreshToken: String,
});

module.exports = mongoose.model("User", userSchema);
