import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegCalendarAlt, FaRegClock, FaFileAlt, FaPaperclip, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { IoCheckmarkCircleOutline, IoCloseCircleOutline, IoTrashOutline } from 'react-icons/io5';

function Notifications({ counselorId }) {
  const [notifications, setNotifications] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});
  const [loading, setLoading] = useState({});
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (counselorId) {
      fetchNotifications();
    } else {
      console.warn('No counselorId provided to Notifications component.');
      setNotifications([]);
    }
  }, [counselorId]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/bookings/counsel?counselorId=${counselorId}`
      );
      // Filter out 'ARCHIVED' bookings from the HOD's view
      const activeNotifications = response.data.filter(
        notif => notif.status?.trim().toUpperCase() !== 'ARCHIVED'
      );
      const sorted = activeNotifications.sort(
        (a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate) || b.id - a.id
      );
      setNotifications(sorted);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error fetching notifications.');
    }
  };

  const handleReplyChange = (id, text) => {
    setReplyTexts((prev) => ({ ...prev, [id]: text }));
  };

  const handleSendReply = async (id) => {
    const replyMessage = replyTexts[id]?.trim();
    if (!replyMessage) {
      toast.warning('Reply message cannot be empty.');
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, [id]: true }));
      await axios.post(
        `http://localhost:8080/notifications/${id}/reply`,
        { reply: replyMessage },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setReplyTexts((prev) => ({ ...prev, [id]: '' }));
      toast.success('Reply sent successfully!');
    } catch (error) {
      console.error('Error sending reply:', error.response?.data || error.message);
      toast.error('Error sending reply.');
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleStatusChange = async (id, action) => {
    try {
      setLoading((prev) => ({ ...prev, [id]: true }));
      await axios.put(`http://localhost:8080/api/bookings/${id}/${action}`);
      toast.success(`Booking ${action}d successfully!`);

      // If the action is to archive, remove the notification from the list
      if (action === 'archive') {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      } else {
        // Otherwise, just update the status
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, status: action.toUpperCase() } : notif
          )
        );
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      toast.error(`Error ${action}ing booking.`);
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // The 'delete' button now calls handleStatusChange with the 'archive' action
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to archive this booking? It will no longer appear on your dashboard but will remain for the student.')) return;
    handleStatusChange(id, 'archive');
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    const statusNormalized = status?.trim().toUpperCase();
    let colorClass = 'bg-yellow-100 text-yellow-700';
    if (statusNormalized === 'APPROVED') {
      colorClass = 'bg-green-100 text-green-700';
    } else if (statusNormalized === 'CANCELLED') {
      colorClass = 'bg-red-100 text-red-700';
    } else if (statusNormalized === 'ARCHIVED') {
        colorClass = 'bg-gray-100 text-gray-700'; // New style for archived status
    }
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
        {statusNormalized}
      </span>
    );
  };

  return (
    <div className="notifications p-4 max-w-2xl mx-auto font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Booking Notifications</h1>

      {notifications.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-inner text-center text-gray-500">
          <p className="text-md">You have no new notifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => {
            const statusNormalized = notif.status?.trim().toUpperCase();
            // isActionDone now also checks for ARCHIVED status
            const isActionDone = statusNormalized === 'APPROVED' || statusNormalized === 'CANCELLED' || statusNormalized === 'ARCHIVED';
            const isExpanded = expanded[notif.id];
            const isReplyDisabled = loading[notif.id] || !replyTexts[notif.id]?.trim();

            return (
              <div
                key={notif.id}
                className="bg-white rounded-lg shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg"
              >
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                      <FaUser className="text-indigo-500 text-lg" />
                      <h2 className="text-lg font-bold text-gray-800">
                        New Booking from {notif.studentName}
                      </h2>
                    </div>
                    {getStatusBadge(notif.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 border-b pb-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <FaFileAlt className="text-gray-400" />
                      <span>
                        <strong>Issue Type:</strong> {notif.issueType}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaRegCalendarAlt className="text-gray-400" />
                      <span>
                        <strong>Date:</strong> {notif.scheduledDate}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaRegClock className="text-gray-400" />
                      <span>
                        <strong>Time:</strong> {notif.timeSlot}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(notif.id)}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200 text-sm"
                  >
                    <span className="font-medium mr-1">
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </span>
                    {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-700">
                        <strong>Description:</strong> {notif.description}
                      </p>
                      {notif.attachmentUrls && notif.attachmentUrls.length > 0 && (
                        <div className="mt-3">
                          <strong className="text-sm">Attachments:</strong>
                          <ul className="list-disc list-inside mt-1 text-xs text-blue-600 space-y-1">
                            {notif.attachmentUrls.map((url, i) => (
                              <li key={i}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline flex items-center"
                                >
                                  <FaPaperclip className="mr-1" />
                                  {url.split('/').pop()}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => handleStatusChange(notif.id, 'approve')}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading[notif.id] || isActionDone}
                    >
                      <IoCheckmarkCircleOutline className="text-md" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(notif.id, 'cancel')}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading[notif.id] || isActionDone}
                    >
                      <IoCloseCircleOutline className="text-md" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading[notif.id]}
                    >
                      <IoTrashOutline className="text-md" />
                      <span>Archive</span>
                    </button>
                  </div>

                  {!isActionDone && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Send a quick reply</h3>
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                        placeholder="Write your reply here..."
                        rows="2"
                        value={replyTexts[notif.id] || ''}
                        onChange={(e) => handleReplyChange(notif.id, e.target.value)}
                      />
                      <button
                        onClick={() => handleSendReply(notif.id)}
                        className="mt-2 px-4 py-1.5 bg-indigo-600 text-white font-medium rounded-md text-sm hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isReplyDisabled}
                      >
                        {loading[notif.id] ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;