const checkHRSession = (req, res, next) => {
  if (req.session && req.session.hrId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: HR session not found" });
  }
};

module.exports = checkHRSession; // ✅ exports the middleware function correctly
