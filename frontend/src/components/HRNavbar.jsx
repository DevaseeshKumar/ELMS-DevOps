import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClipboard,
  FaTachometerAlt,
  FaClipboardList,
  FaUsers,
} from "react-icons/fa";

const HrNavbar = () => {
  const navigate = useNavigate();
  const [hr, setHr] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchHR = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/hr/profile", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setHr(data);
        }
      } catch (err) {
        console.error("Failed to fetch HR:", err);
      }
    };
    fetchHR();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/hr/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/hr/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : "H";

  return (
    <nav className="bg-gradient-to-r from-purple-700 via-pink-700 to-purple-800 text-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo & title */}
        <div className="flex items-center gap-2 font-bold text-lg">
          <FaClipboard className="text-white text-2xl" />
          <span className="hidden sm:inline">ELMS - HR Portal</span>
        </div>

        {/* Center: Nav Links with dark background */}
        <div className="flex-1 flex justify-center">
          <div className="bg-purple-950 px-6 py-2 rounded-lg flex gap-6 items-center text-sm font-medium shadow">
            <button
              onClick={() => navigate("/hr/dashboard")}
              className="flex items-center gap-2 hover:text-pink-200 transition"
            >
              <FaTachometerAlt /> Dashboard
            </button>
            <button
              onClick={() => navigate("/hr/manage-leaves")}
              className="flex items-center gap-2 hover:text-pink-200 transition"
            >
              <FaClipboardList /> Manage Leaves
            </button>
            <button
              onClick={() => navigate("/hr/hr-employees")}
              className="flex items-center gap-2 hover:text-pink-200 transition"
            >
              <FaUsers /> View Employees
            </button>
          </div>
        </div>

        {/* HR Avatar and Dropdown */}
        <div className="relative flex items-center gap-4" ref={dropdownRef}>
          <span className="font-semibold hidden sm:block">
            {hr?.username || "HR"}
          </span>

          <div className="relative">
            <img
              onClick={() => setDropdownOpen((prev) => !prev)}
              src={
                hr?.profileImage
                  ? `http://localhost:8000${hr.profileImage}?t=${Date.now()}`
                  : `https://ui-avatars.com/api/?name=${hr?.username || "H"}&background=9333EA&color=fff`
              }
              alt="HR Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-white cursor-pointer"
            />

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-md z-50">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/hr/profile");
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

export default HrNavbar;
