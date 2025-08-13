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
import { FaVideo, FaTrashAlt, FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { firebaseConfig } from "../Dashboard/Firebase";

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

/**
 * Chats component for counselors to manage chats and video calls with students.
 * @param {object} props
 * @param {string} props.counselorId - The ID of the currently logged-in counselor.
 */
function Chats({ counselorId }) {
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
    if (!counselorId) return;
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

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
            updateDoc(doc(firestore, 'calls', callId), { status: 'declined' });
            activeCallId.current = null;
            toast.info("Call declined.");
          }
        }
      }
    });

    return () => unsubscribe();
  }, [counselorId, navigate]);

  // Effect to listen for chat messages
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const messagesCol = collection(firestore, 'chats', chatId, 'messages');
    const q = query(messagesCol, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => doc.data());
      setMessages(fetchedMessages);
    }, (error) => {
      console.error("Failed to fetch messages from Firestore", error);
      toast.error("Failed to load chat history.");
    });

    return () => unsubscribe();
  }, [chatId]);

  // Function to handle selecting a student and loading their chat
  const handleSelectStudent = async (student) => {
    setMessages([]);
    setSelectedStudent(student);
    setShowAddStudentModal(false);

    try {
      const chatsRef = collection(firestore, 'chats');
      const q = query(
        chatsRef,
        where('counselorId', '==', String(counselorId)),
        where('studentId', '==', String(student.id))
      );
      const querySnapshot = await getDocs(q);

      let existingChatId = null;
      if (!querySnapshot.empty) {
        existingChatId = querySnapshot.docs[0].id;
      }

      if (!existingChatId) {
        const newChatDocRef = await addDoc(collection(firestore, 'chats'), {
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
    if (!window.confirm(`Are you sure you want to delete the chat with ${student.name}? This action cannot be undone.`)) {
      return;
    }

    setDeletingChatId(student.id);

    try {
      const chatsRef = collection(firestore, 'chats');
      const q = query(
        chatsRef,
        where('counselorId', '==', String(counselorId)),
        where('studentId', '==', String(student.id))
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const chatDoc = querySnapshot.docs[0];
        const chatIdToDelete = chatDoc.id;

        const batch = writeBatch(firestore);
        const messagesRef = collection(firestore, 'chats', chatIdToDelete, 'messages');
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
      const messagesRef = collection(firestore, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        senderId: String(counselorId),
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
    const callDoc = doc(firestore, 'calls', callId);

    try {
      await setDoc(callDoc, {
        callerId: String(counselorId),
        receiverId: String(selectedStudent.id),
        status: 'calling',
        timestamp: Timestamp.now(),
      });

      console.log('Call document created:', callId);

      navigate(`/video-call?callId=${callId}&isCaller=true&currentUserId=${counselorId}&otherUserId=${selectedStudent.id}`);
    } catch (e) {
      console.error("Failed to start video call:", e);
      toast.error("Failed to start video call. Check console for details.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Sidebar - Student List */}
      <div className="w-1/3 border-r border-gray-300 p-4 overflow-y-auto bg-white shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Chats</h2>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-semibold transition"
          >
            + Add Student
          </button>
        </div>
        {isStudentsLoading ? (
          <div className="text-center text-gray-500 mt-10">Loading students...</div>
        ) : students.length > 0 ? (
          students.map((student) => (
            <div
              key={student.id}
              onClick={() => handleSelectStudent(student)}
              className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between mt-2 ${
                selectedStudent?.id === student.id
                  ? "bg-indigo-100 ring-2 ring-indigo-500"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{student.name}</div>
                <div className="text-xs text-gray-500">{student.email}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(student);
                }}
                disabled={deletingChatId === student.id}
                className="ml-2 text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition"
                title="Delete chat"
              >
                {deletingChatId === student.id ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTrashAlt />
                )}
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center italic mt-10">No students assigned yet.</p>
        )}
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col p-6 bg-gray-50">
        {selectedStudent ? (
          <>
            <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between items-center bg-white p-4 rounded-xl shadow">
              <h2 className="text-xl font-bold text-gray-800">
                Chatting with {selectedStudent.name}
              </h2>
              <button
                onClick={handleStartVideoCall}
                disabled={!selectedStudent}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <FaVideo className="mr-2" /> Start Video Call
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 flex flex-col p-4 bg-gray-100 rounded-xl">
              {messages.length > 0 ? (
                messages.map((msg, index) => {
                  const isCounselor = msg.senderId === String(counselorId);
                  const time = msg.timestamp?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div
                      key={index}
                      className={`max-w-xs p-3 rounded-xl break-words shadow-sm ${
                        isCounselor
                          ? "bg-indigo-600 text-white self-end text-right"
                          : "bg-white text-gray-800 self-start text-left"
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
                  );
                })
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 italic">
                  Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-auto flex bg-white rounded-xl shadow-md p-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 p-3 border-none focus:ring-0 rounded-l-xl text-gray-700"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-600 text-white px-6 rounded-r-xl font-semibold hover:bg-indigo-700 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-500 italic m-auto text-center text-xl">
            Select a student from the left panel to start chatting.
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Select a student to chat with
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto border-t border-b py-4">
              {students.length > 0 ? (
                students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="cursor-pointer p-3 rounded-lg hover:bg-indigo-50 transition"
                  >
                    <div className="text-sm font-medium text-gray-800">
                      {student.name}
                    </div>
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center">No students available.</p>
              )}
            </div>
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="mt-6 w-full bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg font-semibold text-gray-800 transition"
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