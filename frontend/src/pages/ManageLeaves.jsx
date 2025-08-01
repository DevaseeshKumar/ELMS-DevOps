import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAdminSession } from "../hooks/useAdminSession";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import MapModal from "../components/MapModal";

// ✅ Use .env variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const ManageLeaves = () => {
  const { admin, loading } = useAdminSession();
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [leavesByEmployee, setLeavesByEmployee] = useState({});
  const [approvingLeaveId, setApprovingLeaveId] = useState(null);
  const [rejectingLeaveId, setRejectingLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingNowId, setRejectingNowId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
const [locationInfo, setLocationInfo] = useState(null);

  useEffect(() => {
    if (!loading && !admin) {
      toast.warn("Session expired. Please login again.");
      navigate("/admin/login");
    }
  }, [admin, loading, navigate]);

  useEffect(() => {
    if (admin) fetchLeaves();
  }, [admin]);

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
      const res = await axios.get("http://localhost:8000/api/admin/leaves", {
        withCredentials: true,
      });

      const sortedLeaves = res.data.sort((a, b) => {
        const statusOrder = { Pending: 0, Approved: 1, Rejected: 2 };
        const statusCompare = statusOrder[a.status] - statusOrder[b.status];
        if (statusCompare !== 0) return statusCompare;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setLeaves(sortedLeaves);

      const empMap = {};
      sortedLeaves.forEach((leave) => {
        const empId = leave.employee?._id;
        if (!empId) return;

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
        const type = leave.leaveType?.toLowerCase();

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
      console.error(err);
      toast.error("Failed to fetch leave data");
    }
  };

  const handleApprove = async (id) => {
    setApprovingLeaveId(id);
    try {
      const res = await axios.put(
        `http://localhost:8000/api/admin/leave-decision/${id}`,
        {
          action: "Approved",
          reviewer: { username: admin.username, role: "Admin" },
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
        `http://localhost:8000/api/admin/leave-decision/${rejectingLeaveId}`,
        {
          action: "Rejected",
          reason: rejectionReason,
          reviewer: { username: admin.username, role: "Admin" },
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

  const exportToExcel = () => {
    const dataToExport = filteredLeaves.map((leave) => ({
      Name: leave.employee?.username,
      EmployeeID: leave.employee?.employeeId,
      LeaveType: leave.leaveType,
      StartDate: new Date(leave.startDate).toLocaleDateString(),
      EndDate: new Date(leave.endDate).toLocaleDateString(),
      Status: leave.status,
      Reason: leave.reason,
      ReviewedBy: leave.reviewedBy?.username || "Pending",
      ReviewedAt: leave.reviewedAt
        ? new Date(leave.reviewedAt).toLocaleString()
        : "Not reviewed",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LeaveRequests");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "LeaveRequests.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Leave Requests", 14, 15);
    const tableData = filteredLeaves.map((leave) => [
      leave.employee?.username,
      leave.employee?.employeeId,
      leave.leaveType,
      new Date(leave.startDate).toLocaleDateString(),
      new Date(leave.endDate).toLocaleDateString(),
      leave.status,
      leave.reviewedBy?.username || "Pending",
    ]);

    autoTable(doc, {
      head: [["Name", "Employee ID", "Type", "Start", "End", "Status", "Reviewed By"]],
      body: tableData,
      startY: 25,
    });

    doc.save("LeaveRequests.pdf");
  };

  const filteredLeaves = leaves.filter((leave) => {
    const term = searchTerm.toLowerCase();
    return (
      leave.employee?.username?.toLowerCase().includes(term) ||
      leave.employee?.employeeId?.toLowerCase().includes(term) ||
      leave.leaveType?.toLowerCase().includes(term) ||
      leave.status?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <AdminNavbar />
      <ToastContainer />
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">
          Manage Leave Requests
        </h2>

        <div className="mb-6 flex justify-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID, type, or status..."
            className="w-full max-w-md px-4 py-2 border rounded"
          />
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-4">
          <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow">
            Download Excel
          </button>
          <button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow">
            Download PDF
          </button>
        </div>

        {filteredLeaves.length === 0 ? (
          <p className="text-center text-gray-600">No leave requests found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeaves.map((leave) => {
              const empLeaves = leavesByEmployee[leave.employee?._id] || {
                earnedDays: new Set(),
                sickDays: new Set(),
                casualDays: new Set(),
              };

              return (
                <div key={leave._id} className="bg-white rounded-lg shadow-lg p-5 space-y-3 border">
                  <div className="text-lg font-semibold">{leave.employee?.username} ({leave.employee?.employeeId})</div>
                  <div className="text-sm">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</div>
                  <p><strong>Type:</strong> {leave.leaveType}</p>
                  <p><strong>Reason:</strong> {leave.reason || "N/A"}</p>
                  <p><strong>Status:</strong> {leave.status}</p>
                  <p><strong>Reviewed By:</strong> {leave.reviewedBy?.username || "Pending"}</p>
                  <p><strong>Reviewed At:</strong> {leave.reviewedAt ? new Date(leave.reviewedAt).toLocaleString() : "Not reviewed yet"}</p>
                  <p>
                    <strong>Leave Taken:</strong><br />
                    Earned: {empLeaves.earnedDays.size} | Sick: {empLeaves.sickDays.size} | Casual: {empLeaves.casualDays.size}
                  </p>

                  {(leave.latitude && leave.longitude) || leave.ipAddress ? (
  <div className="mt-2 text-sm text-gray-700">
    
    
    {(leave.latitude && leave.longitude) && (
  <div className="flex flex-col sm:flex-row gap-2 mt-2">
    <button
      onClick={() =>
        setSelectedLocation({
          latitude: leave.latitude,
          longitude: leave.longitude,
        })
      }
      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
    >
      View Location
    </button>
    <button
      onClick={() => {
        const ip = leave.ipAddress === "::1" ? "127.0.0.1" : leave.ipAddress?.replace(/\.\d+$/, ".xxx");
        toast(
          `📍 Leave Applied From:\nLatitude: ${leave.latitude.toFixed(4)}\nLongitude: ${leave.longitude.toFixed(4)}\nIP Address: ${ip}`
        );
      }}
      className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
    >
      More Info
    </button>
  </div>
)}

  </div>
) : null}


                  <div className="flex gap-2 mt-2">
                    <button
                      disabled={leave.status !== "Pending" || approvingLeaveId === leave._id}
                      onClick={() => handleApprove(leave._id)}
                      className={`flex-1 px-3 py-1 text-white rounded ${
                        leave.status !== "Pending" ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {approvingLeaveId === leave._id ? "..." : "Approve"}
                    </button>
                    <button
                      disabled={leave.status !== "Pending" || rejectingNowId === leave._id}
                      onClick={() => setRejectingLeaveId(leave._id)}
                      className={`flex-1 px-3 py-1 text-white rounded ${
                        leave.status !== "Pending" ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {rejectingNowId === leave._id ? "..." : "Reject"}
                    </button>
                    

                  </div>
                </div>
              );
            })}
          </div>
        )}

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
                  className="px-4 py-1 bg-red-600 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Google Map Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="relative w-[90vw] h-[80vh] bg-white rounded shadow-lg overflow-hidden">
            <button
              className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded z-10"
              onClick={() => setSelectedLocation(null)}
            >
              Close
            </button>
            <iframe
  title="Employee Location"
  width="100%"
  height="100%"
  style={{ border: 0 }}
  loading="lazy"
  allowFullScreen
  referrerPolicy="no-referrer-when-downgrade"
  src={`https://maps.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}&z=14&output=embed`}
/>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ManageLeaves;
