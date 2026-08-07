import api from '../api/api';

export async function fetchPsychologists() {
  return api.get('/api/admin/psychologists');
}

export async function verifyPsychologist(id, status) {
  return api.patch(`/api/admin/psychologists/${id}/verify`, { status });
}
