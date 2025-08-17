import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  Timestamp,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  orderBy,
  addDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { FaVideo, FaTrashAlt, FaSpinner, FaPlusCircle } from "react-icons/fa";
import { IoSend, IoPersonCircleOutline } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { firebaseConfig } from "../Dashboard/Firebase";

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

/**
 * Chats component for counselors to manage chats and video calls with students.
 * @param {object} props
 * @param {string} props.counselorId - The ID of the currently logged-in counselor.
 * @param {string} props.counselorName - The name of the currently logged-in counselor.
 */
function Chats({ counselorId, counselorName }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState(null);
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const activeCallId = useRef(null);
  const navigate = useNavigate();

  // Effect to fetch students assigned to this counselor
  useEffect(() => {
    if (!counselorId) {
      toast.error("Invalid counselor ID. Please log in again.");
      return;
    }
    const fetchAssignedStudents = async () => {
      setIsStudentsLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8080/api/students/by-counselor-id/${counselorId}`
        );
        setStudents(res.data);
      } catch (error) {
        console.error("Failed to fetch assigned students", error);
        toast.error("Failed to load your assigned students.");
      } finally {
        setIsStudentsLoading(false);
      }
    };
    fetchAssignedStudents();
  }, [counselorId]);

  // Effect to auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect to listen for incoming video calls
  useEffect(() => {
    if (!counselorId) return;
    const callsCollection = collection(firestore, "calls");
    const q = query(
      callsCollection,
      where("receiverId", "==", counselorId),
      where("status", "==", "calling")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const callDoc = snapshot.docs[0];
          const callId = callDoc.id;
          const callData = callDoc.data();

          if (callData.status === "calling" && !activeCallId.current) {
            activeCallId.current = callId;
            const acceptCall = window.confirm(
              `Incoming call from ${callData.callerName || callData.callerId}! Do you want to answer?`
            );
            if (acceptCall) {
              navigate(
                `/video-call?callId=${callId}&isCaller=false&currentUserId=${counselorId}&otherUserId=${callData.callerId}`
              );
            } else {
              updateDoc(doc(firestore, "calls", callId), { status: "declined" })
                .then(() => {
                  toast.info("Call declined.");
                })
                .catch((error) => {
                  console.error("Error declining call:", error);
                  toast.error("Failed to decline call.");
                });
              activeCallId.current = null;
            }
          }
        }
      },
      (error) => {
        console.error("Error listening for calls:", error);
        toast.error("Failed to listen for incoming calls.");
      }
    );

    return () => unsubscribe();
  }, [counselorId, navigate]);

  // Effect to listen for chat messages
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const messagesCol = collection(firestore, "chats", chatId, "messages");
    const q = query(messagesCol, orderBy("timestamp"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedMessages = snapshot.docs.map((doc) => doc.data());
        setMessages(fetchedMessages);
      },
      (error) => {
        console.error("Failed to fetch messages from Firestore", error);
        toast.error("Failed to load chat history.");
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  // Function to handle selecting a student and loading their chat
  const handleSelectStudent = async (student) => {
    setMessages([]);
    setSelectedStudent(student);
    setShowAddStudentModal(false);

    try {
      const chatsRef = collection(firestore, "chats");
      const q = query(
        chatsRef,
        where("counselorId", "==", String(counselorId)),
        where("studentId", "==", String(student.id))
      );
      const querySnapshot = await getDocs(q);

      let existingChatId = null;
      if (!querySnapshot.empty) {
        existingChatId = querySnapshot.docs[0].id;
      }

      if (!existingChatId) {
        const newChatDocRef = await addDoc(collection(firestore, "chats"), {
          counselorId: String(counselorId),
          studentId: String(student.id),
          createdAt: Timestamp.now(),
        });
        existingChatId = newChatDocRef.id;
        toast.info("New chat created!");
      }
      setChatId(existingChatId);
    } catch (error) {
      console.error("Error loading or creating chat", error);
      toast.error("Failed to load or create chat.");
    }
  };

  // Function to handle deleting a chat
  const handleDeleteChat = async (student) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the chat with ${student.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingChatId(student.id);

    try {
      const chatsRef = collection(firestore, "chats");
      const q = query(
        chatsRef,
        where("counselorId", "==", String(counselorId)),
        where("studentId", "==", String(student.id))
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const chatDoc = querySnapshot.docs[0];
        const chatIdToDelete = chatDoc.id;

        const batch = writeBatch(firestore);
        const messagesRef = collection(firestore, "chats", chatIdToDelete, "messages");
        const messagesSnapshot = await getDocs(messagesRef);

        messagesSnapshot.docs.forEach((msgDoc) => {
          batch.delete(msgDoc.ref);
        });
        await batch.commit();

        await deleteDoc(chatDoc.ref);

        toast.success("Chat and all messages deleted successfully.");

        if (selectedStudent?.id === student.id) {
          setSelectedStudent(null);
          setChatId(null);
          setMessages([]);
        }
      } else {
        toast.warn("Chat not found, cannot delete.");
      }
    } catch (error) {
      console.error("Failed to delete chat", error);
      toast.error("Failed to delete chat.");
    } finally {
      setDeletingChatId(null);
    }
  };

  // Function to handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent || !chatId) {
      toast.warn("Cannot send message. Please select a student and type a message.");
      return;
    }

    try {
      const messagesRef = collection(firestore, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        senderId: String(counselorId),
        senderName: counselorName,
        content: newMessage,
        timestamp: Timestamp.now(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message to Firestore:", error);
      toast.error("Failed to send message.");
    }
  };

  // Function to handle starting a video call
  const handleStartVideoCall = async () => {
    if (!selectedStudent || !counselorId) {
      toast.error("Please select a student to start a video call.");
      return;
    }

    const callId = Math.random().toString(36).substring(2, 15);
    const callDoc = doc(firestore, "calls", callId);

    try {
      await setDoc(callDoc, {
        callerId: String(counselorId),
        callerName: counselorName || "Counselor",
        receiverId: String(selectedStudent.id),
        status: "calling",
        timestamp: Timestamp.now(),
      });

      navigate(
        `/video-call?callId=${callId}&isCaller=true&currentUserId=${counselorId}&otherUserId=${selectedStudent.id}`
      );
    } catch (error) {
      console.error("Failed to start video call:", error);
      toast.error("Failed to start video call.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 antialiased">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Sidebar - Student List */}
      <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto bg-white shadow-xl flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Chats</h2>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
            title="Add Student"
          >
            <FaPlusCircle className="text-2xl" />
          </button>
        </div>

        {isStudentsLoading ? (
          <div className="text-center text-gray-500 mt-10">
            <FaSpinner className="animate-spin inline-block mr-2" /> Loading students...
          </div>
        ) : students.length > 0 ? (
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => handleSelectStudent(student)}
                className={`p-4 rounded-xl cursor-pointer transition flex items-center justify-between ${
                  selectedStudent?.id === student.id
                    ? "bg-indigo-50 border-l-4 border-indigo-600 shadow-md"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-2xl text-gray-400">
                    <IoPersonCircleOutline />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{student.name}</div>
                    <div className="text-xs text-gray-500 truncate">{student.email}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(student);
                  }}
                  disabled={deletingChatId === student.id}
                  className="ml-2 text-red-500 hover:text-red-700 p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete chat"
                >
                  {deletingChatId === student.id ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaTrashAlt />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center italic mt-10">No students assigned yet.</p>
        )}
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col p-8 bg-gray-100">
        {selectedStudent ? (
          <div className="h-full flex flex-col">
            <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between items-center bg-white p-4 rounded-xl shadow-md">
              <div className="flex items-center space-x-3">
                <div className="text-2xl text-indigo-500">
                  <IoPersonCircleOutline />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedStudent.name}
                </h2>
              </div>
              <button
                onClick={handleStartVideoCall}
                disabled={!selectedStudent}
                className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md"
                title="Start Video Call"
              >
                <FaVideo className="mr-2" /> Call
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 rounded-xl bg-white shadow-inner">
              {messages.length > 0 ? (
                messages.map((msg, index) => {
                  const isCounselor = msg.senderId === String(counselorId);
                  const time = msg.timestamp?.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={index}
                      className={`flex ${isCounselor ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs p-4 rounded-3xl break-words shadow-md relative ${
                          isCounselor
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm font-light">{msg.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            isCounselor ? "text-indigo-200" : "text-gray-500"
                          }`}
                        >
                          {time}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 italic text-center">
                  Start the conversation! <br/> Your messages will appear here.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-auto flex bg-white rounded-full shadow-lg p-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 p-3 border-none focus:ring-0 rounded-full text-gray-700 bg-transparent outline-none"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition"
                title="Send Message"
              >
                <IoSend className="text-xl" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic m-auto text-center text-xl p-8 rounded-xl bg-white shadow-md">
            Select a student from the left panel to start chatting.
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
              Select a Student to Chat with
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {students.length > 0 ? (
                students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="flex items-center space-x-4 cursor-pointer p-4 rounded-lg hover:bg-indigo-50 transition"
                  >
                    <div className="text-3xl text-gray-400">
                      <IoPersonCircleOutline />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-medium text-gray-800">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center py-4">No students available.</p>
              )}
            </div>
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="mt-6 w-full bg-gray-200 hover:bg-gray-300 px-4 py-3 rounded-lg font-semibold text-gray-800 transition"
              title="Close"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chats;