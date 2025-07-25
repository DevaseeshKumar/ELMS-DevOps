import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHRSession } from "../hooks/useHRSession";
import HRNavbar from "../components/HRNavbar";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Footer from "../components/Footer";

const COLORS = ["#00C49F", "#FF8042", "#0088FE"];

const HrDashboard = () => {
  const { hr, loading } = useHRSession();
  const navigate = useNavigate();

  const [leaveData, setLeaveData] = useState([]);
  const [totalLeaveCounts, setTotalLeaveCounts] = useState({
    Earned: 0,
    Sick: 0,
    Casual: 0,
  });
  const [monthlyLeaveData, setMonthlyLeaveData] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    if (!loading && !hr) {
      navigate("/hr/login", {
        state: { message: "Session expired. Please login again." },
      });
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

      const empMap = {};
      const monthMap = {};
      let totalEarned = 0, totalSick = 0, totalCasual = 0;

      res.data.forEach((leave) => {
        const emp = leave.employee;
        if (!emp || leave.status !== "Approved") return;

        const empId = emp._id;
        const days = getDatesInRange(leave.startDate, leave.endDate).length;
        const type = (leave.leaveType || "").toLowerCase();
        const month = new Date(leave.startDate).toLocaleString("default", { month: "short" });

        if (!empMap[empId]) {
          empMap[empId] = { name: emp.username, email: emp.email, Earned: 0, Sick: 0, Casual: 0 };
        }

        if (!monthMap[month]) monthMap[month] = 0;
        monthMap[month] += days;

        if (type.includes("earned")) {
          empMap[empId].Earned += days;
          totalEarned += days;
        } else if (type.includes("sick")) {
          empMap[empId].Sick += days;
          totalSick += days;
        } else if (type.includes("casual")) {
          empMap[empId].Casual += days;
          totalCasual += days;
        }
      });

      setLeaveData(Object.values(empMap));
      setTotalLeaveCounts({ Earned: totalEarned, Sick: totalSick, Casual: totalCasual });
      setEmployeeCount(Object.keys(empMap).length);

      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedMonthData = monthOrder.map((m) => ({
        month: m,
        leaves: monthMap[m] || 0,
      }));
      setMonthlyLeaveData(formattedMonthData);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  if (loading || !hr) return null;

  const pieData = [
    { name: "Earned", value: totalLeaveCounts.Earned },
    { name: "Sick", value: totalLeaveCounts.Sick },
    { name: "Casual", value: totalLeaveCounts.Casual },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HRNavbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">HR Dashboard</h1>
        <p className="text-gray-600 mb-6">Overview of leave trends and employees</p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Leave Type Pie */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Leave Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  cx="50%"
                  cy="50%"
                  label
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leave per Employee Bar */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Leave Per Employee</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={leaveData}>
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

        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Line */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Monthly Leave Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyLeaveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leaves" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Employee Count */}
          <div className="bg-white p-4 rounded shadow">
  <h2 className="text-lg font-semibold mb-2 text-center">Employees with Approved Leaves</h2>
  <p className="text-4xl font-bold text-green-600 text-center mb-4">{employeeCount}</p>
  <div className="overflow-x-auto max-h-60 overflow-y-auto">
    <table className="min-w-full text-sm text-left border">
      <thead className="bg-gray-100 sticky top-0">
        <tr>
          <th className="border px-4 py-2">Name</th>
          <th className="border px-4 py-2">Email</th>
        </tr>
      </thead>
      <tbody>
        {leaveData.map((emp, index) => (
          <tr key={index} className="border-b">
            <td className="border px-4 py-2">{emp.name}</td>
            <td className="border px-4 py-2">{emp.email || "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HrDashboard;
