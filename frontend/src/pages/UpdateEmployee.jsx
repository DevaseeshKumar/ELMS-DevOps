import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { useAdminSession } from "../hooks/useAdminSession";
import Avatar from "../components/Avatar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const UpdateEmployee = () => {
  const { admin, loading } = useAdminSession();
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    employeeId: "",
    email: "",
    phone: "",
    gender: "",
    department: "",
    password: "",
    profileImage: "",
  });

  useEffect(() => {
    if (!loading && !admin) {
      toast.warn("Session expired. Please login again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setTimeout(() => navigate("/admin/login"), 1000);
    }
  }, [admin, loading, navigate]);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/admin/employee/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch employee");
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        console.error("Error loading employee:", err);
        toast.error("Failed to load employee data", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/employee/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Employee updated successfully", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } else {
        toast.error(data.message || "Update failed", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Server error while updating", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  if (loading || !formData) return <p className="p-6">Loading...</p>;

  return (
    <div>
      <AdminNavbar />
      <ToastContainer position="top-right" />

      <div className="flex flex-col items-center mt-6">
        <Avatar
          username={formData.username}
          imageUrl={
            formData.profileImage
              ? `http://localhost:8000${formData.profileImage}?t=${Date.now()}`
              : ""
          }
          size={100}
        />
      </div>

      <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-4 text-center">Edit Employee Profile</h2>
        <div className="space-y-4">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            placeholder="Employee ID"
            className="w-full border p-2 rounded"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            placeholder="Gender"
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Department"
            className="w-full border p-2 rounded"
          />

          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UpdateEmployee;
