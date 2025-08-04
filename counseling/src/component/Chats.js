import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

function Chats({ counselorId }) {
  const [students, setStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [connected, setConnected] = useState(false); // Track WS connection

  const stompClient = useRef(null);
  const subscriptionRef = useRef(null);

  // Fetch assigned students once counselorId is ready
  useEffect(() => {
    if (counselorId) fetchAssignedStudents();
  }, [counselorId]);

  useEffect(() => {
    setStudents(assignedStudents);
  }, [assignedStudents]);

  // Create STOMP client once on mount
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws-chat");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log("[STOMP DEBUG]", str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WebSocket connected");
        setConnected(true);
        // Subscribe if chatId already set
        if (chatId) subscribeToChat(chatId);
      },
      onStompError: (frame) => {
        console.error("Broker reported error:", frame.headers["message"]);
        console.error("Details:", frame.body);
      },
      onWebSocketClose: (evt) => {
        console.log("WebSocket closed", evt);
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
        setConnected(false);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  // Subscribe/unsubscribe on chatId or connection changes
  useEffect(() => {
    if (!stompClient.current || !connected) return;

    // Unsubscribe previous
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (chatId) {
      subscribeToChat(chatId);
    }
  }, [chatId, connected]);

  const subscribeToChat = (id) => {
    if (!stompClient.current) return;
    subscriptionRef.current = stompClient.current.subscribe(
      `/topic/chat/${id}`,
      (msg) => {
        const message = JSON.parse(msg.body);
        console.log("Received message via WS:", message);
        setMessages((prev) => [...prev, message]);
      },
      { id: `sub-${id}` }
    );
  };

  const fetchAssignedStudents = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/students/by-counselor-id/${counselorId}`
      );
      setAssignedStudents(res.data);
    } catch (error) {
      console.error("Failed to fetch assigned students", error);
    }
  };

  const handleAddStudent = async (student) => {
    if (!students.find((s) => s.id === student.id)) {
      setStudents((prev) => [...prev, student]);
    }
    setSelectedStudent(student);
    setShowAddStudentModal(false);

    try {
      // Clear messages before loading new ones
      setMessages([]);

      const chatRes = await axios.get("http://localhost:8080/api/chats/between", {
        params: {
          counselorId,
          studentId: student.id,
          counselorName: "Counselor",
        },
      });

      const fetchedChatId = chatRes.data?.id;
      console.log("Fetched chatId:", fetchedChatId);
      if (!fetchedChatId) {
        console.warn("No chat ID returned for this counselor/student");
        setChatId(null);
        setMessages([]);
        return;
      }
      setChatId(fetchedChatId);

      const msgRes = await axios.get(
        `http://localhost:8080/api/chats/${fetchedChatId}/messages`
      );
      console.log("Fetched messages:", msgRes.data);
      setMessages(msgRes.data);
    } catch (error) {
      console.error("Error loading chat", error);
    }
  };

  // Handle deleting a chat
  const handleDeleteChat = async (student) => {
    try {
      // Get chatId by counselorId & studentId
      const chatRes = await axios.get("http://localhost:8080/api/chats/between", {
        params: {
          counselorId,
          studentId: student.id,
          counselorName: "Counselor",
        },
      });
      const chatIdToDelete = chatRes.data?.id;

      if (!chatIdToDelete) {
        console.warn("No chat found to delete for this student");
        return;
      }

      // Delete chat on backend
      await axios.delete(`http://localhost:8080/api/chats/${chatIdToDelete}`);

      // Remove student/chat from state
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      setAssignedStudents((prev) => prev.filter((s) => s.id !== student.id));

      // Clear chat if it was open
      if (selectedStudent?.id === student.id) {
        setSelectedStudent(null);
        setChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete chat", error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedStudent || !stompClient.current?.connected) return;

    const msg = {
      chatId,
      senderId: counselorId,
      content: newMessage,
      attachmentUrl: null,
      counselorId,
      studentId: selectedStudent.id,
      counselorName: "Counselor",
    };

    try {
      stompClient.current.publish({
        destination: "/app/chat/send",
        body: JSON.stringify(msg),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message via WebSocket:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 border-r p-4 overflow-y-auto bg-white shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Chats</h2>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
          >
            + Add
          </button>
        </div>

        {students.map((student) => (
          <div
            key={student.id}
            className={`p-3 rounded cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
              selectedStudent?.id === student.id ? "bg-indigo-100" : ""
            }`}
          >
            <div
              onClick={() => handleAddStudent(student)}
              className="flex-1"
            >
              <div className="font-medium text-gray-800">{student.name}</div>
              <div className="text-xs text-gray-500">{student.email}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent selecting student on delete click
                handleDeleteChat(student);
              }}
              className="ml-2 text-red-600 hover:text-red-800 text-sm font-bold"
              title="Delete chat"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col p-4">
        {selectedStudent ? (
          <>
            <div className="border-b pb-3 mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Chatting with {selectedStudent.name}
              </h2>
              <button
                onClick={() => alert(`Start video session with ${selectedStudent.name}`)}
                className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm"
              >
                Start Video Call
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 flex flex-col">
              {messages.map((msg, index) => {
                const isCounselor = msg.senderId === counselorId;
                const time = new Date(
                  msg.timeSent || msg.createdAt || msg.timestamp
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div
                    key={index}
                    className={`max-w-xs p-2 rounded-lg break-words ${
                      isCounselor
                        ? "bg-blue-100 self-end text-right"
                        : "bg-gray-100 self-start text-left"
                    }`}
                  >
                    <p className="text-sm text-gray-800">{msg.content}</p>
                    <div
                      className={`text-xs text-gray-500 mt-1 ${
                        isCounselor ? "text-right" : "text-left"
                      }`}
                    >
                      {time}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-auto flex">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 border p-2 rounded-l"
                placeholder="Type a message"
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-600 text-white px-4 rounded-r"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-500 italic m-auto text-lg">
            Select a student to start chatting.
          </div>
        )}
      </div>

      {/* Modal: Add Student */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Select a student to chat with
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {assignedStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleAddStudent(student)}
                  className="cursor-pointer p-2 rounded hover:bg-indigo-100"
                >
                  <div className="text-sm font-medium text-gray-800">
                    {student.name}
                  </div>
                  <div className="text-xs text-gray-500">{student.email}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="mt-4 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chats;
