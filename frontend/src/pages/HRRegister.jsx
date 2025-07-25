import React, { useState } from "react";
import axios from "axios";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";

const HRRegister = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    department: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/hr/register", form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
    <MainNavbar />
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">HR Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["username", "email", "phone", "department"].map((field) => (
          <input
            key={field}
            name={field}
            type={field === "email" ? "email" : "text"}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="w-full border p-2 rounded"
            value={form[field]}
            onChange={handleChange}
            required
          />
        ))}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Register
        </button>
        {message && <p className="text-sm text-center mt-2">{message}</p>}
      </form>
      <Footer />
    </div>
    </>
  );
};

export default HRRegister;
