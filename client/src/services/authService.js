import api from '../api/api';

export async function register(data) {
  return api.post('/api/auth/register', data);
}

export async function login(data) {
  return api.post('/api/auth/login', data);
}

export async function logout() {
  return api.post('/api/auth/logout');
}

export async function me() {
  return api.get('/api/auth/me');
}

export async function updateProfile(data) {
  return api.put('/api/auth/profile', data);
}

export async function changePassword(data) {
  return api.post('/api/auth/change-password', data);
}
