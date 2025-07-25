import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useEmployeeSession } from "../hooks/useEmployeeSession";
import EmployeeNavbar from "../components/EmployeeNavbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const LeaveHistory = () => {
  const { employee, loading } = useEmployeeSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [leaves, setLeaves] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
    earned: 0,
    sick: 0,
    casual: 0,
  });

  const [error, setError] = useState("");
  const [showShimmer, setShowShimmer] = useState(false);

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

    const fetchLeaves = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/employee/my-leaves", {
          withCredentials: true,
        });
        setLeaves(res.data);
        calculateSummary(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch leave history");
      }
    };

    const calculateSummary = (leaves) => {
      const summary = {
        approved: 0,
        pending: 0,
        rejected: 0,
        earned: 0,
        sick: 0,
        casual: 0,
      };

      leaves.forEach((leave) => {
        summary[leave.status.toLowerCase()]++;

        if (leave.status === "Approved") {
          const type = leave.leaveType.toLowerCase();
          if (type.includes("earned")) summary.earned++;
          if (type.includes("sick")) summary.sick++;
          if (type.includes("casual")) summary.casual++;
        }
      });

      setLeaveSummary(summary);
    };

    if (employee) {
      fetchLeaves();

      const timer = setTimeout(() => {
        if (!leaves.length) setShowShimmer(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [employee, loading, navigate]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-green-700 bg-green-100";
      case "pending":
        return "text-yellow-700 bg-yellow-100";
      case "rejected":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-600";
    }
  };

  const getGradientByType = (type) => {
    const t = type.toLowerCase();
    if (t.includes("earned")) return "from-cyan-200 to-cyan-50";
    if (t.includes("sick")) return "from-purple-200 to-purple-50";
    if (t.includes("casual")) return "from-orange-200 to-orange-50";
    return "from-gray-200 to-white";
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!employee) return null;

  return (
    <div>
      <EmployeeNavbar onLogout={() => navigate("/employee/login")} />

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4 text-cyan-800">Your Leave History</h2>
        {error && <p className="text-red-600">{error}</p>}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-sm sm:text-base">
          <div className="bg-blue-100 p-3 rounded">✅ Approved: {leaveSummary.approved}</div>
          <div className="bg-yellow-100 p-3 rounded">⏳ Pending: {leaveSummary.pending}</div>
          <div className="bg-red-100 p-3 rounded">❌ Rejected: {leaveSummary.rejected}</div>
          <div className="bg-green-100 p-3 rounded">📘 Earned: {leaveSummary.earned}</div>
          <div className="bg-purple-100 p-3 rounded">🤒 Sick: {leaveSummary.sick}</div>
          <div className="bg-orange-100 p-3 rounded">🛑 Casual: {leaveSummary.casual}</div>
        </div>

        {/* Shimmer or Data */}
        {showShimmer && leaves.length === 0 ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : leaves.length === 0 ? (
          <p className="text-gray-600">No leave records found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leaves.map((leave) => (
              <div
                key={leave._id}
                className={`p-5 rounded-xl border shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:rotate-[0.5deg] bg-gradient-to-br ${getGradientByType(
                  leave.leaveType
                )}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-700">
                    <p><strong>From:</strong> {new Date(leave.startDate).toLocaleDateString()}</p>
                    <p><strong>To:</strong> {new Date(leave.endDate).toLocaleDateString()}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-semibold ${getStatusColor(
                      leave.status
                    )}`}
                  >
                    {leave.status}
                  </span>
                </div>
                <div className="text-sm text-gray-800 mt-2 space-y-1">
  <p><strong>Type:</strong> {leave.leaveType}</p>
  <p><strong>Reason:</strong> {leave.reason || "N/A"}</p>
  <p><strong>Reviewed By:</strong>{" "}
    {leave.reviewedBy?.username
      ? `${leave.reviewedBy.username} (${leave.reviewedBy.role})`
      : "Not reviewed yet"}
  </p>
  <p><strong>Reviewed At:</strong>{" "}
    {leave.reviewedAt
      ? new Date(leave.reviewedAt).toLocaleString()
      : "Not reviewed yet"}
  </p>
</div>

              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default LeaveHistory;
