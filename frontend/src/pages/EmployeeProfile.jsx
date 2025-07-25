import React, { useEffect, useState } from "react";
import axios from "axios";
import EmployeeNavbar from "../components/EmployeeNavbar";
import { useEmployeeSession } from "../hooks/useEmployeeSession";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const EmployeeProfile = () => {
  const { employee, loading } = useEmployeeSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);

  // Show session expired toast if redirected
  useEffect(() => {
    if (location.state?.message) {
      toast.warn(location.state.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  }, [location.state]);

  useEffect(() => {
    if (!loading && !employee) {
      navigate("/employee/login", {
        state: { message: "Session expired. Please login again." },
      });
    }
  }, [employee, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/employee/my-profile", {
          withCredentials: true,
        });
        setProfile(res.data);
      } catch (err) {
        toast.error("Failed to load profile.");
        console.error("Profile error", err);
      }
    };

    fetchProfile();
  }, []);

  if (loading || !profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <EmployeeNavbar />
        <div className="flex-grow">
          <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl animate-pulse">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gray-300" />
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 rounded" />
              ))}
              <div className="mt-6 h-10 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <EmployeeNavbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="flex-grow">
        <div className="max-w-md mx-auto mt-10 p-6 bg-gradient-to-br from-white via-cyan-50 to-cyan-100 border border-cyan-200 shadow-xl rounded-2xl transition duration-300 hover:shadow-cyan-200">
          <div className="flex items-center justify-center mb-6">
            {profile.profileImage ? (
              <img
                src={`http://localhost:8000${profile.profileImage}`}
                alt={`${profile.username}'s profile`}
                className="w-28 h-28 rounded-full object-cover border-4 border-cyan-500 shadow-md"
              />
            ) : (
              <div className="w-28 h-28 bg-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {profile.username?.[0]?.toUpperCase() || "E"}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-center text-cyan-700 mb-6">My Profile</h2>

          <div className="space-y-2 text-gray-800 text-[15px] leading-relaxed">
            <p><span className="font-semibold text-cyan-700">👤 Username:</span> {profile.username}</p>
            <p><span className="font-semibold text-cyan-700">📧 Email:</span> {profile.email}</p>
            <p><span className="font-semibold text-cyan-700">📱 Phone:</span> {profile.phone}</p>
            <p><span className="font-semibold text-cyan-700">🚻 Gender:</span> {profile.gender}</p>
            <p><span className="font-semibold text-cyan-700">🏢 Department:</span> {profile.department}</p>
          </div>

          <button
            className="mt-6 w-full bg-cyan-600 text-white py-2 rounded-full shadow hover:bg-cyan-700 hover:scale-[1.03] transition-all duration-200"
            onClick={() => navigate("/employee/update-profile")}
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EmployeeProfile;
