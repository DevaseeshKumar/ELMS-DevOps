const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});



const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    if (!employee || !employee.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Save a user object in the session
    req.session.user = {
      _id: employee._id,
      employeeId: employee.employeeId, // "963"
      username: employee.username,
      email: employee.email
    };

    res.status(200).json({
      message: "Login successful",
      employeeId: employee.employeeId  // "963"
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




// ✅ Forgot Password
const forgotPasswordEmployee = async (req, res) => {
  const { email } = req.body;
  try {
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const token = crypto.randomBytes(32).toString("hex");
    employee.resetToken = token;
    employee.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await employee.save();

    const resetUrl = `${FRONTEND_URL}/employee/reset-password/${token}`;
    await transporter.sendMail({
      from: `"ELMS Support" <${EMAIL_USER}>`,
      to: email,
      subject: "Reset your ELMS password",
      text: `Hi ${employee.username},\n\nClick the link to reset your password:\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\n– ELMS Team`
    });

    res.json({ message: "Reset link sent to employee's email." });
  } catch (err) {
    console.error("Employee forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Reset Password
const resetPasswordEmployee = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const employee = await Employee.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!employee) return res.status(400).json({ message: "Invalid or expired token" });

    employee.password = await bcrypt.hash(newPassword, 10);
    employee.resetToken = undefined;
    employee.resetTokenExpiry = undefined;
    await employee.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Employee reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const applyLeave = async (req, res) => {
  const employeeObjectId = req.session.user?._id;

  if (!employeeObjectId) {
    return res.status(401).json({ message: "Session expired. Please login again." });
  }

  const { startDate, endDate, reason, leaveType } = req.body;

  if (!startDate || !endDate || !reason || !leaveType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const leave = new Leave({
      employee: employeeObjectId, // ✅ Use the actual MongoDB ObjectId
      startDate,
      endDate,
      reason,
      leaveType,
      status: "Pending",
    });

    await leave.save();
    res.status(201).json({ message: "Leave applied successfully" });
  } catch (err) {
    console.error("Apply Leave Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




const getLoggedInEmployee = (req, res) => {
  if (req.session.user) {
    return res.json({
      employeeId: req.session.user.employeeId,  // "963"
      username: req.session.user.username,
      email: req.session.user.email
    });
  } else {
    return res.status(401).json({ message: "Not logged in" });
  }
};


const getMyLeaves = async (req, res) => {
  if (!req.session.user || !req.session.user._id) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const leaves = await Leave.find({ employee: req.session.user._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error("Error fetching employee leaves:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// View Profile
const getMyProfile = async (req, res) => {
  if (!req.session.user || !req.session.user._id) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const employee = await Employee.findById(req.session.user._id).select("-password -resetToken -resetTokenExpiry");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Profile
const updateMyProfile = async (req, res) => {
  if (!req.session.user || !req.session.user._id) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const updates = req.body;

  try {
    const employee = await Employee.findByIdAndUpdate(
      req.session.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password -resetToken -resetTokenExpiry");

    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.json({ message: "Profile updated successfully", employee });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const uploadEmployeeProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const employee = await Employee.findById(req.session.user._id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.profileImage = `/uploads/profile-pictures/${req.file.filename}`;
    await employee.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      image: employee.profileImage,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const removeEmployeeProfilePicture = async (req, res) => {
  try {
    const employee = await Employee.findById(req.session.user._id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    employee.profileImage = undefined;
    await employee.save();

    res.json({ message: "Profile picture removed" });
  } catch (err) {
    console.error("Remove profile picture error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
    loginEmployee,
  forgotPasswordEmployee,
  resetPasswordEmployee,
  applyLeave,
  getLoggedInEmployee,
  getMyLeaves,
  getMyProfile,
  updateMyProfile,
  uploadEmployeeProfilePicture,
  removeEmployeeProfilePicture
};
