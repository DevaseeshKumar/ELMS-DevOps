import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white py-3 px-4 shadow-inner mt-10">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} <span className="font-semibold">Leavo</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
