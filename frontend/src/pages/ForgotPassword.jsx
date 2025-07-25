import React, { useState } from "react";
import axios from "axios";
import MainNavbar from "../components/MainNavbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/admin/forgot-password", { email });
      toast.success(res.data.message || "Reset link sent! Check your email.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending reset email", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <>
      <MainNavbar />
      <ToastContainer />
      <div className="min-h-screen bg-indigo-50 px-4 py-12 flex justify-center">
        <div className="max-w-md w-full bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">Forgot Password</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter your admin email to receive a reset link
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition"
            >
              Send Reset Link
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-600">
            <a href="/admin/login" className="text-indigo-600 hover:underline">
              Back to Login
            </a>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AdminForgotPassword;
