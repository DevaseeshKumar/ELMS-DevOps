import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { useAdminSession } from "../hooks/useAdminSession";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ToastContainer, toast } from "react-toastify";
import { FaUserTie } from "react-icons/fa"; // ✅ Added employee icon
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const ViewEmployees = () => {
  const { admin, loading } = useAdminSession();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [leavesByEmployee, setLeavesByEmployee] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !admin) {
      toast.warn("Session expired. Please login again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setTimeout(() => {
        navigate("/admin/login");
      }, 1000);
    }
  }, [admin, loading, navigate]);

  useEffect(() => {
    if (admin) fetchData();
  }, [admin]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await fetchEmployees();
      await fetchLeaves();
    } catch (err) {
      toast.error("Failed to load data", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    const res = await fetch("http://localhost:8000/api/admin/employees", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch employees");
    const data = await res.json();
    setEmployees(data);
    setEmployeeCount(data.length);
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
    const res = await fetch("http://localhost:8000/api/admin/leaves", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch leaves");
    const leaves = await res.json();

    const empMap = {};
    leaves.forEach((leave) => {
      if (!leave.employee?._id) return;
      const empId = leave.employee._id;

      if (!empMap[empId]) {
        empMap[empId] = {
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
  };

  const deleteEmployee = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:8000/api/admin/employee/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const updated = employees.filter((emp) => emp._id !== id);
        setEmployees(updated);
        setEmployeeCount(updated.length);
        toast.success("Employee deleted successfully", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } else {
        toast.error("Delete failed", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Server error while deleting.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const updateEmployee = (id) => {
    navigate(`/admin/update-employee/${id}`);
  };

  const exportToExcel = () => {
    const data = employees.map((emp) => {
      const leaveSummary = leavesByEmployee[emp._id] || {
        earnedDays: new Set(),
        sickDays: new Set(),
        casualDays: new Set(),
      };

      return {
        Username: emp.username,
        EmployeeID: emp.employeeId,
        Email: emp.email,
        Phone: emp.phone,
        Gender: emp.gender,
        Department: emp.department,
        "Earned Leave Taken": leaveSummary.earnedDays.size,
        "Sick Leave Taken": leaveSummary.sickDays.size,
        "Casual Leave Taken": leaveSummary.casualDays.size,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, "Employees_List.xlsx");
  };

  return (
    <div>
      <AdminNavbar />
      <ToastContainer position="top-right" />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">All Employees</h2>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Download Excel
          </button>
        </div>

        {/* Total Employees Card with Icon */}
        <div className="flex justify-center mb-10">
  <div className="flex items-center gap-5 bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 max-w-sm w-full">
    <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white p-3 rounded-full text-3xl">
      <FaUserTie />
    </div>
    <div>
      <p className="text-sm uppercase tracking-wide font-semibold text-gray-500">
        Total Employees
      </p>
      <p className="text-3xl font-extrabold text-gray-800">{employeeCount}</p>
    </div>
  </div>
</div>


        {/* Cards */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-gray-200 rounded w-full" />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <p className="text-center text-gray-600">No employees found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((emp) => {
              const leaveSummary = leavesByEmployee[emp._id] || {
                earnedDays: new Set(),
                sickDays: new Set(),
                casualDays: new Set(),
              };
              return (
                <div
                  key={emp._id}
                  className="bg-white border border-gray-200 rounded-lg p-5 shadow hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center gap-4">
                    {emp.profileImage ? (
                      <img
                        src={`http://localhost:8000${emp.profileImage}`}
                        alt="Employee"
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl select-none">
                        {emp.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold">{emp.username}</h3>
                      <p className="text-sm text-gray-500">{emp.email}</p>
                      <p className="text-sm text-gray-500">{emp.phone}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-700 space-y-1">
                    <p><strong>Employee ID:</strong> {emp.employeeId}</p>
                    <p><strong>Gender:</strong> {emp.gender}</p>
                    <p><strong>Department:</strong> {emp.department}</p>
                    <p><strong>Earned Leave Taken:</strong> <span className="text-green-700 font-semibold">{leaveSummary.earnedDays.size}</span></p>
                    <p><strong>Sick Leave Taken:</strong> <span className="text-red-600 font-semibold">{leaveSummary.sickDays.size}</span></p>
                    <p><strong>Casual Leave Taken:</strong> <span className="text-yellow-600 font-semibold">{leaveSummary.casualDays.size}</span></p>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => updateEmployee(emp._id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => deleteEmployee(emp._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ViewEmployees;
