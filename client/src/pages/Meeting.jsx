import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../store/useMeetingStore';
import { connectSocket } from '../services/socketService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Send,
  Users,
  ShieldCheck,
  Monitor,
} from 'lucide-react';
import { toast } from 'sonner';

export const Meeting = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const normRoomId = String(roomId || 'demo-room').trim().toLowerCase();

  const {
    inCall,
    isWaitingRoom,
    audioMuted,
    videoMuted,
    screenSharing,
    messages,
    clinicalNotes,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    addMessage,
    setClinicalNotes,
  } = useMeetingStore();

  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isPeerConnected, setIsPeerConnected] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const targetPeerIdRef = useRef(null);
  const iceCandidatesQueueRef = useRef([]);

  // Create or get RTCPeerConnection
  const getOrCreatePeerConnection = (socket) => {
    if (pcRef.current) return pcRef.current;

    console.log('Creating WebRTC RTCPeerConnection...');
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
    });

    // Add local media tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Remote stream track received
    pc.ontrack = (event) => {
      console.log('Remote WebRTC track received:', event.streams);
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.play().catch((e) => console.log('Remote stream play error:', e));
        }
        setIsPeerConnected(true);
      }
    };

    // ICE candidate generated locally -> send to target peer
    pc.onicecandidate = (event) => {
      if (event.candidate && targetPeerIdRef.current) {
        socket.emit('ice-candidate', {
          to: targetPeerIdRef.current,
          roomId: normRoomId,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE Connection State changed:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setIsPeerConnected(true);
      } else if (
        pc.iceConnectionState === 'disconnected' ||
        pc.iceConnectionState === 'failed' ||
        pc.iceConnectionState === 'closed'
      ) {
        setIsPeerConnected(false);
      }
    };

    pcRef.current = pc;
    return pc;
  };

  // Process any ICE candidates buffered before setRemoteDescription
  const processQueuedCandidates = async () => {
    if (!pcRef.current || !pcRef.current.remoteDescription) return;

    while (iceCandidatesQueueRef.current.length > 0) {
      const candidate = iceCandidatesQueueRef.current.shift();
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding queued ICE candidate:', err);
      }
    }
  };

  // Socket setup and WebRTC signaling
  useEffect(() => {
    const socket = connectSocket();

    // Joining peer receives list of existing peers in the room
    socket.on('existing-peers', async (peers) => {
      console.log('Existing peers in room:', peers);
      if (peers && peers.length > 0) {
        const peerId = peers[0]; // Connect to first active peer
        targetPeerIdRef.current = peerId;
        toast.info('Connecting to practitioner / patient in room...');

        const pc = getOrCreatePeerConnection(socket);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { to: peerId, offer });
        } catch (err) {
          console.error('Error creating offer for existing peer:', err);
        }
      }
    });

    // Existing peer receives notice when a new peer joins
    socket.on('peer-joined', (peerId) => {
      console.log('Peer joined room:', peerId);
      toast.info('Participant joined consultation room');
      targetPeerIdRef.current = peerId;
      getOrCreatePeerConnection(socket);
      // Wait for incoming offer from joining peer to prevent offer glare
    });

    // Received WebRTC Offer
    socket.on('offer', async ({ from, offer }) => {
      console.log('Received WebRTC offer from:', from);
      targetPeerIdRef.current = from;

      const pc = getOrCreatePeerConnection(socket);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await processQueuedCandidates();

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { to: from, answer });
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
      }
    });

    // Received WebRTC Answer
    socket.on('answer', async ({ from, answer }) => {
      console.log('Received WebRTC answer from:', from);
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          await processQueuedCandidates();
        } catch (err) {
          console.error('Error handling WebRTC answer:', err);
        }
      }
    });

    // Received ICE candidate
    socket.on('ice-candidate', async ({ from, candidate }) => {
      if (!candidate) return;

      if (pcRef.current && pcRef.current.remoteDescription) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      } else {
        iceCandidatesQueueRef.current.push(candidate);
      }
    });

    socket.on('peer-left', () => {
      toast.info('Participant left the consultation');
      setIsPeerConnected(false);
      remoteStreamRef.current = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    });

    return () => {
      socket.off('existing-peers');
      socket.off('peer-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('peer-left');
    };
  }, [normRoomId]);

  // Bind local stream to localVideoRef when inCall becomes true or element mounts
  useEffect(() => {
    if (inCall && localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch((err) => console.log('Local video play error:', err));
    }
  }, [inCall]);

  // Bind remote stream to remoteVideoRef when inCall/isPeerConnected changes or element mounts
  useEffect(() => {
    if (inCall && remoteStreamRef.current && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current.play().catch((err) => console.log('Remote video play error:', err));
    }
  }, [inCall, isPeerConnected]);

  // Handle Mute/Unmute Audio & Video
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !audioMuted;
      });
    }
  }, [audioMuted]);

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !videoMuted;
      });
    }
  }, [videoMuted]);

  const handleJoinRoom = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;

      const socket = connectSocket();
      getOrCreatePeerConnection(socket);

      socket.emit('join-room', normRoomId);
      joinCall(); // Switches state to inCall: mounts video grid!
      toast.success('Joined video consultation room');
    } catch (err) {
      console.error('Media access error:', err);
      toast.error('Unable to access camera or microphone. Please ensure browser permissions are allowed.');
    }
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    const socket = connectSocket();
    socket.emit('leave-room', normRoomId);

    leaveCall();
    navigate('/appointments');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    addMessage({ text: chatInput, sender: 'You', time: new Date().toLocaleTimeString() });
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-4 md:p-6 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-[#1A1A1A] p-4 rounded-2xl polo-border-dark">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isPeerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-sm font-black uppercase tracking-wider">
            Room: <span className="text-[#B82126]">{normRoomId}</span>
          </span>
          <span className="text-xs font-bold text-neutral-400">
            ({isPeerConnected ? 'Connected to Practitioner / Patient' : 'Waiting for Participant...'})
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Encrypted WebRTC Video Consultation</span>
        </div>
      </div>

      {/* Pre-call Waiting Room View */}
      {isWaitingRoom ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <Card dark className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-[#B82126] rounded-2xl border-2 border-white flex items-center justify-center mx-auto polo-shadow">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase">Session Waiting Room</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Check your camera & mic before entering the encrypted video consultation.
              </p>
            </div>

            <Button size="lg" className="w-full" onClick={handleJoinRoom}>
              Enter Video Consultation
            </Button>
          </Card>
        </div>
      ) : (
        /* Video Grid Layout */
        <div className="flex-1 my-4 grid grid-cols-1 lg:grid-cols-4 gap-4 relative overflow-hidden">
          {/* Main Video Screen (Remote Peer) */}
          <div className="lg:col-span-3 bg-[#1A1A1A] rounded-3xl polo-border-dark relative overflow-hidden flex items-center justify-center min-h-[420px]">
            {/* Remote Video Stream */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-3xl"
            />

            {!isPeerConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
                <Users className="w-12 h-12 text-[#B82126] animate-bounce mb-2" />
                <h3 className="text-lg font-black uppercase text-white">Waiting for Participant to Join...</h3>
                <p className="text-xs font-semibold text-neutral-400 max-w-sm mt-1">
                  Share room ID <span className="text-white font-mono bg-neutral-800 px-2 py-0.5 rounded">{normRoomId}</span> with doctor/patient to begin consultation.
                </p>
              </div>
            )}

            {/* Local Pip Video */}
            <div className="absolute bottom-4 right-4 w-44 h-32 bg-black rounded-2xl border-2 border-white overflow-hidden polo-shadow z-10">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Side Drawer (Chat / Clinical Notes) */}
          {(showChat || showNotes) && (
            <Card dark className="lg:col-span-1 flex flex-col justify-between h-full p-4">
              {showChat && (
                <div className="flex flex-col h-full space-y-3">
                  <h4 className="text-sm font-black uppercase border-b border-neutral-700 pb-2">
                    In-Meeting Chat
                  </h4>
                  <div className="flex-1 overflow-y-auto space-y-2 text-xs">
                    {messages.length === 0 ? (
                      <p className="text-neutral-500 italic py-4 text-center">No messages sent yet</p>
                    ) : (
                      messages.map((m, i) => (
                        <div key={i} className="p-2 bg-neutral-800 rounded-lg">
                          <span className="font-bold text-[#B82126]">{m.sender}: </span>
                          <span>{m.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex space-x-2 pt-2 border-t border-neutral-700">
                    <Input
                      placeholder="Type message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <Button type="submit" size="icon" icon={Send} />
                  </form>
                </div>
              )}

              {showNotes && (
                <div className="flex flex-col h-full space-y-3">
                  <h4 className="text-sm font-black uppercase border-b border-neutral-700 pb-2">
                    Clinical Session Notes
                  </h4>
                  <textarea
                    className="w-full h-full bg-neutral-800 text-white p-3 text-xs rounded-xl focus:outline-none border border-neutral-700 resize-none"
                    placeholder="Write session summary notes..."
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                  />
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Control Bar Footer */}
      {inCall && (
        <div className="bg-[#1A1A1A] p-4 rounded-2xl polo-border-dark flex items-center justify-center space-x-4">
          <Button
            variant={audioMuted ? 'danger' : 'outline'}
            size="icon"
            onClick={toggleAudio}
            title={audioMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            variant={videoMuted ? 'danger' : 'outline'}
            size="icon"
            onClick={toggleVideo}
            title={videoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {videoMuted ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
          </Button>

          <Button
            variant={screenSharing ? 'secondary' : 'outline'}
            size="icon"
            onClick={toggleScreenShare}
            title="Screen Share"
          >
            <Monitor className="w-5 h-5" />
          </Button>

          <Button
            variant={showChat ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => {
              setShowChat(!showChat);
              setShowNotes(false);
            }}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          <Button
            variant={showNotes ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => {
              setShowNotes(!showNotes);
              setShowChat(false);
            }}
            title="Clinical Notes"
          >
            <FileText className="w-5 h-5" />
          </Button>

          <Button variant="danger" icon={PhoneOff} onClick={handleEndCall}>
            End Call
          </Button>
        </div>
      )}
    </div>
  );
};
