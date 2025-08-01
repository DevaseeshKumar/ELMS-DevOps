import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { useAdminSession } from "../hooks/useAdminSession";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ToastContainer, toast } from "react-toastify";
import { FaUsers } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";
import QRCode from "react-qr-code";

const ViewHRs = () => {
  const { admin, loading } = useAdminSession();
  const navigate = useNavigate();
  const [hrs, setHRs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedHR, setSelectedHR] = useState(null);

  // ✅ For QR Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [qrTimestamp, setQrTimestamp] = useState("");

  useEffect(() => {
    if (!loading && !admin) {
      toast.warn("Session expired. Please login again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setTimeout(() => navigate("/admin/login"), 1000);
    }
  }, [admin, loading, navigate]);

  useEffect(() => {
    if (admin) fetchHRs();
  }, [admin]);

  const fetchHRs = async () => {
    try {
      setIsLoading(true);
      setFetchError(false);
      const res = await fetch("http://localhost:8000/api/admin/hrs", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch HRs");

      const data = await res.json();
      setHRs(data);
      setTotalCount(data.length);
    } catch (err) {
      console.error("Fetch error:", err);
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

  const handleDelete = async () => {
    if (!selectedHR) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/hr/${selectedHR._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        const updated = hrs.filter((hr) => hr._id !== selectedHR._id);
        setHRs(updated);
        setTotalCount(updated.length);
        toast.success("HR deleted successfully", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } else {
        toast.error("Failed to delete HR", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setShowModal(false);
      setSelectedHR(null);
    }
  };

  const updateHR = (hrId) => {
    navigate(`/admin/update-hr/${hrId}`);
  };

  const exportToExcel = () => {
    const data = hrs.map((hr) => ({
      Username: hr.username,
      Email: hr.email,
      Phone: hr.phone,
      Department: hr.department,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HRs");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, "HRs_List.xlsx");
  };

  const GradientInitials = ({ name }) => {
    const colors = [
      "from-purple-500 to-indigo-600",
      "from-pink-500 to-red-600",
      "from-green-400 to-teal-500",
      "from-yellow-400 to-orange-500",
    ];
    const colorClass = colors[name.charCodeAt(0) % colors.length];
    return (
      <div
        className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-xl`}
        title={name}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <ToastContainer position="top-right" />

        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-extrabold text-gray-800">All HRs</h2>
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 transition text-white px-5 py-2 rounded-md shadow-md font-semibold"
            >
              Download Excel
            </button>
          </div>

          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-5 bg-white p-6 rounded-xl shadow-lg">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded-full text-3xl">
                <FaUsers />
              </div>
              <div>
                <p className="text-sm uppercase font-semibold text-gray-500">Total HRs</p>
                <p className="text-3xl font-extrabold text-gray-800">{totalCount}</p>
              </div>
            </div>
          </div>

          {/* HR Cards */}
          {isLoading ? (
            <div className="text-center text-gray-600 text-lg">Loading HR data...</div>
          ) : fetchError ? (
            <p className="text-center text-red-600 font-semibold text-lg">
              Failed to load HRs. Please try again later.
            </p>
          ) : hrs.length === 0 ? (
            <p className="text-center text-gray-700 text-lg">No HRs found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {hrs.map((hr) => (
                <div
                  key={hr._id}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-md"
                >
                  <div className="flex items-center gap-5">
                    {hr.profileImage ? (
                      <img
                        src={`http://localhost:8000${hr.profileImage}`}
                        alt="HR"
                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
                      />
                    ) : (
                      <GradientInitials name={hr.username || "U"} />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{hr.username}</h3>
                      <p className="text-sm text-gray-500 truncate">{hr.email}</p>
                      <p className="text-sm text-gray-500">{hr.phone || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-5 text-sm text-gray-700 space-y-2">
                    <p>
                      <span className="font-semibold">Department:</span> {hr.department || "N/A"}
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
  <button
    onClick={() => updateHR(hr._id)}
    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
  >
    Update
  </button>
  <button
    onClick={() => {
      setSelectedHR(hr);
      setShowModal(true);
    }}
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
  >
    Delete
  </button>
  <button
    onClick={() => {
      const timestamp = new Date().toLocaleString();
const qrContent = `HR Details:
ID: ${hr._id}
Username: ${hr.username}
Email: ${hr.email}
Department: ${hr.department || "N/A"}
Generated At: ${timestamp}

View Profile: http://localhost:8000/hr/${hr._id}`;

setQrValue(qrContent);
setQrTimestamp(timestamp);
      setQrModalOpen(true);
    }}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
  >
    Show QR
  </button>
</div>

                  </div>

                  
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Delete Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Deletion</h3>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete HR <strong>{selectedHR?.username}</strong>?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedHR(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ QR Code Modal */}
        {/* QR Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4 text-center">HR QR Code</h2>
            <QRCode value={qrValue} size={150} className="mx-auto" />
            <p className="text-xs mt-2 text-center text-gray-500">Generated: {qrTimestamp}</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setQrModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </>
  );
};

export default ViewHRs;
