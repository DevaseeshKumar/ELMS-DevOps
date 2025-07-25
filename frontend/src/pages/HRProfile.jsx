import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HRNavbar from "../components/HRNavbar";
import { useHRSession } from "../hooks/useHRSession";
import Avatar from "../components/Avatar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const HRProfile = () => {
  const { hr, loading } = useHRSession();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    department: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    if (!loading && !hr) {
      toast.warn("Session expired. Please login again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setTimeout(() => navigate("/hr/login"), 3000);
    }
  }, [hr, loading, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/hr/profile", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Profile fetch failed");
      const data = await res.json();
      setProfile(data);
      setFormData(data);
    } catch (err) {
      toast.error("Failed to fetch HR profile");
      console.error(err);
    }
  };

  useEffect(() => {
    if (hr) fetchProfile();
  }, [hr]);

  const handleUpdate = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/hr/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      toast.success(data.message || "Profile updated successfully");
      fetchProfile();
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/hr/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Password changed successfully");
      } else {
        toast.error(data.message || "Password change failed");
      }
      setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      toast.error("Failed to change password");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const res = await fetch("http://localhost:8000/api/hr/upload-profile-picture", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profile picture uploaded successfully");
        fileInputRef.current.value = "";
        fetchProfile();
      } else {
        toast.error(data.message || "Image upload failed");
      }
    } catch (err) {
      toast.error("Upload failed");
      console.error(err);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/hr/remove-profile-picture", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.info("Profile picture removed");
        fetchProfile();
      } else {
        toast.error(data.message || "Failed to remove image");
      }
    } catch (err) {
      toast.error("Failed to remove profile picture");
    }
  };

  if (loading || !profile) return <p className="p-6">Loading...</p>;

  return (
    <div>
      <HRNavbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Profile Image Section */}
      <div className="flex flex-col items-center mt-10">
        <Avatar
          username={profile.username}
          imageUrl={
            profile.profileImage
              ? `http://localhost:8000${profile.profileImage}?t=${Date.now()}`
              : ""
          }
          size={100}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
        />

        <div className="flex gap-3 mt-4">
         <button
  onClick={() => fileInputRef.current.click()}
  className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition duration-200"
>
  Upload Profile Picture
</button>

          {profile.profileImage && (
            <button
              onClick={handleRemoveProfilePicture}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Remove Picture
            </button>
          )}
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center text-indigo-700">HR Profile</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
            readOnly
          />
          <input
            type="text"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <button
  onClick={handleUpdate}
  className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition duration-200 w-full"
>
  Update Profile
</button>
        </div>

        {/* Change Password Section */}
        <h3 className="text-xl font-semibold mt-8 mb-2 text-gray-800">Change Password</h3>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={passwords.confirmNewPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <button
  onClick={handlePasswordChange}
  className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition duration-200 w-full"
>
  Change Password
</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HRProfile;
