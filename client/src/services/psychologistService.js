import api from '../api/api';

export async function getVerifiedPsychologists() {
  return api.get('/api/psychologist/verified');
}

export async function getVisitingSlots() {
  return api.get('/api/psychologist/slots');
}

export async function addVisitingSlot(slotData) {
  return api.post('/api/psychologist/slots', slotData);
}

export async function deleteVisitingSlot(slotId) {
  return api.delete(`/api/psychologist/slots/${slotId}`);
}
