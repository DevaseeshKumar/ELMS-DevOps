const Admin = require("../models/Admin");
const HR = require("../models/HR");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// ✅ Create Admin
const createAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(409).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, email, password: hashedPassword });
    await newAdmin.save();

    await transporter.sendMail({
      from: `"ELMS Support" <${EMAIL_USER}>`,
      to: email,
      subject: "Admin Registration Successful",
      text: `Hi ${username},\n\nYour admin account is ready.\nLogin here: ${FRONTEND_URL}/login\n\n- ELMS`
    });

    res.status(201).json({ message: "Admin created and email sent", adminId: newAdmin._id });
  } catch (err) {
    console.error("Create Admin Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin Login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Save in session
  req.session.admin = {
    _id: admin._id,
    username: admin.username,
    email: admin.email,
  };

  res.json({ message: "Login successful" });
};

// ✅ Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const token = crypto.randomBytes(32).toString("hex");
    admin.resetToken = token;
    admin.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await admin.save();

    const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
    await transporter.sendMail({
      from: `"ELMS Support" <${EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      text: `Click to reset: ${resetUrl}\nValid for 15 minutes.`
    });

    res.json({ message: "Reset email sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Reset Password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const admin = await Admin.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!admin)
      return res.status(400).json({ message: "Invalid or expired token" });

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;
    await admin.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Pending HRs
const getPendingHRs = async (req, res) => {
  try {
    const hrs = await HR.find({ isApproved: false });
    res.json(hrs);
  } catch (err) {
    console.error("Fetch pending HRs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateHRApproval = async (req, res) => {
  const { id } = req.params;
  const { approve } = req.body;

  try {
    const hr = await HR.findById(id);
    if (!hr) return res.status(404).json({ message: "HR not found" });

    if (approve) {
      hr.isApproved = true;

      const token = crypto.randomBytes(32).toString("hex");
      hr.resetToken = token;
      hr.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

      const resetUrl = `${FRONTEND_URL}/hr/reset-password/${token}`;

      await transporter.sendMail({
        from: `"ELMS Support" <${EMAIL_USER}>`,
        to: hr.email,
        subject: "Set Your Password to Activate Your HR Account",
        text: `Hi ${hr.username},\n\nYour HR account has been approved!\nSet your password here: ${resetUrl}\n\nThis link expires in 15 minutes.\n\n- ELMS Team`,
      });

      await hr.save(); // ✅ Save only if approved
    } else {
      await transporter.sendMail({
        from: `"ELMS Support" <${EMAIL_USER}>`,
        to: hr.email,
        subject: "HR Registration Rejected",
        text: `Hi ${hr.username},\n\nWe regret to inform you that your HR registration was rejected.\n\n- ELMS Team`,
      });

      await HR.findByIdAndDelete(id); // ✅ Delete rejected HR from DB
    }

    res.json({
      message: `HR ${approve ? "approved and password setup link sent" : "rejected and notified"}`,
    });
  } catch (err) {
    console.error("Update HR status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add employee and send set-password email
const addEmployee = async (req, res) => {
  const { username, employeeId, email, phone, gender, department } = req.body;

  if (!username || !employeeId || !email || !phone || !gender || !department) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Employee already exists with this email" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 15 * 60 * 1000; // 15 mins

    const newEmp = new Employee({
      username,
      employeeId,
      email,
      phone,
      gender,
      department,
      resetToken: token,
      resetTokenExpiry: expiry
    });

    await newEmp.save();

    const resetUrl = `${FRONTEND_URL}/employee/reset-password/${token}`;

    await transporter.sendMail({
      from: `"ELMS Admin" <${EMAIL_USER}>`,
      to: email,
      subject: "You've been added to ELMS!",
      text: `Hi ${username},\n\nYou've been added to ELMS. Click the link below to set your password and login:\n${resetUrl}\n\nThis link expires in 15 minutes.\n\n- ELMS Team`
    });

    res.status(201).json({ message: "Employee added and email sent" });
  } catch (err) {
    console.error("Add Employee Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const handleLeave = async (req, res) => {
  const { leaveId } = req.params;
  const { action, reason } = req.body;

  if (!["Approved", "Rejected"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  try {
    const leave = await Leave.findById(leaveId).populate("employee");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // ✅ Set status
    leave.status = action;

    // ✅ Add reviewedBy and reviewedAt
    if (req.session?.admin?.username) {
      leave.reviewedBy = {
  username: req.session.admin.username,
  role: "Admin"
};
    } else {
      leave.reviewedBy = "Admin"; // fallback
    }
    leave.reviewedAt = new Date();

    // ✅ Optional: add rejection comment
    if (action === "Rejected" && reason) {
      leave.comment = reason;
    }

    await leave.save();

    let emailText = `Hi ${leave.employee.username},\n\nYour leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been ${action.toLowerCase()}.`;

    if (action === "Rejected" && reason) {
      emailText += `\n\nRejection Reason: ${reason}`;
    }

    emailText += `\n\nReviewed By: ${leave.reviewedBy}`;
    emailText += `\nReviewed At: ${leave.reviewedAt.toLocaleString()}`;
    emailText += `\n\nRegards,\nELMS Team`;

    await transporter.sendMail({
      from: `"ELMS" <${process.env.EMAIL_USER}>`,
      to: leave.employee.email,
      subject: `Leave Request ${action}`,
      text: emailText,
    });

    res.json({ message: `Leave ${action.toLowerCase()} and email sent` });
  } catch (err) {
    console.error("Leave Decision Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get all leave requests
const getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employee", "username email employeeId");
    res.json(leaves);
  } catch (err) {
    console.error("Error fetching leave requests:", err);
    res.status(500).json({ message: "Failed to fetch leave requests" });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.session.admin._id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (err) {
    console.error("Get admin profile error:", err);
    res.status(500).json({ message: "Failed to load admin profile" });
  }
};


const updateAdminProfile = async (req, res) => {
  try {
    const { username, phone } = req.body;
    await Admin.findByIdAndUpdate(req.session.admin._id, { username, phone });
    res.json({ message: "Profile updated successfully" });
  } catch {
    res.status(500).json({ message: "Failed to update profile" });
  }
};
// ✅ Change password (must be logged in)
const changeAdminPassword = async (req, res) => {
  const adminId = req.session.admin?._id;
  const { currentPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ Controller function to get all HRs
const getAllHRs = async (req, res) => {
  try {
    const hrs = await HR.find();
    res.status(200).json(hrs);
  } catch (error) {
    console.error("Error fetching HRs:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// DELETE HR
const deleteHR = async (req, res) => {
  try {
    const hr = await HR.findByIdAndDelete(req.params.id);
    if (!hr) return res.status(404).json({ message: "HR not found" });
    res.json({ message: "HR deleted successfully" });
  } catch (err) {
    console.error("Delete HR error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE HR
const updateHRDetails = async (req, res) => {
  try {
    const { username, email, phone, department } = req.body;

    const hr = await HR.findByIdAndUpdate(
      req.params.id,
      { username, email, phone, department },
      { new: true }
    );

    if (!hr) return res.status(404).json({ message: "HR not found" });

    res.json({ message: "HR updated successfully", hr });
  } catch (err) {
    console.error("Update HR error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getSingleHR = async (req, res) => {
  try {
    const hr = await HR.findById(req.params.id);
    if (!hr) return res.status(404).json({ message: "HR not found" });
    res.json(hr);
  } catch (err) {
    console.error("Fetch HR error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    console.error("Error fetching employee by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE employee
const updateEmployee = async (req, res) => {
  try {
    const { username, email, phone, department, gender } = req.body;
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { username, email, phone, department, gender },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee updated successfully", employee: updated });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE employee
const deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const uploadAdminProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const admin = await Admin.findById(req.session.admin?._id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.profileImage = `/uploads/profile-pictures/${req.file.filename}`;
    await admin.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      image: admin.profileImage,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeAdminProfilePicture = async (req, res) => {
  try {
    const admin = await Admin.findById(req.session.admin._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.profileImage = undefined;
    await admin.save();

    res.json({ message: "Profile picture removed" });
  } catch (err) {
    console.error("Remove profile picture error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  createAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
  getPendingHRs,
  updateHRApproval,
  addEmployee,
  handleLeave,
  getAllLeaveRequests,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAllHRs,
  deleteHR,
  updateHRDetails,
  getSingleHR,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  uploadAdminProfilePicture,
  removeAdminProfilePicture,
};
