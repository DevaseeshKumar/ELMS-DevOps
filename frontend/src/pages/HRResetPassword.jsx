import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";

const HRResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`http://localhost:8000/api/hr/reset-password/${token}`, {
        newPassword,
      });

      setSuccess(true);
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/hr/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Set New Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          className="w-full border p-2 rounded mb-3"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          className="w-full border p-2 rounded mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white p-2 rounded"
          disabled={loading || success}
        >
          {loading ? "Submitting..." : "Set Password"}
        </button>
        {message && (
          <p className={`text-sm text-center mt-2 ${success ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </form>
      <Footer />
    </div>
  );
};

export default HRResetPassword;
