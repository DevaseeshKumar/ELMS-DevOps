const express = require("express");
const router = express.Router();
const {
  sendInquiry,
  reportBug,
  contactRequest,
} = require("../controllers/contactController");

router.post("/inquiry", sendInquiry);
router.post("/report-bug", reportBug);
router.post("/support-request", contactRequest);

module.exports = router;
