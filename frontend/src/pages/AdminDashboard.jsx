import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";

import { useAdminSession } from "../hooks/useAdminSession";
import { ToastContainer, toast } from "react-toastify";
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Legend, ResponsiveContainer
} from "recharts";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import html2canvas from "html2canvas";
import "react-toastify/dist/ReactToastify.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const AdminDashboard = () => {
  const { admin, loading } = useAdminSession();
  const navigate = useNavigate();
  const dashboardRef = useRef(null);

  const [employeeCount, setEmployeeCount] = useState(0);
  const [hrCount, setHRCount] = useState(0);
  const [leaveCounts, setLeaveCounts] = useState({ earned: 0, sick: 0, casual: 0 });
  const [monthlyLeaves, setMonthlyLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [leavePerEmployee, setLeavePerEmployee] = useState([]);
  const [clickedLeaveType, setClickedLeaveType] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Session expiry and redirect logic:
  useEffect(() => {
    // If loading done and no admin session, show toast and redirect immediately
    if (!loading && !admin) {
      toast.warn("Session expired. Please login again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        pauseOnHover: false,
        closeOnClick: true,
      });
      // Use setTimeout for a short delay so toast shows briefly before redirect
      const timeoutId = setTimeout(() => {
        navigate("/admin/login", { replace: true });
      }, 1500);

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeoutId);
    }
  }, [admin, loading, navigate]);

  // Fetch dashboard data only if admin session exists
  useEffect(() => {
    if (admin) fetchDashboardData();
  }, [admin]);

  const fetchDashboardData = async () => {
    try {
      const empRes = await fetch("http://localhost:8000/api/admin/employees", { credentials: "include" });
      const empData = await empRes.json();
      setEmployeeCount(empData.length);

      const hrRes = await fetch("http://localhost:8000/api/admin/hrs", { credentials: "include" });
      const hrData = await hrRes.json();
      setHRCount(hrData.length);

      const combinedUsers = [
        ...empData.map((e) => ({ name: e.username, role: "Employee", email: e.email })),
        ...hrData.map((h) => ({ name: h.username, role: "HR", email: h.email }))
      ];
      setUsers(combinedUsers);

      const leaveRes = await axios.get("http://localhost:8000/api/admin/leaves", { withCredentials: true });
      const leaves = leaveRes.data;
      const empMap = {};
      const monthlyMap = Array(12).fill(0);
      let totalEarned = 0, totalSick = 0, totalCasual = 0;

      const getDatesInRange = (start, end) => {
        const dates = [];
        let current = new Date(start);
        const last = new Date(end);
        while (current <= last) {
          dates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        return dates;
      };

      leaves.forEach((leave) => {
        const emp = leave.employee;
        if (!emp || leave.status !== "Approved") return;

        const days = getDatesInRange(leave.startDate, leave.endDate);
        const dayCount = days.length;
        const type = leave.leaveType?.toLowerCase() || "";

        if (type.includes("earned")) totalEarned += dayCount;
        else if (type.includes("sick")) totalSick += dayCount;
        else if (type.includes("casual")) totalCasual += dayCount;

        days.forEach((d) => {
          const month = new Date(d).getMonth();
          monthlyMap[month]++;
        });

        const empId = emp._id;
        if (!empMap[empId]) {
          empMap[empId] = { name: emp.username, Earned: 0, Sick: 0, Casual: 0 };
        }
        if (type.includes("earned")) empMap[empId].Earned += dayCount;
        else if (type.includes("sick")) empMap[empId].Sick += dayCount;
        else if (type.includes("casual")) empMap[empId].Casual += dayCount;
      });

      setLeaveCounts({ earned: totalEarned, sick: totalSick, casual: totalCasual });
      setMonthlyLeaves(monthLabels.map((label, idx) => ({ month: label, leaves: monthlyMap[idx] })));
      setLeavePerEmployee(Object.values(empMap));
    } catch (err) {
      toast.error("Failed to fetch dashboard data", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const leaveTypeData = [
    { name: "Earned", value: leaveCounts.earned },
    { name: "Sick", value: leaveCounts.sick },
    { name: "Casual", value: leaveCounts.casual },
  ];

  const entityCountData = [
    { name: "Employees", count: employeeCount },
    { name: "HRs", count: hrCount },
  ];

  const filteredUsers = users
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField].toLowerCase();
      const bVal = b[sortField].toLowerCase();
      return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const handleExportCSV = () => {
    const csv = Papa.unparse(users);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "System_Users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("System Users", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Name", "Role", "Email"]],
      body: users.map((u) => [u.name, u.role, u.email]),
    });
    doc.save("System_Users.pdf");
  };

  const handleExportDashboardPDF = () => {
    if (!dashboardRef.current) return;

    const input = dashboardRef.current;
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210; // A4 width mm
    const pdfHeight = 297; // A4 height mm
    const scale = 2;

    html2canvas(input, { scale }).then((canvas) => {
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      const pageCanvas = document.createElement("canvas");
      const pageCtx = pageCanvas.getContext("2d");
      const dpi = window.devicePixelRatio || 1;

      const mmToPx = (mm) => Math.floor(mm * dpi * (96 / 25.4));

      const pageHeightPx = mmToPx(pdfHeight);

      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;

      while (heightLeft > 0) {
        pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0,
          (position / pdfWidth) * canvas.width,
          canvas.width,
          pageHeightPx,
          0,
          0,
          canvas.width,
          pageHeightPx
        );

        const imgData = pageCanvas.toDataURL("image/png");

        if (position > 0) pdf.addPage();

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, pdfHeight);

        heightLeft -= pdfHeight;
        position += pdfHeight;
      }

      pdf.save("Admin_Dashboard_Multipage.pdf");
    }).catch(() => {
      toast.error("Failed to export dashboard as PDF", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    });
  };

  // Show a loading or redirect message while session check is happening or if session expired
  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  if (!loading && !admin) {
    // Show a message while redirecting (avoid white screen)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700 text-lg">Session expired. Redirecting to login...</p>
        <ToastContainer position="top-right" />
      </div>
    );
  }

  // If admin session valid, show the dashboard UI:
  return (
    <div>
      <AdminNavbar />
      <ToastContainer position="top-right" />
      <div ref={dashboardRef} className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, Admin!</h2>
        <p className="text-gray-600 mb-6">Here’s an overview of your organization.</p>

        <div className="mb-4 flex justify-end space-x-2">
          <button
            onClick={handleExportDashboardPDF}
            className="bg-green-600 text-white px-3 py-1 rounded"
            title="Export entire dashboard as PDF"
          >
            Export Dashboard PDF
          </button>
          <button onClick={handleExportCSV} className="bg-blue-600 text-white px-3 py-1 rounded">
            Export Users CSV
          </button>
          <button onClick={handleExportPDF} className="bg-red-600 text-white px-3 py-1 rounded">
            Export Users PDF
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-bold mb-2">Leave Distribution (Click to View Details)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={leaveTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  onClick={(data) => setClickedLeaveType(data.name)}
                >
                  {leaveTypeData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {clickedLeaveType && (
              <div className="mt-4 text-sm text-gray-700 max-h-40 overflow-y-auto">
                <strong>{clickedLeaveType} Leave Taken By:</strong>
                <ul className="list-disc list-inside">
                  {leavePerEmployee
                    .filter((emp) => emp[clickedLeaveType])
                    .map((emp, idx) => (
                      <li key={idx}>
                        {emp.name} — {emp[clickedLeaveType]} days
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-bold mb-2">System Users</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={entityCountData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-bold mb-2">Monthly Leaves</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyLeaves}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leaves" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <h3 className="text-lg font-bold mb-2">Leaves Per Employee</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={leavePerEmployee}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Earned" fill="#00C49F" />
                <Bar dataKey="Sick" fill="#FF8042" />
                <Bar dataKey="Casual" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">All System Users</h3>
          </div>

          <input
            type="text"
            placeholder="Search users..."
            className="mb-2 border px-2 py-1 rounded w-full md:w-1/3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm border">
              <thead>
                <tr className="bg-gray-200">
                  <th
                    className="cursor-pointer px-3 py-2"
                    onClick={() => {
                      setSortField("name");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Name {sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th
                    className="cursor-pointer px-3 py-2"
                    onClick={() => {
                      setSortField("role");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Role {sortField === "role" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">{user.name}</td>
                      <td className="px-3 py-2">{user.role}</td>
                      <td className="px-3 py-2">{user.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>  
      <Footer />
    </div>
    
  );
};

export default AdminDashboard;
