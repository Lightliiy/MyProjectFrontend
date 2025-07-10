import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});
  const [sending, setSending] = useState({});

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/bookings');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleReplyChange = (id, text) => {
    setReplyTexts((prev) => ({ ...prev, [id]: text }));
  };

  const handleSendReply = async (id) => {
    const replyMessage = replyTexts[id];
    if (!replyMessage || replyMessage.trim() === '') return;

    try {
      setSending((prev) => ({ ...prev, [id]: true }));
      await axios.post(`http://localhost:8080/api/notifications/${id}/reply`, { reply: replyMessage });
      setReplyTexts((prev) => ({ ...prev, [id]: '' }));
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="notifications">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          No notifications available.
        </div>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id} className="bg-white p-6 rounded-lg shadow mb-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{notification.title}</h3>
            <p className="text-gray-600 mb-4">{notification.message}</p>
            <textarea
              className="w-full p-3 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Write a reply..."
              value={replyTexts[notification.id] || ''}
              onChange={(e) => handleReplyChange(notification.id, e.target.value)}
            />
            <button
              onClick={() => handleSendReply(notification.id)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              disabled={sending[notification.id]}
            >
              {sending[notification.id] ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;
