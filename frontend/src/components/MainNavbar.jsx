import React from "react";
import { Link } from "react-router-dom";

const MainNavbar = () => {
  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg">
      <div className="backdrop-blur-md bg-white/10 w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          {/* ELMS Brand Title linked to home */}
          <Link
            to="/"
            className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md font-sans"
          >
            <span className="bg-white/20 px-4 py-1 rounded-lg shadow-md hover:bg-white/30 transition">
              ELMS
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-3 text-sm font-medium items-center">
            <Link
              to="/"
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm hover:scale-105 transition"
            >
              Home
            </Link>
            <Link
              to="/admin/login"
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm hover:scale-105 transition"
            >
              Admin Login
            </Link>
            <Link
              to="/hr/login"
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm hover:scale-105 transition"
            >
              HR Login
            </Link>
            <Link
              to="/hr/register"
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm hover:scale-105 transition"
            >
              HR Register
            </Link>
            <Link
              to="/employee/login"
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm hover:scale-105 transition"
            >
              Employee Login
            </Link>

            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;
