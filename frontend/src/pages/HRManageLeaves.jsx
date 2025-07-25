import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useHRSession } from "../hooks/useHRSession";
import HRNavbar from "../components/HRNavbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const HRManageLeaves = () => {
  const { hr, loading } = useHRSession();
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [rejectingLeaveId, setRejectingLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [leavesByEmployee, setLeavesByEmployee] = useState({});
  const [approvingLeaveId, setApprovingLeaveId] = useState(null);
  const [rejectingNowId, setRejectingNowId] = useState(null);

  useEffect(() => {
    if (!loading && !hr) {
      toast.error("Session expired. Please login again.");
      navigate("/hr/login");
    }
  }, [hr, loading, navigate]);

  useEffect(() => {
    if (hr) fetchLeaves();
  }, [hr]);

  const getDatesInRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/hr/leaves", {
        withCredentials: true,
      });
      const sortedLeaves = res.data.sort((a, b) => {
  // 1. Prioritize "Pending" > "Approved" > "Rejected"
  const statusOrder = { Pending: 0, Approved: 1, Rejected: 2 };
  const statusCompare = statusOrder[a.status] - statusOrder[b.status];

  if (statusCompare !== 0) return statusCompare;

  // 2. If same status, sort by newest createdAt first
  return new Date(b.createdAt) - new Date(a.createdAt);
});

setLeaves(sortedLeaves);

      const empMap = {};
      sortedLeaves.forEach((leave) => {
        if (!leave.employee?._id) return;
        const empId = leave.employee._id;

        if (!empMap[empId]) {
          empMap[empId] = {
            employee: leave.employee,
            earnedDays: new Set(),
            sickDays: new Set(),
            casualDays: new Set(),
          };
        }

        if (leave.status !== "Approved") return;

        const dates = getDatesInRange(leave.startDate, leave.endDate);
        const type = (leave.leaveType || "").toLowerCase();

        if (type.includes("earned")) {
          dates.forEach((d) => empMap[empId].earnedDays.add(d));
        } else if (type.includes("sick")) {
          dates.forEach((d) => empMap[empId].sickDays.add(d));
        } else if (type.includes("casual")) {
          dates.forEach((d) => empMap[empId].casualDays.add(d));
        }
      });

      setLeavesByEmployee(empMap);
    } catch (err) {
      toast.error("Failed to fetch leaves.");
    }
  };

  const handleApprove = async (id) => {
    setApprovingLeaveId(id);
    try {
      const res = await axios.put(
        `http://localhost:8000/api/hr/leaves/${id}`,
        {
          action: "Approved",
          reviewer: {
            username: hr.username,
            role: "HR",
          },
        },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Leave approved");
      await fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      setApprovingLeaveId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.warn("Please provide a reason for rejection.");
      return;
    }
    setRejectingNowId(rejectingLeaveId);
    try {
      const res = await axios.put(
        `http://localhost:8000/api/hr/leaves/${rejectingLeaveId}`,
        {
          action: "Rejected",
          reason: rejectionReason,
          reviewer: {
            username: hr.username,
            role: "HR",
          },
        },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Leave rejected");
      setRejectingLeaveId(null);
      setRejectionReason("");
      await fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    } finally {
      setRejectingNowId(null);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!hr) return null;

  return (
    <div>
      <HRNavbar />
      <ToastContainer />
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">Manage Leave Requests</h2>

        {leaves.length === 0 ? (
          <p className="text-center text-gray-600">No leave requests available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaves.map((leave) => {
              const empLeaves = leavesByEmployee[leave.employee?._id] || {
                earnedDays: new Set(),
                sickDays: new Set(),
                casualDays: new Set(),
              };

              return (
                <div
                  key={leave._id}
                  className="bg-white rounded-lg shadow-lg p-5 space-y-3 border hover:shadow-2xl transition"
                >
                  <div className="text-lg font-semibold text-gray-800">
                    {leave.employee?.username} ({leave.employee?.employeeId})
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(leave.startDate).toLocaleDateString()} -{" "}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </div>
                  <p className="text-sm"><strong>Type:</strong> {leave.leaveType}</p>
                  <p className="text-sm"><strong>Reason:</strong> {leave.reason || "N/A"}</p>
                  <p className="text-sm"><strong>Status:</strong> {leave.status}</p>
                  <p className="text-sm"><strong>Reviewed By:</strong> {leave.reviewedBy?.username || "Pending"}</p>
                  <p className="text-sm">
                    <strong>Reviewed At:</strong>{" "}
                    {leave.reviewedAt ? new Date(leave.reviewedAt).toLocaleString() : "Not reviewed yet"}
                  </p>
                  <p className="text-sm">
                    <strong>Leave Taken:</strong><br />
                    Earned: {empLeaves.earnedDays.size} days | Sick: {empLeaves.sickDays.size} days | Casual: {empLeaves.casualDays.size} days
                  </p>

                  <div className="flex gap-2 mt-2">
                    <button
                      disabled={leave.status !== "Pending" || approvingLeaveId === leave._id}
                      onClick={() => handleApprove(leave._id)}
                      className={`flex-1 px-3 py-1 text-white rounded ${
                        leave.status !== "Pending" ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                      } flex items-center justify-center`}
                    >
                      {approvingLeaveId === leave._id ? (
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      ) : (
                        "Approve"
                      )}
                    </button>

                    <button
                      disabled={leave.status !== "Pending"}
                      onClick={() => setRejectingLeaveId(leave._id)}
                      className={`flex-1 px-3 py-1 text-white rounded ${
                        leave.status !== "Pending" ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rejection Modal */}
        {rejectingLeaveId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
              <h3 className="text-lg font-bold mb-3 text-red-600">Enter Rejection Reason</h3>
              <textarea
                rows="4"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full border p-2 rounded mb-4"
                placeholder="Reason for rejecting leave..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setRejectingLeaveId(null);
                    setRejectionReason("");
                  }}
                  className="px-4 py-1 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-1 bg-red-600 text-white rounded flex items-center justify-center"
                >
                  {rejectingNowId === rejectingLeaveId ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HRManageLeaves;
