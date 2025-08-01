const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  leaveType: {
    type: String,
    enum: ["Earned Leave", "Sick Leave", "Casual Leave"],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },

  // ✅ Geo-location from browser
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  },

  // ✅ IP Address from request
  ipAddress: {
    type: String,
    default: null,
  },

  // Optional city/location (resolved from coordinates or IP)
  locationName: {
    type: String,
    default: null,
  },

  // Metadata
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.Mixed, // Could include { name, role }
    default: null,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
  comment: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Leave", leaveSchema);
