import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Notifications({ counselorId }) {
  const [notifications, setNotifications] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      if (!counselorId) {
        console.warn("No counselorId provided to Notifications");
        setNotifications([]);
        return;
      }
      const response = await axios.get(`http://localhost:8080/api/bookings/counsel?counselorId=${counselorId}`);

      const sorted = response.data.sort((a, b) => {
        return new Date(b.scheduledDate || '') - new Date(a.scheduledDate || '') || b.id - a.id;
      });

      setNotifications(sorted);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error fetching notifications');
    }
  };

  const handleReplyChange = (id, text) => {
    setReplyTexts((prev) => ({ ...prev, [id]: text }));
  };

  const handleSendReply = async (id) => {
    const replyMessage = replyTexts[id]?.trim();

    if (!replyMessage) {
      toast.warning('Reply message cannot be empty');
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, [id]: true }));

      await axios.post(
        `http://localhost:8080/notifications/${id}/reply`,
        { reply: replyMessage },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      setReplyTexts((prev) => ({ ...prev, [id]: '' }));
      toast.success('Reply sent successfully');
    } catch (error) {
      console.error('Error sending reply:', error.response?.data || error.message);
      toast.error('Error sending reply');
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleStatusChange = async (id, action) => {
    try {
      setLoading((prev) => ({ ...prev, [id]: true }));
      await axios.put(`http://localhost:8080/api/bookings/${id}/${action}`);
      toast.success(`Booking ${action}d successfully`);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, status: action.toUpperCase() } : notif
        )
      );
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      toast.error(`Error ${action}ing booking`);
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      setLoading((prev) => ({ ...prev, [id]: true }));

      await axios.delete(`http://localhost:8080/api/bookings/delete/${id}`);

      toast.success("Booking deleted successfully");

      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking");
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="notifications p-6 max-w-5xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Booking Notifications</h1>

      {notifications.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          No notifications available.
        </div>
      ) : (
        notifications.map((notif) => {
          const statusNormalized = notif.status?.trim().toUpperCase();
          const isActionDone = statusNormalized === 'APPROVED' || statusNormalized === 'CANCELLED';
          const replyMessage = replyTexts[notif.id]?.trim();

          return (
            <div
              key={notif.id}
              className="bg-white p-5 rounded-xl shadow-md mb-5 border border-gray-200 transition hover:shadow-lg"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div className="text-lg font-semibold text-gray-800">
                  {notif.studentName} Booked by <span className="text-indigo-700">{notif.counselorName}</span>
                </div>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full mt-2 sm:mt-0 ${
                    statusNormalized === 'APPROVE'
                      ? 'bg-green-100 text-green-700'
                      : statusNormalized === 'CANCEL'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {statusNormalized}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
                <div>
                  <strong>Issue:</strong> {notif.issueType}
                </div>
                <div>
                  <strong>Session:</strong> {notif.sessionType}
                </div>
                <div>
                  <strong>Date:</strong> {notif.scheduledDate}
                </div>
                <div>
                  <strong>Time:</strong> {notif.timeSlot}
                </div>
                <div className="sm:col-span-2">
                  <strong>Description:</strong> {notif.description}
                </div>

                {notif.attachmentUrls && notif.attachmentUrls.length > 0 && (
                  <div className="sm:col-span-2 mt-2">
                    <strong>Attachments:</strong>
                    <ul className="list-disc list-inside mt-1 text-blue-600 space-y-1">
                      {notif.attachmentUrls.map((url, i) => {
                        const fileName = url.split('/').pop();
                        return (
                          <li key={i}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline text-blue-600"
                            >
                              📎 {fileName}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                {!isActionDone && (
                  <>
                    <button
                      onClick={() => handleStatusChange(notif.id, 'approve')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                      disabled={loading[notif.id]}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(notif.id, 'cancel')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                      disabled={loading[notif.id]}
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                  disabled={loading[notif.id]}
                >
                  Delete
                </button>
              </div>

              {!isActionDone && (
                <>
                  <textarea
                    className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Write a reply..."
                    value={replyTexts[notif.id] || ''}
                    onChange={(e) => handleReplyChange(notif.id, e.target.value)}
                  />
                  <button
                    onClick={() => handleSendReply(notif.id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 mt-2 disabled:opacity-50"
                    disabled={loading[notif.id] || !replyMessage}
                  >
                    {loading[notif.id] ? 'Sending...' : 'Send Reply'}
                  </button>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Notifications;
