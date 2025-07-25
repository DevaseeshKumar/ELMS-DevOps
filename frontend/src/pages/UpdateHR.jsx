import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const UpdateHR = () => {
  const { hrId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    department: "",
    profileImage: "",
  });

  useEffect(() => {
    const fetchHR = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/admin/hr/${hrId}`, {
          withCredentials: true,
        });
        setForm({
          username: res.data.username,
          email: res.data.email,
          phone: res.data.phone,
          department: res.data.department,
          profileImage: res.data.profileImage || "",
        });
      } catch (err) {
        console.error("Failed to load HR:", err);
        toast.error("Failed to load HR details", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };

    fetchHR();
  }, [hrId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/admin/hr/${hrId}`, form, {
        withCredentials: true,
      });
      toast.success("HR updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setTimeout(() => navigate("/admin/view-hrs"), 1500);
    } catch (err) {
      console.error("Failed to update HR:", err);
      toast.error(err.response?.data?.message || "Update failed", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div>
      <AdminNavbar />
      <ToastContainer />
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Update HR</h2>

        {form.profileImage && (
          <div className="flex justify-center mb-4">
            <img
              src={`http://localhost:8000${form.profileImage}?t=${Date.now()}`}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            type="text"
            placeholder="Username"
            className="w-full border p-2 rounded"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            type="text"
            placeholder="Phone"
            className="w-full border p-2 rounded"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <input
            name="department"
            type="text"
            placeholder="Department"
            className="w-full border p-2 rounded"
            value={form.department}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Update HR
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default UpdateHR;
