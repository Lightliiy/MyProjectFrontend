import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegCalendarAlt, FaRegClock, FaFileAlt, FaPaperclip, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { IoCheckmarkCircleOutline, IoCloseCircleOutline, IoTrashOutline, IoWarningOutline } from 'react-icons/io5';

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
      const activeNotifications = response.data.filter(
        (notif) => notif.status?.trim().toUpperCase() !== 'ARCHIVED'
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

  const handleStatusChange = async (notif, action) => {
    try {
      setLoading((prev) => ({ ...prev, [notif.id]: true }));
      await axios.put(`http://localhost:8080/api/bookings/${notif.id}/${action}`);
      toast.success(`Booking ${action}d successfully!`);

      if (action === 'approve' || action === 'cancel') {
        const title = action === 'approve' ? 'Booking Confirmed' : 'Booking Cancelled';
        const message =
          action === 'approve'
            ? `Your session with your counselor on ${notif.scheduledDate} is confirmed.`
            : `Your session with your counselor on ${notif.scheduledDate} has been cancelled.`;

        const notification = {
          id: notif.id,
          userId: notif.studentId,
          title: title,
          message: message,
          timestamp: new Date().toISOString(),
          type: action === 'approve' ? 'booking' : 'booking_cancellation',
          isRead: false,
        };

        await axios.post(`http://localhost:8080/notifications`, notification, {
          headers: { 'Content-Type': 'application/json' },
        });
        toast.success('Notification sent to the student!');
      }

      if (action === 'archive') {
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, status: action.toUpperCase() } : n))
        );
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      toast.error(`Error ${action}ing booking.`);
    } finally {
      setLoading((prev) => ({ ...prev, [notif.id]: false }));
    }
  };

  const handleDelete = (notif) => {
    if (
      !window.confirm(
        'Are you sure you want to archive this booking? It will no longer appear on your dashboard but will remain for the student.'
      )
    )
      return;
    handleStatusChange(notif, 'archive');
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    const statusNormalized = status?.trim().toUpperCase();
    let colorClass = 'bg-yellow-100 text-yellow-700';
    let label = statusNormalized;

    if (statusNormalized === 'APPROVED') {
      colorClass = 'bg-green-100 text-green-700';
    } else if (statusNormalized === 'CANCELLED') {
      colorClass = 'bg-red-100 text-red-700';
    } else if (statusNormalized === 'ARCHIVED') {
      colorClass = 'bg-gray-100 text-gray-700';
    } else if (statusNormalized === 'ESCALATED_TO_ADMIN' || statusNormalized === 'ESCALATED_TO_HOD') {
      colorClass = 'bg-orange-100 text-orange-700';
      label = statusNormalized.replace('_', ' ').toUpperCase();
    }

    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="notifications p-8 max-w-4xl mx-auto font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 leading-tight">Booking Notifications</h1>
      {notifications.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500 border border-gray-200">
          <p className="text-md">You have no new notifications.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {notifications.map((notif) => {
            const statusNormalized = notif.status?.trim().toUpperCase();
            const isActionDone = statusNormalized === 'APPROVED' || statusNormalized === 'CANCELLED' ||
                                statusNormalized === 'ESCALATED_TO_ADMIN' || statusNormalized === 'ESCALATED_TO_HOD';
            const isExpanded = expanded[notif.id];
            const isReplyDisabled = loading[notif.id] || !replyTexts[notif.id]?.trim();

            return (
              <div
                key={notif.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <div className="p-3 bg-indigo-100 rounded-full">
                        <FaUser className="text-indigo-600 text-xl" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-800">
                        New Booking from {notif.studentName}
                      </h2>
                    </div>
                    {getStatusBadge(notif.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm text-gray-600 border-b pb-4 mb-4">
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
                    className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200 text-sm font-semibold"
                  >
                    <span className="mr-1">
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </span>
                    {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-slide-down">
                      <p className="text-sm text-gray-700">
                        <strong>Description:</strong> {notif.description}
                      </p>
                      {notif.attachmentUrls && notif.attachmentUrls.length > 0 && (
                        <div className="mt-4">
                          <strong className="text-sm text-gray-700">Attachments:</strong>
                          <ul className="list-none mt-2 space-y-2">
                            {notif.attachmentUrls.map((url, i) => (
                              <li key={i}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center transition-colors duration-200"
                                >
                                  <FaPaperclip className="mr-2 text-gray-400" />
                                  {url.split('/').pop()}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3 items-center">
                    <button
                      onClick={() => handleStatusChange(notif, 'approve')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading[notif.id] || isActionDone}
                    >
                      <IoCheckmarkCircleOutline className="text-lg" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(notif, 'cancel')}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading[notif.id] || isActionDone}
                    >
                      <IoCloseCircleOutline className="text-lg" />
                      <span>Cancel</span>
                    </button>

                    <button
                      onClick={() => handleDelete(notif)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading[notif.id] || notif.status?.toUpperCase() === 'ARCHIVED'}
                    >
                      <IoTrashOutline className="text-lg" />
                      <span>Archive</span>
                    </button>
                  </div>
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