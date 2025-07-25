import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeNavbar from "../components/EmployeeNavbar";
import { useEmployeeSession } from "../hooks/useEmployeeSession";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import Footer from "../components/Footer";

const COLORS = ["#0088FE", "#FF8042", "#00C49F"];

const EmployeeDashboard = () => {
  const { employee, loading } = useEmployeeSession();
  const navigate = useNavigate();

  const [leaveStats, setLeaveStats] = useState({
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    earnedTaken: 0,
    sickTaken: 0,
    casualTaken: 0,
    pendingEarned: 0,
    pendingSick: 0,
    pendingCasual: 0,
  });

  const maxEarned = 20, maxSick = 15, maxCasual = 12;

  // Handle session expiry
  useEffect(() => {
    if (!loading && !employee) {
      navigate("/employee/login", {
        state: { message: "Session expired. Please login again." },
        replace: true,
      });
    }
  }, [employee, loading, navigate]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8000/api/employee/logout", {}, { withCredentials: true });
      navigate("/employee/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useEffect(() => {
    const fetchLeaveStats = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/employee/my-leaves", {
          withCredentials: true,
        });
        const leaves = res.data;

        const approvedDates = { earned: new Set(), sick: new Set(), casual: new Set() };
        const pendingDates = { earned: new Set(), sick: new Set(), casual: new Set() };

        let approvedCount = 0, rejectedCount = 0, pendingCount = 0;

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

        for (const leave of leaves) {
          const status = leave.status?.toLowerCase();
          const type = leave.leaveType?.toLowerCase();
          if (!status || !type) continue;

          if (status === "approved") approvedCount++;
          else if (status === "rejected") rejectedCount++;
          else if (status === "pending") pendingCount++;

          const leaveDates = getDatesInRange(leave.startDate, leave.endDate);

          if (status === "approved") {
            if (type.includes("earned")) leaveDates.forEach(d => approvedDates.earned.add(d));
            else if (type.includes("sick")) leaveDates.forEach(d => approvedDates.sick.add(d));
            else if (type.includes("casual")) leaveDates.forEach(d => approvedDates.casual.add(d));
          } else if (status === "pending") {
            if (type.includes("earned")) leaveDates.forEach(d => pendingDates.earned.add(d));
            else if (type.includes("sick")) leaveDates.forEach(d => pendingDates.sick.add(d));
            else if (type.includes("casual")) leaveDates.forEach(d => pendingDates.casual.add(d));
          }
        }

        setLeaveStats({
          approvedCount,
          rejectedCount,
          pendingCount,
          earnedTaken: approvedDates.earned.size,
          sickTaken: approvedDates.sick.size,
          casualTaken: approvedDates.casual.size,
          pendingEarned: pendingDates.earned.size,
          pendingSick: pendingDates.sick.size,
          pendingCasual: pendingDates.casual.size,
        });
      } catch (err) {
        console.error("Failed to load leave stats:", err);
      }
    };

    if (employee) fetchLeaveStats();
  }, [employee]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!employee) return null;

  const remainingEarned = maxEarned - leaveStats.earnedTaken - leaveStats.pendingEarned;
  const remainingSick = maxSick - leaveStats.sickTaken - leaveStats.pendingSick;
  const remainingCasual = maxCasual - leaveStats.casualTaken - leaveStats.pendingCasual;

  const leaveTypeData = [
    {
      name: "Earned Leave",
      data: [
        { name: "Taken", value: leaveStats.earnedTaken },
        { name: "Pending", value: leaveStats.pendingEarned },
        { name: "Remaining", value: Math.max(0, remainingEarned) },
      ],
    },
    {
      name: "Sick Leave",
      data: [
        { name: "Taken", value: leaveStats.sickTaken },
        { name: "Pending", value: leaveStats.pendingSick },
        { name: "Remaining", value: Math.max(0, remainingSick) },
      ],
    },
    {
      name: "Casual Leave",
      data: [
        { name: "Taken", value: leaveStats.casualTaken },
        { name: "Pending", value: leaveStats.pendingCasual },
        { name: "Remaining", value: Math.max(0, remainingCasual) },
      ],
    },
  ];

  const statusData = [
    { name: "Approved", value: leaveStats.approvedCount },
    { name: "Pending", value: leaveStats.pendingCount },
    { name: "Rejected", value: leaveStats.rejectedCount },
  ];

  const getProgressColor = (taken, total) => {
    const remainingRatio = (total - taken) / total;
    if (remainingRatio > 0.5) return "bg-green-500";
    if (remainingRatio > 0.25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div>
      <EmployeeNavbar onLogout={handleLogout} />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Welcome, {employee.username}!</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Approved", value: leaveStats.approvedCount, color: "bg-green-600" },
            { label: "Pending", value: leaveStats.pendingCount, color: "bg-yellow-500" },
            { label: "Rejected", value: leaveStats.rejectedCount, color: "bg-red-500" },
          ].map((stat, idx) => (
            <div key={idx} className={`p-3 rounded shadow text-white ${stat.color}`}>
              <h4 className="text-md font-semibold">{stat.label} Leaves</h4>
              <p className="text-xl mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        <div className="bg-white shadow rounded p-4 mb-4">
          <h2 className="text-md font-semibold mb-2">Leave Status Overview</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} label dataKey="value">
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Type Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {leaveTypeData.map((type, idx) => (
            <div key={idx} className="bg-white shadow p-4 rounded">
              <h3 className="text-sm font-semibold mb-2">{type.name}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={type.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                    {type.data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="bg-white shadow rounded p-4 mb-6 max-w-md mx-auto">
          <h2 className="text-md font-semibold mb-2 text-center">Leave Taken Comparison</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={[
                { name: "Earned", Taken: leaveStats.earnedTaken },
                { name: "Sick", Taken: leaveStats.sickTaken },
                { name: "Casual", Taken: leaveStats.casualTaken },
              ]}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Taken">
                <Cell fill="#00C49F" />
                <Cell fill="#FF8042" />
                <Cell fill="#0088FE" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Bars */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-md font-semibold mb-2">Leave Usage Progress</h2>
          {[
            { type: "Earned", taken: leaveStats.earnedTaken, total: maxEarned },
            { type: "Sick", taken: leaveStats.sickTaken, total: maxSick },
            { type: "Casual", taken: leaveStats.casualTaken, total: maxCasual },
          ].map((leave, idx) => {
            const percent = Math.min(100, (leave.taken / leave.total) * 100);
            const progressColor = getProgressColor(leave.taken, leave.total);

            return (
              <div key={idx} className="mb-3">
                <div className="flex justify-between mb-1 text-sm">
                  <span>{leave.type} Leave</span>
                  <span>{leave.taken} / {leave.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${progressColor} h-3 rounded-full`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EmployeeDashboard;
