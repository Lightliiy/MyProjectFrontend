import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  deleteDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { firebaseConfig } from "../Dashboard/Firebase";

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoCall = () => {
  const [searchParams] = useSearchParams();
  const callId = searchParams.get("callId");
  const isCaller = searchParams.get("isCaller") === "true";
  const currentUserId = searchParams.get("currentUserId");
  const otherUserId = searchParams.get("otherUserId");

  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Starting connection...");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnection = useRef(null);
  const unsubRef = useRef(null);

  const navigate = useNavigate();

  // Logging helpers
  const tag = `[VC:${callId || "no-id"} | ${isCaller ? "CALLER" : "CALLEE"}]`;
  const log = (...a) => console.log(tag, ...a);
  const warn = (...a) => console.warn(tag, ...a);
  const err = (...a) => console.error(tag, ...a);

  const safePlay = async (videoEl, label) => {
    if (!videoEl) return;
    try {
      await videoEl.play();
      log(`${label} video.play(): OK`);
    } catch (e) {
      warn(`${label} video.play() blocked/failed:`, e);
    }
  };

  const ensureCallDoc = async (callDocRef) => {
    const snap = await getDoc(callDocRef);
    if (!snap.exists()) {
      log("Call doc does not exist yet. Creating placeholder.");
      await setDoc(
        callDocRef,
        {
          createdAt: Date.now(),
          participants: arrayUnion(currentUserId),
          iceCandidates: {},
        },
        { merge: true }
      );
    }
  };

  const attachPeerConnectionDebug = (pc) => {
    pc.addEventListener("icegatheringstatechange", () =>
      log("iceGatheringState:", pc.iceGatheringState)
    );
    pc.addEventListener("iceconnectionstatechange", () =>
      log("iceConnectionState:", pc.iceConnectionState)
    );
    pc.addEventListener("connectionstatechange", () =>
      log("connectionState:", pc.connectionState)
    );
    pc.addEventListener("signalingstatechange", () =>
      log("signalingState:", pc.signalingState)
    );
    pc.addEventListener("negotiationneeded", () => log("negotiationneeded"));
    pc.addEventListener("icecandidateerror", (e) =>
      err("ICE candidate ERROR:", e)
    );
  };

  const dumpStreamTracks = (stream, label) => {
    if (!stream) {
      log(`${label}: no stream`);
      return;
    }
    const aud = stream.getAudioTracks();
    const vid = stream.getVideoTracks();
    log(
      `${label}: tracks -> audio(${aud.length}) video(${vid.length})`,
      {
        audio: aud.map((t) => ({
          id: t.id,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState,
          label: t.label,
          kind: t.kind,
        })),
        video: vid.map((t) => ({
          id: t.id,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState,
          label: t.label,
          kind: t.kind,
        })),
      }
    );
  };

  const handleCallFlow = async () => {
    if (!callId || !currentUserId || !otherUserId) {
      toast.error("Invalid call parameters.");
      warn("Missing params", { callId, currentUserId, otherUserId, isCaller });
      navigate(-1);
      return;
    }

    log("Environment:", {
      href: window.location.href,
      isSecureContext: window.isSecureContext,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    });

    const callDocRef = doc(firestore, "calls", callId);

    try {
      setIsLoading(true);
      setConnectionStatus("Requesting camera and microphone access...");
      log("Requesting getUserMedia({video:true,audio:true})");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      dumpStreamTracks(stream, "LOCAL stream");

      // Enhanced local video handling
      if (localVideoRef.current) {
        log("Setting up local video element");
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.onloadedmetadata = () => {
          log("Local video metadata loaded");
          safePlay(localVideoRef.current, "Local").catch(e => 
            warn("Local video play error:", e)
          );
        };
      }

      setConnectionStatus("Establishing connection...");
      peerConnection.current = new RTCPeerConnection(configuration);
      const pc = peerConnection.current;
      attachPeerConnectionDebug(pc);

      // Add all tracks to connection
      stream.getTracks().forEach((track) => {
        log("Adding local track:", {
          id: track.id,
          kind: track.kind,
          label: track.label,
        });
        track.onended = () => warn("Local track ended:", track.id, track.kind);
        pc.addTrack(track, stream);
      });

      // Enhanced remote stream handling
      pc.ontrack = (event) => {
        log("ontrack fired; streams:", event.streams?.length || 0);
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];
          dumpStreamTracks(remoteStream, "REMOTE stream (ontrack)");
          
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.onloadedmetadata = () => {
              log("Remote video metadata loaded");
              safePlay(remoteVideoRef.current, "Remote").catch(e =>
                warn("Remote video play error:", e)
              );
            };
          }
          setConnectionStatus("Connected");
          setIsLoading(false);
        }
      };

      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          log("Local ICE candidate:", event.candidate.candidate);
          const candidateData = event.candidate.toJSON();
          try {
            await ensureCallDoc(callDocRef);
            await updateDoc(callDocRef, {
              [`iceCandidates.${currentUserId}`]: arrayUnion(candidateData),
            });
          } catch (e) {
            err("Failed to write local ICE to Firestore:", e);
          }
        } else {
          log("ICE gathering complete (null candidate).");
        }
      };

      await ensureCallDoc(callDocRef);

      if (isCaller) {
        log("Creating OFFER...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        log("LocalDescription set (OFFER). SDP length:", offer.sdp?.length);
       
        await setDoc(
          callDocRef,
          {
            offer: { 
              type: offer.type, 
              sdp: offer.sdp, 
              userId: currentUserId 
            },
            status: "calling",
            participants: arrayUnion(currentUserId),
          },
          { merge: true }
        );
        log("Offer written to Firestore.");
      } else {
        await setDoc(
          callDocRef,
          {
            status: "in_call",
            participants: arrayUnion(currentUserId),
          },
          { merge: true }
        );
        log("Callee set status=in_call (merge).");
      }

      const callUnsubscribe = onSnapshot(
        callDocRef,
        async (snapshot) => {
          if (!peerConnection.current) {
            warn("Peer connection is null during snapshot; ignoring.");
            return;
          }

          if (!snapshot.exists()) {
            toast.info("Call ended by the other user.");
            warn("Call doc deleted -> ending call.");
            endCall();
            return;
          }

          const data = snapshot.data();
          log("Firestore snapshot:", data);

          if (data.status === "ended" || data.status === "declined") {
            toast.info("Call ended or declined.");
            warn("Status:", data.status, "-> ending call.");
            endCall();
            return;
          }

          if (isCaller) {
            if (data?.answer && !peerConnection.current.currentRemoteDescription) {
              log("Setting REMOTE answer.");
              try {
                const answerDescription = new RTCSessionDescription(data.answer);
                await peerConnection.current.setRemoteDescription(answerDescription);
                log("RemoteDescription set (ANSWER).");
              } catch (e) {
                err("setRemoteDescription(ANSWER) failed:", e);
              }
            }
          } else {
            if (data?.offer && !peerConnection.current.currentRemoteDescription) {
              log("Setting REMOTE offer and creating ANSWER.");
              try {
                const offerDescription = new RTCSessionDescription(data.offer);
                await peerConnection.current.setRemoteDescription(offerDescription);
                log("RemoteDescription set (OFFER).");
               
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                log("LocalDescription set (ANSWER).");
               
                await updateDoc(
                  callDocRef,
                  {
                    answer: {
                      type: answer.type,
                      sdp: answer.sdp,
                      userId: currentUserId,
                    },
                  },
                  { merge: true }
                );
                log("Answer written to Firestore.");
              } catch (e) {
                err("Offer->Answer flow failed:", e);
              }
            }
          }

          if (data?.iceCandidates?.[otherUserId]?.length) {
            const list = data.iceCandidates[otherUserId];
            log(`Applying ${list.length} remote ICE candidates from ${otherUserId}.`);
            for (const candidateData of list) {
              if (!peerConnection.current) break;
              try {
                const candidate = new RTCIceCandidate(candidateData);
                await peerConnection.current.addIceCandidate(candidate);
                log("Added remote ICE:", candidate.candidate);
              } catch (e) {
                err("Error adding remote ICE candidate:", e, candidateData);
              }
            }
            try {
              await updateDoc(callDocRef, { [`iceCandidates.${otherUserId}`]: [] });
              log("Cleared consumed remote ICE candidates in Firestore.");
            } catch (e) {
              err("Failed clearing remote ICE candidates:", e);
            }
          }
        },
        (e) => err("onSnapshot error:", e)
      );

      unsubRef.current = callUnsubscribe;
      return callUnsubscribe;
    } catch (error) {
      err("Error starting call:", error);
      toast.error(
        error?.name === "NotAllowedError"
          ? "Camera or microphone access denied. Please allow access and try again."
          : "Failed to start call. Check console for details."
      );
      endCall();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribeCallback;
    handleCallFlow().then((unsubscribe) => {
      unsubscribeCallback = unsubscribe;
    });

    return () => {
      if (unsubscribeCallback) {
        unsubscribeCallback();
      }
      endCall(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId, isCaller, currentUserId, otherUserId, navigate]);

  const endCall = async (isCleanup = false) => {
    log("endCall invoked. cleanup?", isCleanup);

    if (localStreamRef.current) {
      log("Stopping local tracks.");
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection.current) {
      log("Closing RTCPeerConnection.");
      peerConnection.current.close();
    }
    localStreamRef.current = null;
    peerConnection.current = null;

    try {
      if (unsubRef.current) {
        log("Unsubscribing Firestore onSnapshot.");
        unsubRef.current();
        unsubRef.current = null;
      }
    } catch (e) {
      err("Error unsubscribing snapshot:", e);
    }

    if (callId && !isCleanup) {
      try {
        log("Marking call ended & deleting call doc.");
        await updateDoc(doc(firestore, "calls", callId), { status: "ended" });
        await deleteDoc(doc(firestore, "calls", callId));
      } catch (error) {
        err("Error ending call:", error);
      }
    }

    if (!isCleanup) {
      navigate(-1);
    }
  };

  const toggleAudio = () => {
    const stream = localStreamRef.current;
    if (!stream) return warn("toggleAudio: no local stream");
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return warn("toggleAudio: no audio track");
    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
    log("toggleAudio -> track.enabled:", audioTrack.enabled);
  };

  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (!stream) return warn("toggleVideo: no local stream");
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return warn("toggleVideo: no video track");
    videoTrack.enabled = !videoTrack.enabled;
    setIsVideoOn(videoTrack.enabled);
    log("toggleVideo -> track.enabled:", videoTrack.enabled);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-xl">{connectionStatus}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full absolute top-0 left-0 object-cover"
        />
        {connectionStatus !== "Connected" && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 text-white text-xl">
            {connectionStatus}
          </div>
        )}
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
          className={`p-3 rounded-full ${
            isMuted ? "bg-red-500" : "bg-gray-700"
          } text-white hover:bg-gray-600 transition`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
          title="End Call"
        >
          <FaPhoneSlash />
        </button>
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            !isVideoOn ? "bg-red-500" : "bg-gray-700"
          } text-white hover:bg-gray-600 transition`}
          title={isVideoOn ? "Turn Off Video" : "Turn On Video"}
        >
          {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;