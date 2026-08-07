import { create } from 'zustand';

export const useMeetingStore = create((set, get) => ({
  roomId: null,
  inCall: false,
  isWaitingRoom: true,
  audioMuted: false,
  videoMuted: false,
  screenSharing: false,
  participants: [],
  messages: [],
  clinicalNotes: '',

  setRoomId: (id) => set({ roomId: id }),
  joinCall: () => set({ inCall: true, isWaitingRoom: false }),
  leaveCall: () => set({ inCall: false, isWaitingRoom: true, roomId: null, messages: [] }),
  
  toggleAudio: () => set((state) => ({ audioMuted: !state.audioMuted })),
  toggleVideo: () => set((state) => ({ videoMuted: !state.videoMuted })),
  toggleScreenShare: () => set((state) => ({ screenSharing: !state.screenSharing })),

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setClinicalNotes: (notes) => set({ clinicalNotes: notes }),
  setParticipants: (list) => set({ participants: list }),
}));
