// routes/EmployeeRoutes.js
const express = require("express");

const upload = require("../middleware/uploadMiddleware");
const router = express.Router();
const {
  loginEmployee,
  forgotPasswordEmployee,
  resetPasswordEmployee,
  applyLeave,
  getLoggedInEmployee,
  getMyLeaves,
  getMyProfile,
  updateMyProfile,
  uploadEmployeeProfilePicture,
  removeEmployeeProfilePicture,
} = require("../controllers/EmployeeController");

const authEmployee = require("../middleware/authEmployee");

router.post("/login", loginEmployee);
router.post("/forgot-password", forgotPasswordEmployee);
router.post("/reset-password/:token", resetPasswordEmployee);

// ✅ Protected routes
router.post("/apply-leave", authEmployee, applyLeave);
router.get("/me", authEmployee, getLoggedInEmployee);

router.get("/my-profile", getMyProfile);
router.put("/my-profile", updateMyProfile);
router.get("/my-leaves", getMyLeaves);
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});
router.post(
  "/upload-profile-picture",
  authEmployee,
  upload.single("profileImage"),
  uploadEmployeeProfilePicture
);

router.delete(
  "/remove-profile-picture",
  authEmployee,
  removeEmployeeProfilePicture
);


module.exports = router;
