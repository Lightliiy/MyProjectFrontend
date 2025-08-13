import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, updateDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { firebaseConfig } from "../Dashboard/Firebase";

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const VideoCall = () => {
  const [searchParams] = useSearchParams();
  const callId = searchParams.get("callId");
  const isCaller = searchParams.get("isCaller") === 'true';
  const currentUserId = searchParams.get("currentUserId");
  const otherUserId = searchParams.get("otherUserId");

  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnection = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (callId) {
      startCall();
    }
    return () => {
      endCall();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId, isCaller, currentUserId, otherUserId]);

  const startCall = async () => {
    try {
      setIsLoading(true);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const callDoc = doc(firestore, "calls", callId);
      const callerCandidates = collection(callDoc, "candidates", currentUserId, "ice");
      const receiverCandidates = collection(callDoc, "candidates", otherUserId, "ice");

      peerConnection.current = new RTCPeerConnection(configuration);

      peerConnection.current.onicecandidate = async (event) => {
        if (event.candidate) {
          await addDoc(
            callerCandidates,
            event.candidate.toJSON()
          );
        }
      };

      peerConnection.current.ontrack = (event) => {
        if (event.streams && event.streams[0] && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      if (isCaller) {
        await createOffer(callDoc, callerCandidates, receiverCandidates);
      } else {
        await createAnswer(callDoc, callerCandidates, receiverCandidates);
      }
    } catch (e) {
      console.error("Error starting call:", e);
      alert("Failed to start call. Check console for details.");
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const createOffer = async (callDoc, callerCandidates, receiverCandidates) => {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    await setDoc(callDoc, { 
      offer: { type: offer.type, sdp: offer.sdp }, 
      status: 'calling' 
    }, { merge: true });

    onSnapshot(receiverCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const candidate = new RTCIceCandidate({
            candidate: data.candidate,
            sdpMid: data.sdpMid,
            sdpMLineIndex: data.sdpMLineIndex
          });
          peerConnection.current.addIceCandidate(candidate);
        }
      });
    });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (data?.answer && !peerConnection.current.currentRemoteDescription) {
        const answerDescription = new RTCSessionDescription(data.answer);
        peerConnection.current.setRemoteDescription(answerDescription);
      }
    });
  };

  const createAnswer = async (callDoc, callerCandidates, receiverCandidates) => {
    onSnapshot(callDoc, async (snapshot) => {
      const data = snapshot.data();
      if (data?.offer && !peerConnection.current.currentRemoteDescription) {
        const offerDescription = new RTCSessionDescription(data.offer);
        await peerConnection.current.setRemoteDescription(offerDescription);

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        await updateDoc(callDoc, { 
          answer: { type: answer.type, sdp: answer.sdp }, 
          status: 'in_call' 
        });

        onSnapshot(callerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              const candidate = new RTCIceCandidate({
                candidate: data.candidate,
                sdpMid: data.sdpMid,
                sdpMLineIndex: data.sdpMLineIndex
              });
              peerConnection.current.addIceCandidate(candidate);
            }
          });
        });
      }
    });
  };

  const endCall = async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    
    if (callId) {
      await updateDoc(doc(firestore, "calls", callId), { status: "ended" });
    }

    navigate(-1);
  };
  
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(!videoTrack.enabled);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black text-white flex items-center justify-center">
        Joining the call...
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col">
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full absolute top-0 left-0 object-cover"
        />
        {/* Local Video */}
        <div className="w-1/4 h-1/4 absolute top-4 right-4 z-10 rounded-lg overflow-hidden border-2 border-white">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="p-4 bg-gray-900 flex justify-center space-x-4">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white`}
        >
          <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
        </button>
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 text-white"
        >
          <i className="fas fa-phone-slash"></i>
        </button>
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${!isVideoOn ? 'bg-red-500' : 'bg-gray-700'} text-white`}
        >
          <i className={`fas ${isVideoOn ? 'fa-video' : 'fa-video-slash'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default VideoCall;