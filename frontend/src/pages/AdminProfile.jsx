import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import Avatar from "../components/Avatar";
import { useAdminSession } from "../hooks/useAdminSession";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const AdminProfile = () => {
  const { admin, loading } = useAdminSession();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
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

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/admin/my-profile", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch admin profile");
      const data = await res.json();
      setFormData({
        username: data.username,
        email: data.email,
        phone: data.phone || "",
        profileImage: data.profileImage || "",
      });
    } catch (err) {
      console.error("Fetch admin profile error:", err);
      toast.error("Failed to load profile", {
        position: "top-right",
        theme: "colored",
      });
    }
  };

  useEffect(() => {
    if (admin) fetchProfile();
  }, [admin]);

  const handleUpdate = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/admin/my-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Profile updated successfully", {
          position: "top-right",
          theme: "colored",
        });
        fetchProfile();
      } else {
        toast.error(data.message || "Update failed", {
          position: "top-right",
          theme: "colored",
        });
      }
    } catch {
      toast.error("Server error while updating", {
        position: "top-right",
        theme: "colored",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error("New password and confirm password do not match", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/admin/change-password", {
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
        toast.success(data.message || "Password changed successfully", {
          position: "top-right",
          theme: "colored",
        });
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } else {
        toast.error(data.message || "Password change failed", {
          position: "top-right",
          theme: "colored",
        });
      }
    } catch {
      toast.error("Server error while changing password", {
        position: "top-right",
        theme: "colored",
      });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageData = new FormData();
    imageData.append("profileImage", file);

    try {
      const res = await fetch("http://localhost:8000/api/admin/upload-profile-picture", {
        method: "POST",
        credentials: "include",
        body: imageData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profile picture uploaded", {
          position: "top-right",
          theme: "colored",
        });
        fileInputRef.current.value = "";
        fetchProfile();
      } else {
        toast.error(data.message || "Image upload failed", {
          position: "top-right",
          theme: "colored",
        });
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Upload failed", {
        position: "top-right",
        theme: "colored",
      });
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/admin/remove-profile-picture", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profile picture removed", {
          position: "top-right",
          theme: "colored",
        });
        fetchProfile();
      } else {
        toast.error(data.message || "Failed to remove picture", {
          position: "top-right",
          theme: "colored",
        });
      }
    } catch (err) {
      console.error("Remove image error:", err);
      toast.error("Server error while removing picture", {
        position: "top-right",
        theme: "colored",
      });
    }
  };

  if (loading || !formData.email) return <p className="p-6">Loading...</p>;

  return (
    <div>
      <AdminNavbar />
      <ToastContainer />

      {/* Profile Image Section */}
      <div className="flex flex-col items-center mt-10">
        <Avatar
          username={formData.username}
          imageUrl={
            formData.profileImage
              ? `http://localhost:8000${formData.profileImage}?t=${Date.now()}`
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

        <div className="flex gap-3 mt-3">
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Upload Profile Picture
          </button>

          {formData.profileImage && (
            <button
              onClick={handleRemoveProfilePicture}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Remove Picture
            </button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="max-w-md mx-auto mt-6 p-6 bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-4">Admin Profile</h2>
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
            className="w-full p-2 border rounded bg-gray-100"
            readOnly
          />
          <input
            type="text"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Update Profile
          </button>
        </div>

        {/* Password Change Section */}
        <h3 className="text-lg font-semibold mt-6">Change Password</h3>
        <div className="space-y-3 mt-2">
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
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
          >
            Change Password
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminProfile;
