const express = require("express");
const router = express.Router();
const HR = require("../models/HR");
const upload = require("../middleware/uploadMiddleware");
const {
  createAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
  updateHRApproval,
  getPendingHRs,
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

} = require("../controllers/AdminController");

const checkAdminSession = require("../middleware/checkAdminSession");
// Admin routes
router.post("/create", createAdmin);
router.post("/login", loginAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/my-profile", checkAdminSession, getAdminProfile);
router.put("/my-profile", checkAdminSession, updateAdminProfile);
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid"); // 🧹 Clear session cookie
    res.json({ message: "Logout successful" });
  });
});
// in AdminRoutes.js
router.get("/me", checkAdminSession, (req, res) => {
  res.json(req.session.admin);
});
router.put("/change-password", checkAdminSession, changeAdminPassword);
router.get("/hrs", checkAdminSession, getAllHRs);

// HR approval routes
router.get("/pending-hrs", getPendingHRs);
router.put("/hr-status/:id", updateHRApproval);

router.delete("/hr/:id", checkAdminSession, deleteHR);
router.put("/hr/:id", checkAdminSession, updateHRDetails);
router.get("/hr/:id", checkAdminSession, async (req, res) => {
  try {
    const hr = await HR.findById(req.params.id);
    if (!hr) {
      return res.status(404).json({ message: "HR not found" });
    }
    res.status(200).json(hr); 
  } catch (err) {
    console.error("Error fetching HR by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/hr/:id", checkAdminSession, getSingleHR); // 👈 NEW
router.get("/employees", checkAdminSession, getAllEmployees);
router.get("/employee/:id", checkAdminSession, getEmployeeById);
router.put("/employee/:id", checkAdminSession, updateEmployee);
router.delete("/employee/:id", checkAdminSession, deleteEmployee);

// Employee management routes
router.post("/add-employee", addEmployee);

router.put("/leave-decision/:leaveId", handleLeave);
router.get("/leaves", getAllLeaveRequests);

router.post(
  "/upload-profile-picture",
  checkAdminSession,
  upload.single("profileImage"),
  uploadAdminProfilePicture
);
router.delete(
  "/remove-profile-picture",  
  checkAdminSession,
  removeAdminProfilePicture
);

module.exports = router;
