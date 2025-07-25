import React from "react";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import Card from "../components/Card"; // ✅ Ensure this is present at the top

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <MainNavbar />

      <main className="flex-grow px-6 md:px-16 py-12 bg-gray-50">
        {/* Header */}
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-indigo-700">
            About <span className="text-purple-600">ELMS</span>
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            The <strong>Employee Leave Management System (ELMS)</strong> is a secure and user-friendly web application designed to streamline leave requests and approvals across your organization.
            With dedicated portals for <strong>Admins</strong>, <strong>HRs</strong>, and <strong>Employees</strong>, ELMS ensures transparency, efficiency, and accountability at every level.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Admin */}
          <div className="bg-white border-t-4 border-indigo-500 rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
            <h3 className="text-xl font-bold mb-3 text-indigo-600">Admin</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Register, approve or remove HRs and Employees</li>
              <li>Full access to dashboards and analytics</li>
              <li>Manage global leave policies and holidays</li>
              <li>Monitor all leave activity across departments</li>
            </ul>
          </div>

          {/* HR */}
          <div className="bg-white border-t-4 border-green-500 rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
            <h3 className="text-xl font-bold mb-3 text-green-600">HR</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Manage employee records in their department</li>
              <li>Review and process leave applications</li>
              <li>Track leave history and statistics</li>
              <li>Export leave data to Excel reports</li>
            </ul>
          </div>

          {/* Employee */}
          <div className="bg-white border-t-4 border-purple-500 rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
            <h3 className="text-xl font-bold mb-3 text-purple-600">Employee</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Apply for Earned, Sick, or Casual leaves</li>
              <li>Track leave status and remaining balance</li>
              <li>Receive HR notifications and events</li>
              <li>Update personal profile & view history</li>
            </ul>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-20 text-center max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Why Choose <span className="text-indigo-600">ELMS</span>?
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            ELMS eliminates manual paperwork and improves organizational productivity by automating the leave lifecycle.
            From seamless tracking to advanced reporting, it supports smart decision-making and compliance.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm">
              Role-Based Access
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium text-sm">
              Real-Time Notifications
            </span>
            <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-medium text-sm">
              Downloadable Reports
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium text-sm">
              Leave Statistics & Charts
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium text-sm">
              Department-wise Management
            </span>
          </div>
        </div>
      </main>

      
       <div className="flex justify-center mt-16">
  <Card />
</div>
<Footer />
    </div>
  );
};

export default About;
