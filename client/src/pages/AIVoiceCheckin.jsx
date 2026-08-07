import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { AudioWaveform } from '../components/common/AudioWaveform';
import { useVoiceStore } from '../store/useVoiceStore';
import { Mic, Square, Play, RefreshCw, Send, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const AIVoiceCheckin = () => {
  const navigate = useNavigate();
  const { uploadVoiceCheckin, isProcessing } = useVoiceStore();

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [timer, setTimer] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition if available in browser
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setLiveTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const options = mimeType ? { mimeType } : undefined;
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const type = mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start(250);
      setIsRecording(true);
      setTimer(0);
      setLiveTranscript('');

      // Start live speech recognition in parallel
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Speech recognition already active:', e);
        }
      }

      timerIntervalRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } catch (err) {
      toast.error('Microphone permission denied or audio device not found');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
  };

  const resetAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setLiveTranscript('');
    setTimer(0);
  };

  const handleSubmit = async () => {
    if (!audioBlob && !liveTranscript.trim()) {
      return toast.error('Please record your voice or provide a transcript');
    }

    toast.info('Analyzing voice check-in with Whisper & GPT...');
    const res = await uploadVoiceCheckin(audioBlob, liveTranscript);

    if (res.success && res.data) {
      toast.success('AI assessment completed!');
      navigate(`/ai-report/${res.data.sessionId}`, { state: { report: res.data } });
    } else {
      toast.error(res.message || 'AI Voice Check-in failed. Please try again.');
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 text-[#9F1239] border-2 border-[#9F1239] text-xs font-black uppercase">
            <Mic className="w-3.5 h-3.5" />
            <span>AI Voice Journaling</span>
          </div>
          <h1 className="text-3xl font-black uppercase text-black">Record Voice Check-in</h1>
          <p className="text-xs font-bold text-neutral-600">
            Speak naturally about your day, emotions, or thoughts. OpenAI Whisper and GPT analyze your speech in real time.
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
          {/* Wave Visualizer */}
          <AudioWaveform isRecording={isRecording} className="w-full" />

          {/* Recording Timer */}
          <div className="text-3xl font-black text-black tracking-widest font-mono">
            {formatTimer(timer)}
          </div>

          {/* Live Real-time Speech-to-Text Preview */}
          {(isRecording || liveTranscript) && (
            <div className="w-full text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-black uppercase">
                <span className="flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#9F1239]" />
                  <span>{isRecording ? 'Live Transcription (Listening...)' : 'Voice Transcript Preview'}</span>
                </span>
                {isRecording && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-[#9F1239] animate-pulse">
                    Live
                  </span>
                )}
              </div>
              <textarea
                value={liveTranscript}
                onChange={(e) => setLiveTranscript(e.target.value)}
                placeholder={isRecording ? 'Listening to your voice...' : 'Your spoken words will appear here...'}
                rows={3}
                className="w-full bg-neutral-50 text-black p-3.5 text-xs rounded-xl polo-border font-medium focus:outline-none focus:bg-white transition-all"
              />
            </div>
          )}

          {/* Recording Audio Playback Preview */}
          {audioUrl && !isRecording && (
            <div className="w-full p-4 bg-neutral-100 rounded-2xl polo-border flex items-center justify-center">
              <audio src={audioUrl} controls className="w-full max-w-md" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {!isRecording && !audioBlob && (
              <Button size="lg" icon={Mic} onClick={startRecording}>
                Start Recording
              </Button>
            )}

            {isRecording && (
              <Button size="lg" variant="danger" icon={Square} onClick={stopRecording}>
                Stop Recording
              </Button>
            )}

            {(audioBlob || liveTranscript) && !isRecording && (
              <>
                <Button variant="outline" icon={RefreshCw} onClick={resetAudio}>
                  Re-record
                </Button>
                <Button icon={Send} onClick={handleSubmit} isLoading={isProcessing}>
                  Analyze Audio
                </Button>
              </>
            )}
          </div>
        </Card>

        {isProcessing && (
          <Card className="polo-glass">
            <Loader text="Transcribing Audio & Generating Mental Health Assessment..." />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

