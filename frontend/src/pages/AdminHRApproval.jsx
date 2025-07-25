import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import { useAdminSession } from "../hooks/useAdminSession";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

const AdminHRApproval = () => {
  const { admin, loading } = useAdminSession();
  const navigate = useNavigate();

  const [hrs, setHRs] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHRs = async () => {
    setIsLoading(true);
    setFetchError(false);
    try {
      const res = await axios.get("http://localhost:8000/api/admin/pending-hrs", {
        withCredentials: true,
      });
      setHRs(res.data);
    } catch (err) {
      console.error("Error fetching HRs:", err);
      toast.error("Failed to fetch HRs", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setFetchError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !admin) {
      toast.warn("Session expired. Please login again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      setTimeout(() => {
        navigate("/admin/login", { state: { message: "Session expired" } });
      }, 100);
    }
  }, [admin, loading, navigate]);

  useEffect(() => {
    if (admin) fetchHRs();
  }, [admin]);

  const handleAction = async (hrId, approve) => {
    try {
      const res = await axios.put(
        `http://localhost:8000/api/admin/hr-status/${hrId}`,
        { approve },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Action completed", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
      fetchHRs();
    } catch (err) {
      console.error("Action error:", err);
      toast.error("Action failed", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!admin) return null;

  return (
    <div>
      <AdminNavbar />
      <ToastContainer />
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Pending HR Approvals</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded shadow p-6 h-40">
                <div className="bg-gray-200 h-6 w-2/3 mb-2 rounded" />
                <div className="bg-gray-200 h-4 w-1/2 mb-1 rounded" />
                <div className="bg-gray-200 h-4 w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <p className="text-red-600 font-medium">Failed to load HRs. Please try again later.</p>
        ) : hrs.length === 0 ? (
          <p className="text-gray-600">No pending HRs.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hrs.map((hr) => (
              <div
                key={hr._id}
                className="bg-white p-5 rounded shadow hover:shadow-lg transition duration-300 border border-gray-200 hover:border-blue-400"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{hr.username}</h3>
                <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {hr.email}</p>
                <p className="text-sm text-gray-600 mb-1"><strong>Phone:</strong> {hr.phone}</p>
                <p className="text-sm text-gray-600 mb-3"><strong>Department:</strong> {hr.department}</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAction(hr._id, true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(hr._id, false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminHRApproval;
