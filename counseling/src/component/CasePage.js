import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  X,
  Loader,
  Search,
  ArrowRight,
  Eye,
  ArrowUpCircle,
  MessageCircle,
  Archive,
  User,
  Mail,
  Phone,
  Clipboard,
  Calendar,
  Clock,
  CheckCircle
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Status badge component
const StatusBadge = ({ status }) => {
  let colorClass = "";
  let icon = null;
  switch (status) {
    case "PENDING":
      colorClass = "bg-yellow-100 text-yellow-800";
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case "ESCALATED_TO_HOD":
      colorClass = "bg-red-100 text-red-800";
      icon = <ArrowUpCircle className="h-3 w-3 mr-1" />;
      break;
    case "ESCALATED_TO_ADMIN":
      colorClass = "bg-purple-100 text-purple-800";
      icon = <ArrowUpCircle className="h-3 w-3 mr-1" />;
      break;
    case "CLOSED":
      colorClass = "bg-green-100 text-green-800";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800";
      icon = null;
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${colorClass}`}>
      {icon}
      {status.toLowerCase().replace(/_/g, " ")}
    </span>
  );
};

// Info Card component for the modal
const InfoCard = ({ title, value, icon }) => (
  <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-3 shadow-sm">
    <div className="text-indigo-500">{icon}</div>
    <div>
      <h5 className="font-medium text-gray-500 text-sm">{title}</h5>
      <p className="text-gray-900 font-semibold">{value || "N/A"}</p>
    </div>
  </div>
);

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
  }, [filter]);

  const filteredBookings = bookings.filter((b) =>
    (b.studentName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetails = async (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
    setStudentDetails(null);
    setComment(booking.hodComment || "");
    setIsStudentDetailsLoading(true);

    try {
      if (booking.studentId) {
        const encodedStudentId = encodeURIComponent(booking.studentId);
        const res = await axios.get(`${studentUrl}/search?studentId=${encodedStudentId}`);
        setStudentDetails(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch student details", error);
      toast.error("Could not fetch student details.");
      setStudentDetails({ error: "Failed to load" });
    } finally {
      setIsStudentDetailsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setStudentDetails(null);
    setComment("");
  };

  const handleArchiveBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to archive this booking?")) return;

    try {
      await axios.put(`${bookingUrl}/${bookingId}/archive`);
      toast.success("Booking archived successfully!");
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      if (selectedBooking?.id === bookingId) handleCloseModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to archive booking.");
    }
  };

  const handleEscalate = async (bookingId, level) => {
    const endpoint =
      level === "HOD"
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

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="max-w-7xl mx-auto">
          {/* Header and Controls */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6 flex-col sm:flex-row space-y-4 sm:space-y-0">
              <h1 className="text-3xl font-extrabold text-gray-900">Case Management</h1>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-x-4 sm:space-y-0 w-full sm:w-auto">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by student name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full rounded-full border-gray-300 pl-10 pr-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${filter === "all" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("pending")}
                    className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${filter === "pending" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilter("escalated")}
                    className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${filter === "escalated" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    Escalated
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="mt-8">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl shadow-xl">
                <Loader className="h-16 w-16 animate-spin text-indigo-500" />
                <p className="mt-4 text-gray-600 font-medium">Loading cases...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
                <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
                <p className="text-gray-500">No bookings match your current filter and search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Summary</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{b.studentName || "N/A"}</td>
                        <td className="px-6 py-4 max-w-sm truncate text-sm text-gray-700">{b.description || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{<StatusBadge status={b.status} />}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleViewDetails(b)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-2 rounded-full hover:bg-gray-200"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleArchiveBooking(b.id)}
                            className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-200"
                            title="Archive Booking"
                          >
                            <Archive className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in"
              onClick={handleCloseModal}
            >
              <div
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full relative transform transition-all scale-100 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-indigo-600 text-white p-6 rounded-t-3xl flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Booking Details: #{selectedBooking?.id}</h3>
                  <button
                    className="text-indigo-200 hover:text-white transition-colors"
                    onClick={handleCloseModal}
                  >
                    <X className="h-7 w-7" />
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                  {/* Left: Booking & Action Info */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-gray-900 border-b pb-2">Booking Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoCard title="Student Name" value={selectedBooking?.studentName} icon={<User />} />
                      <InfoCard title="Booking Date" value={selectedBooking?.date ? new Date(selectedBooking.date).toLocaleDateString() : "N/A"} icon={<Calendar />} />
                      <InfoCard title="Booking Time" value={selectedBooking?.time || "N/A"} icon={<Clock />} />
                      <InfoCard title="Status" value={selectedBooking?.status.toLowerCase().replace(/_/g, " ")} icon={<Clipboard />} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Booking Description</h4>
                      <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                        <p className="text-gray-700">{selectedBooking?.description || "No description provided."}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">HOD Comment</h4>
                      <div className="relative">
                        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <textarea
                          id="hod-comment"
                          name="hod-comment"
                          rows="4"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm pl-10 pr-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment here..."
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">This comment will be attached when escalating the booking to Admin.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      {selectedBooking?.status === "PENDING" && (
                        <button
                          onClick={() => handleEscalate(selectedBooking.id, "HOD")}
                          className="flex-1 inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <ArrowUpCircle className="h-5 w-5 mr-2" /> Escalate to HOD
                        </button>
                      )}
                      {selectedBooking?.status === "ESCALATED_TO_HOD" && (
                        <button
                          onClick={() => handleEscalate(selectedBooking.id, "Admin")}
                          className="flex-1 inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                          <ArrowRight className="h-5 w-5 mr-2" /> Escalate to Admin
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: Student Info */}
                  <div className="space-y-6 bg-gray-100 p-6 rounded-2xl">
                    <h4 className="text-xl font-bold text-gray-900 border-b border-gray-300 pb-2">Student Information</h4>
                    {isStudentDetailsLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-2 text-gray-500">
                        <Loader className="h-8 w-8 animate-spin" />
                        <span className="font-medium">Fetching details...</span>
                      </div>
                    ) : studentDetails && studentDetails.error ? (
                      <div className="text-center text-red-500 p-4 border border-red-200 rounded-lg bg-red-50">
                        <p>Failed to load student details. Please try again.</p>
                      </div>
                    ) : studentDetails ? (
                      <div className="space-y-4">
                        <InfoCard title="Student Name" value={studentDetails.name} icon={<User />} />
                        <InfoCard title="Email" value={studentDetails.email} icon={<Mail />} />
                        <InfoCard title="Phone" value={studentDetails.phone} icon={<Phone />} />
                        <InfoCard title="Registration ID" value={studentDetails.studentId} icon={<Clipboard />} />
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 p-4 border border-gray-200 rounded-lg bg-white">
                        <p>No student details available for this booking.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CasePage;