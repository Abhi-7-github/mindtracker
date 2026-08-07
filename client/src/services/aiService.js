import api from '../api/api';

export async function voiceCheckin(formData) {
  return api.post('/api/ai/voice-checkin', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
