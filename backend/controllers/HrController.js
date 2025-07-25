const HR = require("../models/HR");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// HR Registration
const registerHR = async (req, res) => {
  const { username, email, phone, department } = req.body;

  if (!username || !email || !phone || !department) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingHR = await HR.findOne({ email });
    if (existingHR) {
      return res.status(409).json({ message: "HR already registered with this email" });
    }

    const newHR = new HR({
      username,
      email,
      phone,
      department,
      isApproved: false,
    });

    await newHR.save();

    res.status(201).json({
      message: "HR registered successfully. Awaiting admin approval.",
      hrId: newHR._id,
    });
  } catch (err) {
    console.error("HR Registration Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// HR Login
const loginHR = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hr = await HR.findOne({ email });
    if (!hr) return res.status(404).json({ message: "HR not found" });

    if (!hr.isApproved) {
      return res.status(403).json({ message: "Your account has not been approved yet." });
    }

    const isMatch = await bcrypt.compare(password, hr.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    req.session.hrId = hr._id;
    res.json({ message: "HR login successful", hrId: hr._id });
  } catch (err) {
    console.error("HR Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// HR Forgot Password
const forgotPasswordHR = async (req, res) => {
  const { email } = req.body;

  try {
    const hr = await HR.findOne({ email });
    if (!hr) return res.status(404).json({ message: "HR not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    hr.resetToken = token;
    hr.resetTokenExpiry = expiry;
    await hr.save();

    const resetUrl = `${FRONTEND_URL}/hr/reset-password/${token}`;

    await transporter.sendMail({
      from: `"ELMS Support" <${EMAIL_USER}>`,
      to: email,
      subject: "HR Password Reset Request",
      text: `Hi ${hr.username},\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\n- ELMS Team`,
    });

    res.json({ message: "Password reset email sent to HR" });
  } catch (err) {
    console.error("HR Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// HR Reset Password
const resetPasswordHR = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const hr = await HR.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!hr) return res.status(400).json({ message: "Invalid or expired reset token" });

    hr.password = await bcrypt.hash(newPassword, 10);
    hr.resetToken = undefined;
    hr.resetTokenExpiry = undefined;

    await hr.save();

    res.json({ message: "Password reset successfully for HR" });
  } catch (err) {
    console.error("HR Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// HR Logout
const logoutHR = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "HR logged out" });
  });
};

// Get HR Profile
const getHRProfile = async (req, res) => {
  const hr = await HR.findById(req.session.hrId).select("-password");
  if (!hr) return res.status(404).json({ message: "HR not found" });
  res.json(hr);
};

// Update HR Profile
const updateHRProfile = async (req, res) => {
  const { username, phone, department, currentPassword, newPassword } = req.body;
  const hr = await HR.findById(req.session.hrId);

  if (!hr) return res.status(404).json({ message: "HR not found" });

  if (newPassword) {
    const isMatch = await bcrypt.compare(currentPassword, hr.password);
    if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });
    hr.password = await bcrypt.hash(newPassword, 10);
  }

  if (username) hr.username = username;
  if (phone) hr.phone = phone;
  if (department) hr.department = department;

  await hr.save();
  res.json({ message: "HR profile updated" });
};

// Get all leave requests
const getHRLeaveRequests = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employee", "username email employeeId");
    res.json(leaves);
  } catch (err) {
    console.error("HR Leave Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch leave requests" });
  }
};

const handleHRLeave = async (req, res) => {
  const { leaveId } = req.params;
  const { action, reason, reviewer } = req.body;

  if (!["Approved", "Rejected"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  try {
    const leave = await Leave.findById(leaveId).populate("employee");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = action;

    // ✅ Use reviewer from request body if provided
    leave.reviewedBy = reviewer || {
      username: req.session?.hr?.username || "Unknown HR",
      role: "HR"
    };

    leave.reviewedAt = new Date();

    if (action === "Rejected" && reason) {
      leave.comment = reason;
    }

    await leave.save();

    let message = `Hi ${leave.employee.username},\n\nYour leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been ${action.toLowerCase()}.`;

    if (action === "Rejected" && reason) {
      message += `\n\nRejection Reason: ${reason}`;
    }

    message += `\n\nReviewed By: ${leave.reviewedBy.username} (${leave.reviewedBy.role})`;
    message += `\nReviewed At: ${leave.reviewedAt.toLocaleString()}`;
    message += `\n\nRegards,\nHR - ELMS Team`;

    await transporter.sendMail({
      from: `"ELMS" <${process.env.EMAIL_USER}>`,
      to: leave.employee.email,
      subject: `Leave Request ${action}`,
      text: message,
    });

    res.json({ message: `Leave ${action.toLowerCase()} and email sent` });
  } catch (err) {
    console.error("HR Leave Decision Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




const hrgetAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const uploadHRProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const hr = await HR.findById(req.session.hrId);
    if (!hr) {
      return res.status(404).json({ message: "HR not found" });
    }

    // Save the relative image path
    hr.profileImage = `/uploads/profile-pictures/${req.file.filename}`;
    await hr.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      image: hr.profileImage,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeHRProfilePicture = async (req, res) => {
  try {
    const hr = await HR.findById(req.session.hrId); // ✅ Use hrId (not hr._id)
    if (!hr) return res.status(404).json({ message: "HR not found" });

    hr.profileImage = undefined;
    await hr.save();

    res.json({ message: "Profile picture removed" });
  } catch (err) {
    console.error("Remove HR profile picture error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = {
  registerHR,
  loginHR,
  forgotPasswordHR,
  resetPasswordHR,
  logoutHR,
  getHRProfile,
  updateHRProfile,
  getHRLeaveRequests,
  handleHRLeave,
  hrgetAllEmployees,
  uploadHRProfilePicture,
  removeHRProfilePicture
};
