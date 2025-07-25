import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClipboard,
  FaTachometerAlt,
  FaUserShield,
  FaUsers,
  FaClipboardList,
  FaUserPlus,
} from "react-icons/fa";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/admin/my-profile", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAdmin(data);
        } else {
          console.error("Failed to fetch admin data");
        }
      } catch (err) {
        console.error("Fetch admin error:", err);
      }
    };
    fetchAdmin();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/admin/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo & Title */}
        <div className="flex items-center gap-2 font-bold text-lg">
          <FaClipboard className="text-white text-2xl" />
          <span className="hidden sm:inline">ELMS - Admin Panel</span>
        </div>

        {/* Center Nav Links with dark background */}
        <div className="flex-1 flex justify-center">
          <div className="bg-indigo-950 px-6 py-2 rounded-lg flex gap-6 items-center text-sm font-medium shadow">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 hover:text-purple-300 transition"
            >
              <FaTachometerAlt /> Dashboard
            </button>
            <button
              onClick={() => navigate("/admin/view-hrs")}
              className="flex items-center gap-2 hover:text-purple-300 transition"
            >
              <FaUserShield /> Manage HR
            </button>
            <button
              onClick={() => navigate("/admin/manage-employees")}
              className="flex items-center gap-2 hover:text-purple-300 transition"
            >
              <FaUsers /> Manage Employees
            </button>
            <button
              onClick={() => navigate("/admin/hr-approvals")}
              className="flex items-center gap-2 hover:text-purple-300 transition"
            >
              <FaClipboardList /> Approve HR
            </button>
            <button
              onClick={() => navigate("/admin/add-employee")}
              className="flex items-center gap-2 hover:text-purple-300 transition"
            >
              <FaUserPlus /> Add Employee
            </button>
            <button
              onClick={() => navigate("/admin/leave-decision/leaveId")}
              className="flex items-center gap-2 hover:text-purple-300 transition"
            >
              <FaClipboardList /> Leaves
            </button>
          </div>
        </div>

        {/* Admin Avatar & Dropdown */}
        <div className="relative flex items-center gap-4" ref={dropdownRef}>
          <span className="font-semibold hidden sm:block">
            {admin?.username || "Admin"}
          </span>

          <div className="relative">
            <img
              onClick={() => setDropdownOpen((prev) => !prev)}
              src={
                admin?.profileImage
                  ? `http://localhost:8000${admin.profileImage}?t=${Date.now()}`
                  : `https://ui-avatars.com/api/?name=${admin?.username || "A"}&background=6D28D9&color=fff`
              }
              alt="Admin Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-white cursor-pointer"
            />

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-md z-50">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/admin/profile");
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  View Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
