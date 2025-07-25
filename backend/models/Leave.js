const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  leaveType: {
  type: String,
  enum: ["Earned Leave", "Sick Leave", "Casual Leave"],
  required: true
},
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },

  // Metadata fields
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
  type: mongoose.Schema.Types.Mixed, // could be { username, role }
  default: null,
},
reviewedAt: {
  type: Date,
  default: null,
},
  comment: {
    type: String,
    default: "" // Comment on rejection or notes
  }
});

module.exports = mongoose.model("Leave", leaveSchema);
