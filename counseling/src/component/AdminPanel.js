import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { RefreshCcw, Bell, Loader2 } from "lucide-react";

const StatusBadge = ({ status }) => {
  let colorClass = "";
  switch (status) {
    case "PENDING":
      colorClass = "bg-yellow-100 text-yellow-800";
      break;
    case "APPROVED":
      colorClass = "bg-green-100 text-green-800";
      break;
    case "REJECTED":
      colorClass = "bg-red-100 text-red-800";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colorClass}`}
    >
      {status.toLowerCase().replace(/_/g, " ")}
    </span>
  );
};

function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const ToastifyCSS =
    "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/8.0.3/ReactToastify.css";

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/change-requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      toast.error("Failed to load change requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <>
      <link rel="stylesheet" href={ToastifyCSS} />
      <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Counselor Change Requests
            </h2>
            <button
              onClick={fetchRequests}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-900 transition-colors"
            >
              <RefreshCcw size={18} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Requests Found
              </h3>
              <p className="text-gray-500">
                There are no counselor change requests right now.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Counselor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {req.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.student?.name} <br />
                        <span className="text-xs text-gray-400">
                          {req.student?.studentId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.student.counselor.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {req.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminPanel;
