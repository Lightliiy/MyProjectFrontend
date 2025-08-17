import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { RefreshCcw, Bell, Loader2 } from 'lucide-react';

// Reusable component for the status badge
const StatusBadge = ({ status }) => {
  let colorClass = '';
  switch (status) {
    case 'PENDING':
      colorClass = 'bg-yellow-100 text-yellow-800';
      break;
    case 'CLOSED':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case 'ESCALATED_TO_HOD':
      colorClass = 'bg-red-100 text-red-800';
      break;
    case 'ESCALATED_TO_ADMIN':
      colorClass = 'bg-purple-100 text-purple-800';
      break;
    case 'REASSIGNED':
      colorClass = 'bg-blue-100 text-blue-800';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colorClass}`}>
      {status.toLowerCase().replace(/_/g, ' ')}
    </span>
  );
};

function AdminPanel() {
  const [escalatedBookings, setEscalatedBookings] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselors, setSelectedCounselors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // FIX: Load the CSS file from a CDN to prevent build errors
  // This allows the ToastContainer to be styled correctly.
  const ToastifyCSS = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/8.0.3/ReactToastify.css";

  // Fetch all bookings and counselors in parallel on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, counselorsRes] = await Promise.all([
          // The API endpoint was updated to get all bookings
          axios.get("http://localhost:8080/api/bookings"),
          axios.get("http://localhost:8080/api/counselors")
        ]);
        setEscalatedBookings(bookingsRes.data);
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

  // Handle reassigning a counselor to a specific booking
  const handleAssignCounselor = async (bookingId) => {
    const counselorId = selectedCounselors[bookingId];
    if (!counselorId) {
      toast.warn("Please select a counselor first.");
      return;
    }

    setIsUpdating(true);
    try {
      // API call to reassign the counselor
      await axios.post("http://localhost:8080/api/hod/reassign-counselor", null, {
        params: {
          bookingId: bookingId,
          counselorId: counselorId,
        },
      });

      // Find the name of the newly assigned counselor from the list
      const newCounselor = counselors.find(c => c.id === Number(counselorId));
      const newCounselorName = newCounselor?.name || 'Unassigned';

      // Update the bookings to reflect the change
      setEscalatedBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                counselorId: Number(counselorId),
                counselorName: newCounselorName, // Explicitly update the name
                status: 'REASSIGNED',
              }
            : booking
        )
      );

      // Reset the selected counselor for that booking in the dropdown
      setSelectedCounselors((prev) => ({ ...prev, [bookingId]: '' }));
      toast.success(`Counselor successfully reassigned to ${newCounselorName}!`);
    } catch (error) {
      console.error("Reassignment failed:", error);
      toast.error("Failed to reassign counselor. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper function to get the counselor's name from their ID
  const getCounselorName = (booking) => {
    if (booking.counselorName) {
      return booking.counselorName;
    }
    const counselor = counselors.find(c => c.id === Number(booking.counselorId));
    return counselor ? counselor.name : "Unassigned";
  };

  return (
    <>
      <link rel="stylesheet" href={ToastifyCSS} />
      <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              All Bookings
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
          ) : escalatedBookings.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-500">There are no bookings to display at the moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Counselor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HOD Comment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reassign Counselor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {escalatedBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.studentName || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getCounselorName(booking)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{booking.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{booking.hodComment || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={selectedCounselors[booking.id] || ""}
                          onChange={(e) =>
                            setSelectedCounselors((prev) => ({
                              ...prev,
                              [booking.id]: e.target.value,
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
                          onClick={() => handleAssignCounselor(booking.id)}
                          disabled={
                              !selectedCounselors[booking.id] || isUpdating || booking.status !== 'ESCALATED_TO_ADMIN'
                          }
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors ${
                            !selectedCounselors[booking.id] || isUpdating || booking.status !== 'ESCALATED_TO_ADMIN'
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
    </>
  );
}

export default AdminPanel;
