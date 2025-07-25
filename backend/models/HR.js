const mongoose = require("mongoose");

const hrSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: {
  type: String,
  required: false
},
profileImage: {
  type: String,
  default: "", // Will hold uploaded image URL or empty for default avatar
},
  phone: String,
  department: String,
  isApproved: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpiry: Date,
});

module.exports = mongoose.model("HR", hrSchema);
