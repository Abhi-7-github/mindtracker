import api from '../api/api';

export async function voiceCheckin(formData) {
  return api.post('/api/ai/voice-checkin', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function getLatestSession() {
  return api.get('/api/ai/latest-session');
}

export async function getSessionById(sessionId) {
  return api.get(`/api/ai/session/${sessionId}`);
}

export async function getJournals() {
  return api.get('/api/ai/journals');
}

export async function createJournal(data) {
  return api.post('/api/ai/journals', data);
}

