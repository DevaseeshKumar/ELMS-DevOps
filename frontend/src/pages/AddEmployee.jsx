import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { useAdminSession } from "../hooks/useAdminSession";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const AddEmployee = () => {
  const { admin, loading } = useAdminSession();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    employeeId: "",
    email: "",
    phone: "",
    gender: "",
    department: "",
  });

  useEffect(() => {
    if (!loading && !admin) {
      toast.warn("Session expired. Please login again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      navigate("/admin/login", { state: { message: "Session expired" } });
    }
  }, [admin, loading, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8000/api/admin/add-employee",
        form,
        { withCredentials: true }
      );

      toast.success(res.data.message || "Employee added successfully", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });

      setForm({
        username: "",
        employeeId: "",
        email: "",
        phone: "",
        gender: "",
        department: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add employee", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!admin) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar />
      <ToastContainer />

      <div className="flex-grow">
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Add New Employee</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="username"
              type="text"
              placeholder="Employee Name"
              className="w-full border p-2 rounded"
              value={form.username}
              onChange={handleChange}
              required
            />
            <input
              name="employeeId"
              type="text"
              placeholder="Employee ID"
              className="w-full border p-2 rounded"
              value={form.employeeId}
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
              placeholder="Phone Number"
              className="w-full border p-2 rounded"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <select
              name="gender"
              className="w-full border p-2 rounded"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
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
              Add Employee
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddEmployee;
