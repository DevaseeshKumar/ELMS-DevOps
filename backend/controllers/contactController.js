const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"ELMS Notification" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

exports.sendInquiry = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    await sendEmail(
      process.env.EMAIL_USER,
      `📩 General Inquiry from ${name}`,
      `From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    res.status(200).json({ success: true, message: "Inquiry sent to admin." });
  } catch (error) {
    console.error("Email send error (inquiry):", error);
    res.status(500).json({ error: "Failed to send inquiry email." });
  }
};

exports.reportBug = async (req, res) => {
  const { name, email, bug } = req.body;

  if (!name || !email || !bug) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    await sendEmail(
      process.env.EMAIL_USER,
      `🐞 Bug Report from ${name}`,
      `From: ${name}\nEmail: ${email}\n\nBug Description:\n${bug}`
    );
    res.status(200).json({ success: true, message: "Bug report sent to admin." });
  } catch (error) {
    console.error("Email send error (bug):", error);
    res.status(500).json({ error: "Failed to send bug report email." });
  }
};

exports.contactRequest = async (req, res) => {
  const { name, email, phone, reason } = req.body;

  if (!name || !email || !phone || !reason) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    await sendEmail(
      process.env.EMAIL_USER,
      `📞 Support Request from ${name}`,
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nReason:\n${reason}`
    );
    res.status(200).json({ success: true, message: "Support request sent to admin." });
  } catch (error) {
    console.error("Email send error (support):", error);
    res.status(500).json({ error: "Failed to send support request email." });
  }
};
