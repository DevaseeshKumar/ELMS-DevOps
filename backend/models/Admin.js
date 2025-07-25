const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
  type: String,
  default: "", // Will hold uploaded image URL or empty for default avatar
},
  
  resetToken: String,
  resetTokenExpiry: Date
}, { timestamps: true });


module.exports = mongoose.model("Admin", adminSchema);
