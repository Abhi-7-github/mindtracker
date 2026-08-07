import { create } from 'zustand';
import * as aiService from '../services/aiService';

export const useVoiceStore = create((set) => ({
  isRecording: false,
  audioBlob: null,
  isProcessing: false,
  currentReport: null,
  error: null,

  setRecording: (status) => set({ isRecording: status }),
  setAudioBlob: (blob) => set({ audioBlob: blob }),
  
  uploadVoiceCheckin: async (fileBlob, liveTranscript = '') => {
    set({ isProcessing: true, error: null });
    try {
      const formData = new FormData();
      if (fileBlob) {
        formData.append('audio', fileBlob, 'checkin.webm');
      }
      if (liveTranscript) {
        formData.append('liveTranscript', liveTranscript);
      }
      const res = await aiService.voiceCheckin(formData);
      if (res.success && res.data) {
        set({ currentReport: res.data, isProcessing: false });
        return { success: true, data: res.data };
      }
      throw new Error(res.message || 'Voice check-in failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Voice check-in failed';
      set({ isProcessing: false, error: msg });
      return { success: false, message: msg };
    }
  },


  clearReport: () => set({ currentReport: null, audioBlob: null, error: null })
}));
