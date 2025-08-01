import React from "react";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import Card from "../components/Card";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <MainNavbar />

      <main className="flex-grow px-6 md:px-16 py-12 bg-gray-50">
        {/* Intro Header */}
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-indigo-700">
            About <span className="text-purple-600">Leavo</span>
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            <strong>Leavo</strong> is a modern, secure, and efficient{" "}
            <strong>Employee Leave Management System</strong> designed to automate and simplify the leave process across your organization.
            With dedicated roles for <strong>Admins</strong>, <strong>HRs</strong>, and <strong>Employees</strong>, Leavo promotes transparency, accountability, and ease of use.
          </p>
        </div>

        {/* Role Highlights */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Admin */}
          <div className="bg-white border-t-4 border-indigo-500 rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
            <h3 className="text-xl font-bold mb-3 text-indigo-600">Admin</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Manage and approve HRs and employees</li>
              <li>Oversee organization-wide leave operations</li>
              <li>Control leave policies and holidays</li>
              <li>Access full analytics and system settings</li>
            </ul>
          </div>

          {/* HR */}
          <div className="bg-white border-t-4 border-green-500 rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
            <h3 className="text-xl font-bold mb-3 text-green-600">HR</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Manage departmental employees</li>
              <li>Process and approve leave requests</li>
              <li>Track leave trends and generate reports</li>
              <li>Ensure policy compliance</li>
            </ul>
          </div>

          {/* Employee */}
          <div className="bg-white border-t-4 border-purple-500 rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
            <h3 className="text-xl font-bold mb-3 text-purple-600">Employee</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Apply for Casual, Sick, or Earned leaves</li>
              <li>Track leave status and balances</li>
              <li>Stay informed via real-time alerts</li>
              <li>Maintain and view personal leave history</li>
            </ul>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-20 text-center max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Why Choose <span className="text-indigo-600">Leavo</span>?
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Leavo streamlines every aspect of leave management—from application to approval—while reducing paperwork and manual errors.
            It helps organizations stay compliant, productive, and transparent through a well-structured and user-friendly platform.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm">
              Role-Based Access
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium text-sm">
              Real-Time Alerts
            </span>
            <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-medium text-sm">
              Exportable Reports
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium text-sm">
              Smart Dashboards
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium text-sm">
              Departmental Overview
            </span>
          </div>
        </div>
      </main>

      {/* Team or Mission Card */}
      <div className="flex justify-center mt-16">
        <Card />
      </div>

      <Footer />
    </div>
  );
};

export default About;
