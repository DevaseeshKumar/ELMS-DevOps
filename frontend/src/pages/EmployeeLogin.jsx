import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const EmployeeLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.warn(location.state.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });

      navigate(location.pathname, { replace: true }); // Clear the state
    }
  }, [location, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8000/api/employee/login",
        {
          email: form.email,
          password: form.password,
        },
        { withCredentials: true }
      );

      localStorage.setItem("employeeId", res.data.employeeId);
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      setIsLoading(true);
      setTimeout(() => {
        navigate("/employee/dashboard");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <>
      <MainNavbar />
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
        <div className="max-w-md w-full bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">Employee Login</h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-12 h-12 border-4 border-indigo-500 border-dashed rounded-full animate-spin"></div>
              <p className="mt-4 text-indigo-600 font-medium">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition"
                >
                  Login
                </button>
              </form>

              <div className="mt-4 text-center text-sm">
                <a
                  href="/employee/forgot-password"
                  className="text-indigo-600 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </>
          )}
        </div>
        
      </div>
      <Footer />
    </>
  );
};

export default EmployeeLogin;
