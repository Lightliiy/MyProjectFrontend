import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
// Import your firebase config
import { firebaseConfig } from '../Dashboard/Firebase'; // Adjust path as needed
import { initializeApp } from 'firebase/app';

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

const CallHandler = ({ counselorId }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!counselorId) return;

    const q = query(
      collection(firestore, 'calls'),
      where('receiverId', isEqualTo: counselorId),
      where('status', isEqualTo: 'calling')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const callData = change.doc.data();
          setIncomingCall({ id: change.doc.id, ...callData });
        }
      });
    });

    return () => unsubscribe();
  }, [counselorId]);

  const handleAcceptCall = async () => {
    if (incomingCall) {
      await updateDoc(doc(firestore, 'calls', incomingCall.id), { status: 'accepted' });
      navigate(`/video-call?callId=${incomingCall.id}&isCaller=false&currentUserId=${counselorId}&otherUserId=${incomingCall.callerId}`);
      setIncomingCall(null); // Clear incoming call state
    }
  };

  const handleDeclineCall = async () => {
    if (incomingCall) {
      await updateDoc(doc(firestore, 'calls', incomingCall.id), { status: 'declined' });
      setIncomingCall(null); // Clear incoming call state
    }
  };

  if (!incomingCall) {
    return null; // No incoming call to show
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-xl font-bold mb-4">Incoming Video Call</h3>
        <p className="mb-6">Call from {incomingCall.callerName || 'Unknown'}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleDeclineCall}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Decline
          </button>
          <button
            onClick={handleAcceptCall}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallHandler;