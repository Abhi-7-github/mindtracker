import api from '../api/api';

export async function getNotifications() {
  return api.get('/api/notifications');
}

export async function markAsRead(id) {
  return api.patch(`/api/notifications/${id}/read`);
}

export async function markAllAsRead() {
  return api.patch('/api/notifications/read-all');
}
