import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClipboard,
  FaTachometerAlt,
  FaRegCalendarPlus,
  FaHistory,
} from "react-icons/fa";

const EmployeeNavbar = () => {
  const [employee, setEmployee] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/employee/my-profile", {
          credentials: "include",
        });
        if (res.ok) setEmployee(await res.json());
      } catch (err) {
        console.error("Failed to fetch employee:", err);
      }
    };
    fetchEmployee();
  }, []);

  useEffect(() => {
    const outside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/employee/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/employee/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getInitial = (name) => (name ? name[0].toUpperCase() : "E");

  return (
    <nav className="bg-gradient-to-r from-cyan-700 via-cyan-800 to-cyan-900 text-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-2 font-bold text-lg">
          <FaClipboard className="text-white text-2xl" />
          <span className="hidden sm:inline">ELMS – Employee Panel</span>
        </div>

        {/* Center: Navigation with dark background */}
        <div className="flex-1 flex justify-center">
          <div className="bg-cyan-950 px-6 py-2 rounded-lg flex gap-6 items-center text-sm font-medium shadow">
            <button
              onClick={() => navigate("/employee/dashboard")}
              className="flex items-center gap-2 hover:text-cyan-300 transition"
            >
              <FaTachometerAlt /> Dashboard
            </button>
            <button
              onClick={() => navigate("/employee/apply-leave")}
              className="flex items-center gap-2 hover:text-cyan-300 transition"
            >
              <FaRegCalendarPlus /> Apply Leave
            </button>
            <button
              onClick={() => navigate("/employee/leave-history")}
              className="flex items-center gap-2 hover:text-cyan-300 transition"
            >
              <FaHistory /> Leave History
            </button>
          </div>
        </div>

        {/* Right: Avatar + Dropdown */}
        <div className="relative flex items-center gap-4" ref={dropdownRef}>
          <span className="font-semibold hidden sm:block">
            {employee?.username || "Employee"}
          </span>

          <img
            onClick={() => setDropdownOpen((prev) => !prev)}
            src={
              employee?.profileImage
                ? `http://localhost:8000${employee.profileImage}?t=${Date.now()}`
                : `https://ui-avatars.com/api/?name=${employee?.username || "E"}&background=155e75&color=fff`
            }
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border-2 border-white cursor-pointer"
          />

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-md z-50">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/employee/my-profile");
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
    </nav>
  );
};

export default EmployeeNavbar;
