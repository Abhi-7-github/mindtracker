import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../store/useMeetingStore';
import { useAuthStore } from '../store/useAuthStore';
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
  Camera,
  RefreshCw,
  AlertTriangle,
  User,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';

export const Meeting = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const normRoomId = String(roomId || 'consultation-room').trim().toLowerCase();

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
  const [mediaError, setMediaError] = useState(null);
  const [micVolume, setMicVolume] = useState(0);

  const localVideoRef = useRef(null);
  const waitingVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const targetPeerIdRef = useRef(null);
  const iceCandidatesQueueRef = useRef([]);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize camera & mic on mount (for waiting room preview)
  const initMedia = useCallback(async () => {
    setMediaError(null);
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;

      // Attach to waiting room video
      if (waitingVideoRef.current) {
        waitingVideoRef.current.srcObject = stream;
        waitingVideoRef.current.play().catch((e) => console.log('Waiting video play note:', e));
      }
      // Attach to in-call local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((e) => console.log('Local video play note:', e));
      }

      // Start Audio Volume Meter to visualize microphone activity
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const audioCtx = new AudioContext();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setMicVolume(Math.min(100, Math.round((average / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (audioErr) {
        console.warn('Audio meter initialization note:', audioErr);
      }
    } catch (err) {
      console.error('Camera/Mic permission error:', err);
      const message =
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera or microphone access was denied by your browser. Please allow permissions in your address bar.'
          : err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError'
          ? 'No camera or microphone device found. Please connect your microphone & webcam.'
          : 'Could not access camera/microphone. Please ensure no other application is using them.';
      setMediaError(message);
    }
  }, []);

  useEffect(() => {
    initMedia();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
    };
  }, [initMedia]);

  // Create or get RTCPeerConnection
  const getOrCreatePeerConnection = useCallback((socket) => {
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

    // Add local media tracks (both audio and video) to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Remote stream track received (audio or video)
    pc.ontrack = (event) => {
      console.log('Remote WebRTC track received:', event.track.kind, event.streams);
      let stream = event.streams && event.streams[0] ? event.streams[0] : null;

      if (!stream) {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        remoteStreamRef.current.addTrack(event.track);
        stream = remoteStreamRef.current;
      } else {
        remoteStreamRef.current = stream;
      }

      if (remoteVideoRef.current) {
        if (remoteVideoRef.current.srcObject !== stream) {
          remoteVideoRef.current.srcObject = stream;
        }
        remoteVideoRef.current.play().catch((e) => console.log('Remote video play note:', e));
      }
      setIsPeerConnected(true);
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
  }, [normRoomId]);

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
        const peerId = peers[0];
        targetPeerIdRef.current = peerId;
        toast.info('Connecting to doctor / patient in consultation room...');

        const pc = getOrCreatePeerConnection(socket);
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
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
      toast.info('Participant joined the consultation room');
      targetPeerIdRef.current = peerId;
      getOrCreatePeerConnection(socket);
    });

    // Received WebRTC Offer
    socket.on('offer', async ({ from, offer }) => {
      console.log('Received WebRTC offer from:', from);
      targetPeerIdRef.current = from;

      const pc = getOrCreatePeerConnection(socket);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await processQueuedCandidates();

        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
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
  }, [normRoomId, getOrCreatePeerConnection]);

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

  // Handle Screen Sharing
  const handleToggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        if (pcRef.current) {
          const senders = pcRef.current.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        toggleScreenShare();
        toast.success('Screen sharing started');
      } catch (err) {
        toast.error('Screen sharing was cancelled or denied');
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }

    if (localStreamRef.current) {
      const camTrack = localStreamRef.current.getVideoTracks()[0];
      if (pcRef.current && camTrack) {
        const senders = pcRef.current.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(camTrack);
        }
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }

    if (screenSharing) toggleScreenShare();
  };

  const handleJoinRoom = async () => {
    if (!localStreamRef.current) {
      await initMedia();
    }

    const socket = connectSocket();
    getOrCreatePeerConnection(socket);

    socket.emit('join-room', normRoomId);
    joinCall();
    toast.success('Entered video consultation room');
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
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

    addMessage({
      text: chatInput,
      sender: user?.name || 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-4 md:p-6 flex flex-col justify-between">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-[#1A1A1A] p-4 rounded-2xl polo-border-dark">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${
              inCall && isPeerConnected
                ? 'bg-emerald-500 animate-pulse'
                : inCall
                ? 'bg-amber-500 animate-ping'
                : 'bg-neutral-500'
            }`}
          />
          <span className="text-sm font-black uppercase tracking-wider">
            Room: <span className="text-[#9F1239]">{normRoomId}</span>
          </span>
          <span className="text-xs font-bold text-neutral-400 hidden sm:inline">
            {isWaitingRoom
              ? '(Pre-Call Waiting Room)'
              : isPeerConnected
              ? '(Live Consultation in Progress)'
              : '(Waiting for other participant to join...)'}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs font-bold text-neutral-400">
          {/* Live Mic Level Indicator */}
          {!audioMuted && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-neutral-800 rounded-lg border border-neutral-700">
              <Volume2 className={`w-3.5 h-3.5 ${micVolume > 15 ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'}`} />
              <div className="w-12 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-75 rounded-full"
                  style={{ width: `${Math.max(8, micVolume)}%` }}
                />
              </div>
            </div>
          )}
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted WebRTC Session</span>
          </div>
        </div>
      </div>

      {/* Pre-Call Waiting Room View with LIVE WEBCAM & MIC PREVIEW */}
      {isWaitingRoom ? (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <Card dark className="max-w-2xl w-full text-center space-y-6 p-6 md:p-8">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#9F1239]/20 text-[#9F1239] border border-[#9F1239] text-xs font-black uppercase tracking-wider mb-2">
                <Camera className="w-3.5 h-3.5" />
                <span>Webcam & Microphone Live Check</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase text-white">
                Consultation Waiting Room
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Preview your camera feed and speak into your microphone to verify audio before entering the session.
              </p>
            </div>

            {/* Webcam & Mic Live Preview Box */}
            <div className="relative w-full aspect-video bg-neutral-900 rounded-2xl overflow-hidden border-2 border-neutral-700 flex items-center justify-center">
              {mediaError ? (
                <div className="p-6 text-center space-y-3">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-amber-400 max-w-sm mx-auto">{mediaError}</p>
                  <Button size="sm" variant="outline" icon={RefreshCw} onClick={initMedia}>
                    Retry Camera & Mic Access
                  </Button>
                </div>
              ) : videoMuted ? (
                <div className="flex flex-col items-center space-y-2 text-neutral-500">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-white font-black text-2xl">
                    {user?.name?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Camera is Turned Off</span>
                </div>
              ) : (
                <video
                  ref={(el) => {
                    waitingVideoRef.current = el;
                    if (el && localStreamRef.current && el.srcObject !== localStreamRef.current) {
                      el.srcObject = localStreamRef.current;
                      el.play().catch((e) => console.log(e));
                    }
                  }}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover -scale-x-100"
                />
              )}

              {/* Waiting Room Live Mic Visualizer Banner */}
              {!audioMuted && !mediaError && (
                <div className="absolute top-3 left-3 flex items-center space-x-2 bg-black/75 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 text-[11px] font-bold">
                  <Mic className={`w-3.5 h-3.5 ${micVolume > 15 ? 'text-emerald-400' : 'text-neutral-400'}`} />
                  <span>Mic: {micVolume > 15 ? 'Speaking...' : 'Listening'}</span>
                  <div className="w-10 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75 rounded-full"
                      style={{ width: `${Math.max(10, micVolume)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Waiting Room Quick Device Toggles */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                <button
                  onClick={toggleAudio}
                  className={`p-2 rounded-lg transition-colors ${
                    audioMuted ? 'bg-red-600 text-white' : 'bg-neutral-800 text-white hover:bg-neutral-700'
                  }`}
                  title={audioMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {audioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-2 rounded-lg transition-colors ${
                    videoMuted ? 'bg-red-600 text-white' : 'bg-neutral-800 text-white hover:bg-neutral-700'
                  }`}
                  title={videoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {videoMuted ? <VideoOff className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="w-full sm:w-auto px-8" onClick={handleJoinRoom}>
                Enter Video Consultation
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => navigate('/appointments')}
              >
                Back to Consultations
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* In-Call Video Grid Layout */
        <div className="flex-1 my-4 grid grid-cols-1 lg:grid-cols-4 gap-4 relative overflow-hidden">
          {/* Main Remote Video Screen */}
          <div className="lg:col-span-3 bg-[#1A1A1A] rounded-3xl polo-border-dark relative overflow-hidden flex items-center justify-center min-h-[440px]">
            {/* Remote Peer Stream (Audio + Video) */}
            <video
              ref={(el) => {
                remoteVideoRef.current = el;
                if (el && remoteStreamRef.current && el.srcObject !== remoteStreamRef.current) {
                  el.srcObject = remoteStreamRef.current;
                  el.play().catch((e) => console.log('Remote play note:', e));
                }
              }}
              autoPlay
              playsInline
              className={`w-full h-full object-cover rounded-3xl ${isPeerConnected ? 'block' : 'hidden'}`}
            />

            {/* Waiting for other participant overlay */}
            {!isPeerConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-6 text-center">
                <Users className="w-12 h-12 text-[#9F1239] animate-bounce mb-3" />
                <h3 className="text-xl font-black uppercase text-white">
                  Waiting for Participant to Join...
                </h3>
                <p className="text-xs font-semibold text-neutral-400 max-w-sm mt-1">
                  Share Room ID{' '}
                  <span className="text-white font-mono bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
                    {normRoomId}
                  </span>{' '}
                  with your doctor or patient to begin consultation.
                </p>
              </div>
            )}

            {/* Local Pip Video Overlay */}
            <div className="absolute bottom-4 right-4 w-44 md:w-56 aspect-video bg-black rounded-2xl border-2 border-white overflow-hidden polo-shadow z-10 flex items-center justify-center">
              {videoMuted ? (
                <div className="text-center p-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 text-white font-black mx-auto flex items-center justify-center text-xs mb-1">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Camera Off</span>
                </div>
              ) : (
                <video
                  ref={(el) => {
                    localVideoRef.current = el;
                    if (el && localStreamRef.current && el.srcObject !== localStreamRef.current) {
                      el.srcObject = localStreamRef.current;
                      el.play().catch((e) => console.log('Local PIP play note:', e));
                    }
                  }}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover -scale-x-100"
                />
              )}
            </div>
          </div>

          {/* Side Drawer (Chat / Clinical Notes) */}
          {(showChat || showNotes) && (
            <Card dark className="lg:col-span-1 flex flex-col justify-between h-full p-4">
              {showChat && (
                <div className="flex flex-col h-full space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-700 pb-2">
                    <h4 className="text-sm font-black uppercase">In-Meeting Chat</h4>
                    <span className="text-[10px] text-neutral-400 font-bold">{messages.length} messages</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 text-xs max-h-96">
                    {messages.length === 0 ? (
                      <p className="text-neutral-500 italic py-8 text-center">No messages yet. Send a message below.</p>
                    ) : (
                      messages.map((m, i) => (
                        <div key={i} className="p-2.5 bg-neutral-800 rounded-xl border border-neutral-700">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#9F1239] text-[11px]">{m.sender}</span>
                            <span className="text-[9px] text-neutral-500 font-mono">{m.time}</span>
                          </div>
                          <p className="text-neutral-200">{m.text}</p>
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
                    className="w-full flex-1 bg-neutral-800 text-white p-3 text-xs rounded-xl focus:outline-none border border-neutral-700 resize-none min-h-[220px]"
                    placeholder="Document clinical observations, therapeutic interventions, and follow-up notes..."
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                  />
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Control Bar Footer in Call */}
      {inCall && (
        <div className="bg-[#1A1A1A] p-4 rounded-2xl polo-border-dark flex items-center justify-center space-x-3 md:space-x-4">
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
            onClick={handleToggleScreenShare}
            title={screenSharing ? 'Stop Screen Share' : 'Share Screen'}
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
