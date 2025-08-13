import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RefreshCcw, Bell, Check, X, Loader2 } from 'lucide-react';

// Reusable component for the status badge
const StatusBadge = ({ status }) => {
  let colorClass = '';
  switch (status) {
    case 'OPEN':
      colorClass = 'bg-yellow-100 text-yellow-800';
      break;
    case 'CLOSED':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case 'ESCALATED_HOD':
    case 'ESCALATED_ADMIN':
      colorClass = 'bg-red-100 text-red-800';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colorClass}`}>
      {status.toLowerCase().replace('_', ' ')}
    </span>
  );
};

function AdminPanel() {
  const [escalatedCases, setEscalatedCases] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselors, setSelectedCounselors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch escalated cases and counselors in parallel
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [casesRes, counselorsRes] = await Promise.all([
          axios.get("http://localhost:8080/api/hod/escalated-to-admin"),
          axios.get("http://localhost:8080/api/counselors")
        ]);
        setEscalatedCases(casesRes.data);
        setCounselors(counselorsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssignCounselor = async (caseId) => {
    const counselorId = selectedCounselors[caseId];
    if (!counselorId) {
      toast.warn("Please select a counselor first.");
      return;
    }

    setIsUpdating(true);
    try {
      await axios.post("http://localhost:8080/api/admin/reassign-counselor", {
        caseId,
        counselorId,
      });

      // Optimistically update the UI
      setEscalatedCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                counselor: counselors.find((cn) => cn.id === +counselorId),
                status: 'OPEN', // Assuming a reassignment re-opens the case
              }
            : c
        )
      );
      toast.success("Counselor reassigned successfully! ✅");
    } catch (error) {
      console.error("Reassignment failed:", error);
      toast.error("Failed to reassign counselor. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Escalated Cases
          </h2>
          <button
            onClick={() => window.location.reload()}
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
        ) : escalatedCases.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Escalated Cases</h3>
            <p className="text-gray-500">All cases are currently being handled by HODs and counselors.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Counselor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reassign Counselor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {escalatedCases.map((case_) => (
                  <tr key={case_.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{case_.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{case_.student?.name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{case_.student?.department || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{case_.counselor?.name || "Not Assigned"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <StatusBadge status={case_.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{case_.issue}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={selectedCounselors[case_.id] || ""}
                        onChange={(e) =>
                          setSelectedCounselors((prev) => ({
                            ...prev,
                            [case_.id]: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="" disabled>Select Counselor</option>
                        {counselors.map((cnsl) => (
                          <option key={cnsl.id} value={cnsl.id}>
                            {cnsl.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => handleAssignCounselor(case_.id)}
                        disabled={!selectedCounselors[case_.id] || isUpdating}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors ${
                          !selectedCounselors[case_.id] || isUpdating
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}
                      >
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isUpdating ? 'Updating...' : 'Reassign'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;