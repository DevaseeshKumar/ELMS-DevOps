import React, { useState } from "react";
import axios from "axios";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";

const EmployeeForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/employee/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending reset link");
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
          className="w-full border p-2 rounded mb-4"
          placeholder="Enter your email"
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
      {message && <p className="text-sm text-center mt-2 text-green-600">{message}</p>}
      <Footer />
    </div>
    </>
  );
};

export default EmployeeForgotPassword;
