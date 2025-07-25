import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeSession } from "../hooks/useEmployeeSession";
import EmployeeNavbar from "../components/EmployeeNavbar";
import Avatar from "../components/Avatar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const UpdateProfile = () => {
  const { employee, loading } = useEmployeeSession();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    gender: "",
    department: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!loading && !employee) {
      navigate("/employee/login", {
        state: { message: "Session expired. Please login again." },
      });
    }
  }, [employee, loading, navigate]);

  useEffect(() => {
    if (employee) fetchProfile();
  }, [employee]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/employee/my-profile", {
        credentials: "include",
      });
      const data = await res.json();
      setProfile(data);
      setFormData(data);
    } catch (err) {
      toast.error("Failed to load profile");
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/employee/my-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await res.json();
      toast.success(data.message || "Password changed successfully");

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      toast.error("Password update failed");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/employee/my-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      toast.success(data.message || "Profile updated");
      fetchProfile();
    } catch (err) {
      toast.error("Profile update failed");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("profileImage", file);

    try {
      const res = await fetch("http://localhost:8000/api/employee/upload-profile-picture", {
        method: "POST",
        credentials: "include",
        body: uploadData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Image uploaded");
        fetchProfile();
        fileInputRef.current.value = "";
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const handleRemoveImage = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/employee/remove-profile-picture", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profile image removed");
        fetchProfile();
      } else {
        toast.error(data.message || "Removal failed");
      }
    } catch (err) {
      toast.error("Failed to remove profile image");
    }
  };

  if (loading || !profile) return <p className="p-6">Loading...</p>;

  return (
    <div>
      <EmployeeNavbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="max-w-xl mx-auto mt-10 bg-white p-6 shadow-xl rounded-xl">
        <div className="flex justify-center mb-6">
          <Avatar
            username={profile.username}
            imageUrl={profile.profileImage ? `http://localhost:8000${profile.profileImage}?t=${Date.now()}` : ""}
            size={110}
          />
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            hidden
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
          >
            Upload Image
          </button>
          {profile.profileImage && (
            <button
              onClick={handleRemoveImage}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Remove Image
            </button>
          )}
        </div>

        <div className="space-y-4">
          {["username", "email", "phone", "gender", "department"].map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          ))}

          <button
            onClick={handleUpdate}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Update Profile
          </button>
        </div>

        <h3 className="text-lg font-semibold mt-8 mb-2">Change Password</h3>
        <div className="space-y-3">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            name="confirmNewPassword"
            placeholder="Confirm New Password"
            value={passwords.confirmNewPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <button
            onClick={handlePasswordChange}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Change Password
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UpdateProfile;
