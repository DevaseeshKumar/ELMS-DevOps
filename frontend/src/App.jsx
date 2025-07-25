import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHRApproval from "./pages/AdminHRApproval";

import HRRegister from "./pages/HRRegister";
import HRLogin from "./pages/HRLogin";
import HRForgotPassword from "./pages/HRForgotPassword";
import HRResetPassword from "./pages/HRResetPassword";
import HrDashboard from "./pages/HrDashboard";
import EmployeeForgotPassword from "./pages/EmployeeForgotPassword";
import EmployeeResetPassword from "./pages/EmployeeResetPassword";
import AddEmployee from "./pages/AddEmployee";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ApplyLeave from "./pages/ApplyLeave";
import ManageLeaves from "./pages/ManageLeaves";
import LeaveHistory from "./pages/LeaveHistory";
import EmployeeProfile from "./pages/EmployeeProfile";
import UpdateProfile from "./pages/UpdateProfile";
import AdminProfile from "./pages/AdminProfile";
import ViewHRs from "./pages/ViewHRs";
import UpdateHR from "./pages/UpdateHR";
import ViewEmployees from "./pages/ViewEmployees";
import UpdateEmployee from "./pages/UpdateEmployee";
import HRManageLeaves from "./pages/HRManageLeaves";
import HRProfile from "./pages/HRProfile";
import HrViewEmployees from "./pages/HrViewEmployees";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import About from "./pages/About";
import EmailSupport from './pages/EmailSupport';
import ReportBug from './pages/ReportBug';
import Support from "./pages/Support";
import Help from "./pages/Help";
import NotFoundTV from "./pages/NotFoundTV";
export default function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/login/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/hr-approvals" element={<AdminHRApproval />} />
          <Route path="/admin/leave-decision/:leaveId" element={<ManageLeaves />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/view-hrs" element={<ViewHRs />} />
          <Route path="/admin/update-hr/:hrId" element={<UpdateHR />} />
          <Route path="/admin/manage-employees" element={<ViewEmployees />} />
          <Route path="/admin/update-employee/:id" element={<UpdateEmployee />} />
          <Route path="/admin/add-employee" element={<AddEmployee />} />

          {/* HR Routes */}
          <Route path="/hr/register" element={<HRRegister />} />
          <Route path="/hr/login" element={<HRLogin />} />
          <Route path="/hr/forgot-password" element={<HRForgotPassword />} />
          <Route path="/hr/reset-password/:token" element={<HRResetPassword />} />
          <Route path="/hr/dashboard" element={<HrDashboard />} />
          <Route path="/hr/manage-leaves" element={<HRManageLeaves />} />
          <Route path="/hr/profile" element={<HRProfile />} />
          <Route path="/hr/leave-requests" element={<HRManageLeaves />} />
          <Route path="/hr/hr-employees" element={<HrViewEmployees />} />

          {/* Employee Routes */}
          <Route path="/employee/forgot-password" element={<EmployeeForgotPassword />} />
          <Route path="/employee/reset-password/:token" element={<EmployeeResetPassword />} />
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/apply-leave" element={<ApplyLeave />} />
          <Route path="/employee/leave-history" element={<LeaveHistory />} />
          <Route path="/employee/my-profile" element={<EmployeeProfile />} />
          <Route path="/employee/update-profile" element={<UpdateProfile />} />

          <Route path="/email-support" element={<EmailSupport />} />
        <Route path="/support" element={<Support />} />
        <Route path="/report-bug" element={<ReportBug />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<NotFoundTV />} />
        </Routes>

        {/* Global ToastContainer (always active) */}
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </div>
    </BrowserRouter>
  );
}
