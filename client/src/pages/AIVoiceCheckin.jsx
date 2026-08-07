import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { AudioWaveform } from '../components/common/AudioWaveform';
import { useVoiceStore } from '../store/useVoiceStore';
import { Mic, Square, Play, RefreshCw, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AIVoiceCheckin = () => {
  const navigate = useNavigate();
  const { uploadVoiceCheckin, isProcessing } = useVoiceStore();

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [timer, setTimer] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimer(0);

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
    }
  };

  const resetAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTimer(0);
  };

  const handleSubmit = async () => {
    if (!audioBlob) return toast.error('Please record audio first');
    
    toast.info('Uploading audio for AI analysis...');
    const res = await uploadVoiceCheckin(audioBlob);

    if (res.success && res.data) {
      toast.success('AI analysis completed!');
      navigate(`/ai-report/${res.data.sessionId}`, { state: { report: res.data } });
    } else {
      toast.error(res.message || 'AI Voice Check-in failed');
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
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 text-[#B82126] border-2 border-[#B82126] text-xs font-black uppercase">
            <Mic className="w-3.5 h-3.5" />
            <span>AI Voice Journaling</span>
          </div>
          <h1 className="text-3xl font-black uppercase text-black">Record Voice Check-in</h1>
          <p className="text-xs font-bold text-neutral-600">
            Speak naturally about your day, emotions, or thoughts. OpenAI Whisper and GPT-5.1 will analyze your speech.
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
          {/* Wave Visualizer */}
          <AudioWaveform isRecording={isRecording} className="w-full" />

          {/* Recording Timer */}
          <div className="text-3xl font-black text-black tracking-widest font-mono">
            {formatTimer(timer)}
          </div>

          {/* Recording Audio Preview */}
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

            {audioBlob && !isRecording && (
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
