import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useEmployeeSession } from "../hooks/useEmployeeSession";
import EmployeeNavbar from "../components/EmployeeNavbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const ApplyLeave = () => {
  const { employee, loading } = useEmployeeSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    employeeId: "",
    startDate: "",
    endDate: "",
    leaveType: "",
    reason: "",
  });

  const [submitting, setSubmitting] = useState(false);

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
    if (!loading) {
      if (!employee) {
        navigate("/employee/login", {
          state: { message: "Session expired. Please login again." },
        });
      } else {
        setForm((prev) => ({ ...prev, employeeId: employee.employeeId }));
      }
    }
  }, [employee, loading, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { startDate, endDate } = form;
    if (new Date(startDate) > new Date(endDate)) {
      return toast.error("End date must be after start date.");
    }

    setSubmitting(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/employee/apply-leave",
        form,
        { withCredentials: true }
      );

      toast.success(res.data.message || "Leave applied successfully!");
      setForm({
        employeeId: employee.employeeId,
        startDate: "",
        endDate: "",
        leaveType: "",
        reason: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Leave application failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!employee) return null;

  return (
    <div>
      <EmployeeNavbar onLogout={() => navigate("/employee/login")} />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        theme="colored"
      />

      <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-xl rounded-xl animate-fade-in transition">
        <h2 className="text-2xl font-bold mb-6 text-center text-cyan-700">Apply for Leave</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={form.employeeId}
              readOnly
              className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">Select Leave Type</option>
              <option value="Earned Leave">Earned Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows="3"
              required
              className="w-full border p-2 rounded resize-none"
              placeholder="Briefly describe the reason..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full flex items-center justify-center text-white p-2 rounded transition ${
              submitting
                ? "bg-cyan-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700"
            }`}
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Applying...
              </>
            ) : (
              "Apply Leave"
            )}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ApplyLeave;
