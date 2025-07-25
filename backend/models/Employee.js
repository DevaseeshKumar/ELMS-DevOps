const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  username: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  department: { type: String, required: true },
  profileImage: {
    type: String,
    default: "",
  },
  password: { type: String },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },

  // Yearly quota (optional for reference)
  totalLeavesPerYear: { type: Number, default: 20 },
  approvedLeavesCount: { type: Number, default: 0 },
  unapprovedLeavesCount: { type: Number, default: 0 },
  remainingLeaves: { type: Number, default: 20 },

  // Leave balance tracking with pending count
  leaveBalance: {
    earned: {
      taken: { type: Number, default: 0 },
      pending: { type: Number, default: 0 }
    },
    sick: {
      taken: { type: Number, default: 0 },
      pending: { type: Number, default: 0 }
    },
    casual: {
      taken: { type: Number, default: 0 },
      pending: { type: Number, default: 0 }
    }
  }
});

module.exports = mongoose.model("Employee", employeeSchema);
