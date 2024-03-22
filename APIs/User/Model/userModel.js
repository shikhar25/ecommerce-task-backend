const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  userPassword: {
    type: String,
    required: true,
  },
  userWallet: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Users = mongoose.model("Users", usersSchema);

module.exports = Users;
