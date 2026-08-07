import api from '../api/api';

export async function bookAppointment(appointmentData) {
  return api.post('/api/appointments', appointmentData);
}

export async function getMyAppointments() {
  return api.get('/api/appointments');
}

export async function updateAppointmentStatus(id, status) {
  return api.patch(`/api/appointments/${id}/status`, { status });
}
