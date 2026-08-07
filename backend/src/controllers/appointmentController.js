import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export async function bookAppointment(req, res, next) {
  try {
    const { psychologistId, date, timeSlot, mode, notes } = req.body;

    if (!psychologistId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Psychologist ID, date, and time slot are required' });
    }

    const psychologist = await User.findById(psychologistId);
    if (!psychologist || psychologist.role !== 'psychologist') {
      return res.status(404).json({ success: false, message: 'Psychologist not found' });
    }

    const patient = await User.findById(req.user.id);
    const meetingId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const appointment = await Appointment.create({
      user: req.user.id,
      psychologist: psychologistId,
      date,
      timeSlot,
      mode: mode || 'Online Video',
      notes: notes || '',
      status: 'Pending',
      meetingId
    });

    // Create Notification for Doctor
    await Notification.create({
      user: psychologistId,
      type: 'appointment_request',
      title: 'New Appointment Booking Request',
      body: `Patient ${patient?.name || 'A user'} requested an appointment for ${date} at ${timeSlot} (${mode || 'Online Video'}).`,
      meta: {
        appointmentId: appointment._id,
        patientName: patient?.name,
        patientId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Appointment booking request sent to doctor',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyAppointments(req, res, next) {
  try {
    let appointments;
    if (req.user.role === 'psychologist') {
      appointments = await Appointment.find({ psychologist: req.user.id })
        .populate('user', 'name email avatar bio')
        .populate('psychologist', 'name email title avatar visitingAddress specialties experience')
        .sort({ createdAt: -1 });
    } else {
      appointments = await Appointment.find({ user: req.user.id })
        .populate('psychologist', 'name email title avatar visitingAddress specialties experience')
        .populate('user', 'name email avatar bio')
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
}


export async function updateAppointmentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Confirmed' or 'Cancelled' or 'Completed'

    if (!['Confirmed', 'Cancelled', 'Completed', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(id)
      .populate('user', 'name email')
      .populate('psychologist', 'name email title');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Only doctor or patient can update status
    const isDoctor = appointment.psychologist._id.toString() === req.user.id;
    const isPatient = appointment.user._id.toString() === req.user.id;

    if (!isDoctor && !isPatient && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    appointment.status = status;
    await appointment.save();

    // Send Notification to Patient if doctor changed status
    if (isDoctor) {
      if (status === 'Confirmed') {
        await Notification.create({
          user: appointment.user._id,
          type: 'appointment_accepted',
          title: 'Appointment Confirmed! ✅',
          body: `Dr. ${appointment.psychologist.name} accepted your appointment request for ${appointment.date} at ${appointment.timeSlot}.`,
          meta: { appointmentId: appointment._id, meetingId: appointment.meetingId, mode: appointment.mode }
        });
      } else if (status === 'Cancelled') {
        await Notification.create({
          user: appointment.user._id,
          type: 'appointment_rejected',
          title: 'Appointment Booking Request Declined ❌',
          body: `Dr. ${appointment.psychologist.name} was unable to accept your appointment for ${appointment.date} at ${appointment.timeSlot}.`,
          meta: { appointmentId: appointment._id }
        });
      }
    }

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
}
