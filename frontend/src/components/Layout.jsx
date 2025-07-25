// src/components/Footer.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-gray-800 text-white py-4 px-6 mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Leave Management System</p>
        <button
          onClick={() => navigate("/support")}
          className="mt-2 sm:mt-0 bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded text-sm"
        >
          Contact Support
        </button>
      </div>
    </footer>
  );
};

export default Footer;
