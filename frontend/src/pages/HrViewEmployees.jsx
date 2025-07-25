import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HRNavbar from "../components/HRNavbar";
import { useHRSession } from "../hooks/useHRSession";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const ViewEmployeesHR = () => {
  const { hr, loading } = useHRSession();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState({});

  useEffect(() => {
    if (!loading && !hr) {
      toast.warning("Session expired. Please login again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setTimeout(() => {
        navigate("/hr/login", { replace: true });
      }, 3000);
    }
  }, [hr, loading, navigate]);

  useEffect(() => {
    if (hr) {
      fetchEmployees();
      fetchLeaves();
    }
  }, [hr]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/hr/hr-employees", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      toast.error("Could not load employee list.");
    }
  };

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
      const leaves = res.data;

      const summary = {};
      leaves.forEach((leave) => {
        if (!leave.employee?._id || leave.status !== "Approved") return;

        const empId = leave.employee._id;
        if (!summary[empId]) {
          summary[empId] = {
            earnedDays: new Set(),
            sickDays: new Set(),
            casualDays: new Set(),
          };
        }

        const dates = getDatesInRange(leave.startDate, leave.endDate);
        const type = (leave.leaveType || "").toLowerCase();

        if (type.includes("earned")) {
          dates.forEach((d) => summary[empId].earnedDays.add(d));
        } else if (type.includes("sick")) {
          dates.forEach((d) => summary[empId].sickDays.add(d));
        } else if (type.includes("casual")) {
          dates.forEach((d) => summary[empId].casualDays.add(d));
        }
      });

      setLeaveSummary(summary);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  const exportToExcel = () => {
    const data = employees.map((emp) => {
      const summary = leaveSummary[emp._id] || {
        earnedDays: new Set(),
        sickDays: new Set(),
        casualDays: new Set(),
      };
      return {
        Name: emp.username,
        EmployeeID: emp.employeeId,
        Email: emp.email,
        Phone: emp.phone,
        Gender: emp.gender,
        Department: emp.department,
        "Earned Leave Taken": summary.earnedDays.size,
        "Sick Leave Taken": summary.sickDays.size,
        "Casual Leave Taken": summary.casualDays.size,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, "Employees_HR_View.xlsx");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <HRNavbar />
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">All Employees</h2>
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Download Excel
            </button>
          </div>

          {employees.length === 0 ? (
            <p className="text-gray-500">No employees found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((emp) => {
                const summary = leaveSummary[emp._id] || {
                  earnedDays: new Set(),
                  sickDays: new Set(),
                  casualDays: new Set(),
                };
                return (
                  <div
                    key={emp._id}
                    className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={
                          emp.profileImage
                            ? `http://localhost:8000${emp.profileImage}`
                            : "https://via.placeholder.com/48"
                        }
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {emp.username}
                        </h3>
                        <p className="text-sm text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p><strong>Employee ID:</strong> {emp.employeeId}</p>
                      <p><strong>Phone:</strong> {emp.phone}</p>
                      <p><strong>Gender:</strong> {emp.gender}</p>
                      <p><strong>Department:</strong> {emp.department}</p>
                    </div>
                    <div className="mt-4 text-sm bg-gray-100 p-2 rounded">
                      <p><strong>Earned Leave:</strong> {summary.earnedDays.size} days</p>
                      <p><strong>Sick Leave:</strong> {summary.sickDays.size} days</p>
                      <p><strong>Casual Leave:</strong> {summary.casualDays.size} days</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ViewEmployeesHR;
