import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Loader, Search, ArrowRight, Eye, Trash2, ArrowUpCircle } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CasePage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isStudentDetailsLoading, setIsStudentDetailsLoading] = useState(false);

  const baseUrl = "http://localhost:8080/api/hod";
  const studentUrl = "http://localhost:8080/api/students";
  const bookingUrl = "http://localhost:8080/api/bookings";

  // Effect to fetch bookings based on the selected filter
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        let url = `${baseUrl}/all-bookings`;
        if (filter === "pending") url = `${baseUrl}/pending-bookings`;
        else if (filter === "escalated") url = `${baseUrl}/escalated-bookings`;

        const response = await axios.get(url);
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [filter, baseUrl]);

  // Filter bookings based on search input
  const filteredBookings = bookings.filter((b) =>
    (b.studentName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Handle viewing booking details and fetching student info
  const handleViewDetails = async (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
    setStudentDetails(null);
    setComment(booking.hodComment || "");
    setIsStudentDetailsLoading(true);

    try {
      if (booking.studentId) {
        // Fetch student details using the provided studentId
        const encodedStudentId = encodeURIComponent(booking.studentId);
        const res = await axios.get(`${studentUrl}/search?studentId=${encodedStudentId}`);
        setStudentDetails(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch student details", error);
      toast.error("Could not fetch student details.");
      setStudentDetails({ error: "Failed to load" }); // Set a local error state for the UI
    } finally {
      setIsStudentDetailsLoading(false);
    }
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setStudentDetails(null);
    setComment("");
  };

  // Handle deleting a booking
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await axios.delete(`${bookingUrl}/delete/${bookingId}`);
      toast.success("Booking deleted successfully!");
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      if (selectedBooking?.id === bookingId) handleCloseModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete booking.");
    }
  };

  // Handle escalating a booking to HOD or Admin
  const handleEscalate = async (bookingId, level) => {
    const endpoint = level === "HOD"
      ? `${baseUrl}/escalate-to-hod/${bookingId}`
      : `${baseUrl}/escalate-to-admin/${bookingId}`;
      
    try {
      if (level === "Admin") {
        await axios.post(endpoint, null, { params: { hodComment: comment } });
      } else {
        await axios.post(endpoint);
      }
      
      const newStatus = level === "HOD" ? "ESCALATED_TO_HOD" : "ESCALATED_TO_ADMIN";
      toast.success(`Booking escalated to ${level}!`);

      // Optimistically update the UI
      const updatedBookings = bookings.map(b =>
        b.id === bookingId
          ? { ...b, status: newStatus, hodComment: comment }
          : b
      );
      setBookings(updatedBookings);

      if (isModalOpen && selectedBooking?.id === bookingId) {
        const updatedSelectedBooking = updatedBookings.find(b => b.id === bookingId);
        setSelectedBooking(updatedSelectedBooking);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to escalate to ${level}.`);
    }
  };

  // Helper function to render status badges
  const renderStatusBadge = (status) => {
    let colorClass = "";
    switch (status) {
      case "PENDING":
        colorClass = "bg-yellow-100 text-yellow-800";
        break;
      case "ESCALATED_TO_HOD":
        colorClass = "bg-red-100 text-red-800";
        break;
      case "ESCALATED_TO_ADMIN":
        colorClass = "bg-purple-100 text-purple-800";
        break;
      default:
        colorClass = "bg-gray-100 text-gray-800";
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full rounded-md border-gray-300 pl-10 pr-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "all" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              All Bookings
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "pending" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              Pending Bookings
            </button>
            <button
              onClick={() => setFilter("escalated")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "escalated" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              Escalated Bookings
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="h-12 w-12 animate-spin text-indigo-500" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-500">No bookings match your current filter and search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Summary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{b.studentName || "N/A"}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-700">{b.description || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{renderStatusBadge(b.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewDetails(b)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5 inline-block" />
                        </button>
                        {b.status === "PENDING" && (
                          <button
                            onClick={() => handleEscalate(b.id, "HOD")}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Escalate to HOD"
                          >
                            <ArrowUpCircle className="h-5 w-5 inline-block" />
                          </button>
                        )}
                        {b.status === "ESCALATED_TO_HOD" && (
                          <button
                            onClick={() => handleEscalate(b.id, "Admin")}
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                            title="Escalate to Admin"
                          >
                            <ArrowRight className="h-5 w-5 inline-block" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Delete Booking"
                        >
                          <Trash2 className="h-5 w-5 inline-block" />
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

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative transform transition-all scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-indigo-600 text-white p-6 rounded-t-xl flex justify-between items-center">
              <h3 className="text-2xl font-bold">Booking Details</h3>
              <button
                className="text-indigo-200 hover:text-white transition-colors"
                onClick={handleCloseModal}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {selectedBooking && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase">Booking ID</h4>
                    <p className="text-gray-900 font-semibold text-lg">{selectedBooking.id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase">Booking Status</h4>
                    {renderStatusBadge(selectedBooking.status)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase">Booking Description</h4>
                    <p className="text-gray-700 leading-relaxed mt-1">{selectedBooking.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="hod-comment" className="block text-sm font-medium text-gray-700">HOD Comment</label>
                    <textarea
                      id="hod-comment"
                      name="hod-comment"
                      rows="4"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                    <p className="text-sm text-gray-500">Add any comments before escalating the booking.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Student Information</h3>
              {isStudentDetailsLoading ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Fetching student details...</span>
                </div>
              ) : studentDetails && studentDetails.error ? (
                <div className="text-center text-red-500 p-4 border border-red-200 rounded-md">
                  <p>Failed to load student details. Please try again.</p>
                </div>
              ) : studentDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-500">Name</h4>
                    <p className="text-gray-900">{studentDetails.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-500">Email</h4>
                    <p className="text-gray-900">{studentDetails.email}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-500">Phone</h4>
                    <p className="text-gray-900">{studentDetails.phone || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-500">Registration ID</h4>
                    <p className="text-gray-900">{studentDetails.studentId}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 p-4 border border-gray-200 rounded-md">
                  <p>No student details available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CasePage;