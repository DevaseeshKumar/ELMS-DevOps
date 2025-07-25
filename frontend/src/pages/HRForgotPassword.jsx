import React, { useState } from "react";
import axios from "axios";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";

const HRForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/hr/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending reset email");
    }
  };

  return (
    <>
    <MainNavbar />
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your HR email"
          className="w-full border p-2 rounded mb-4"
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
        {message && <p className="text-sm text-center mt-2">{message}</p>}
      </form>
      <Footer />
    </div>
    </>
  );
};

export default HRForgotPassword;
