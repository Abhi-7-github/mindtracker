import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'sonner';
import * as psychologistService from '../../services/psychologistService';
import * as appointmentService from '../../services/appointmentService';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  MapPin,
  Briefcase,
  Award,
  Save,
  Tag,
  Video,
  User,
  Bell,
  Check,
  X,
} from 'lucide-react';

export const PsychologistDashboard = () => {
  const { user, updateProfile } = useAuthStore();
  const navigate = useNavigate();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    title: user?.title || '',
    bio: user?.bio || '',
    experience: user?.experience || '',
    visitingAddress: user?.visitingAddress || '',
    specialties: Array.isArray(user?.specialties) ? user.specialties.join(', ') : '',
    avatar: user?.avatar || '',
  });

  const [savingProfile, setSavingProfile] = useState(false);

  // Slots State
  const [slots, setSlots] = useState(user?.visitingSlots || []);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // New Slot Form State (with Calendar Date picker)
  const [newSlot, setNewSlot] = useState({
    dayOrDate: new Date().toISOString().split('T')[0], // Default today date
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    durationMinutes: 50,
    mode: 'Online Video',
  });
  const [addingSlot, setAddingSlot] = useState(false);

  // Incoming Appointments State
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchSlots();
    fetchAppointments();
  }, []);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await psychologistService.getVisitingSlots();
      if (res.success && res.data) {
        setSlots(res.data.slots || []);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await appointmentService.getMyAppointments();
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const specialtiesArray = profileData.specialties
        ? profileData.specialties.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await updateProfile({
        name: profileData.name,
        title: profileData.title,
        bio: profileData.bio,
        experience: profileData.experience,
        visitingAddress: profileData.visitingAddress,
        specialties: specialtiesArray,
        avatar: profileData.avatar,
      });

      if (res.success) {
        toast.success('Psychologist profile updated successfully!');
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('An error occurred while saving profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.dayOrDate || !newSlot.startTime || !newSlot.endTime) {
      toast.error('Please select a visiting date, start time, and end time');
      return;
    }

    setAddingSlot(true);
    try {
      const res = await psychologistService.addVisitingSlot(newSlot);
      if (res.success) {
        setSlots(res.data || []);
        toast.success('Visiting date & time slot added successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add visiting slot');
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      const res = await psychologistService.deleteVisitingSlot(slotId);
      if (res.success) {
        setSlots(res.data || []);
        toast.success('Visiting slot removed');
      }
    } catch (err) {
      toast.error('Failed to remove visiting slot');
    }
  };

  const handleUpdateAppointment = async (id, status) => {
    setActionLoadingId(id);
    try {
      const res = await appointmentService.updateAppointmentStatus(id, status);
      if (res.success && res.data) {
        toast.success(`Appointment ${status.toLowerCase()} successfully! Patient notified.`);
        setAppointments((prev) =>
          prev.map((app) => (app._id === id ? { ...app, status: res.data.status } : app))
        );
      }
    } catch (err) {
      toast.error('Failed to update appointment status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const verificationStatus = user?.verificationStatus || (user?.isVerified ? 'Verified' : 'Pending');
  const pendingAppointments = appointments.filter((a) => a.status === 'Pending');
  const confirmedAppointments = appointments.filter((a) => a.status === 'Confirmed');

  return (
    <div className="space-y-8">
      {/* Verification Status Banner */}
      <div
        className={`p-6 rounded-2xl polo-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          verificationStatus === 'Verified'
            ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
            : verificationStatus === 'Rejected'
            ? 'bg-red-50 border-red-600 text-red-950'
            : 'bg-amber-50 border-amber-500 text-amber-950'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-xl polo-border text-white ${
              verificationStatus === 'Verified'
                ? 'bg-emerald-600'
                : verificationStatus === 'Rejected'
                ? 'bg-red-600'
                : 'bg-amber-500'
            }`}
          >
            {verificationStatus === 'Verified' && <CheckCircle2 className="w-6 h-6" />}
            {verificationStatus === 'Rejected' && <XCircle className="w-6 h-6" />}
            {verificationStatus === 'Pending' && <Clock className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-wide">
              Account Status: {verificationStatus}
            </h2>
            <p className="text-xs font-semibold mt-0.5 opacity-90">
              {verificationStatus === 'Verified' &&
                'Your doctor credentials are verified by the Admin. You are visible to patients in the directory.'}
              {verificationStatus === 'Pending' &&
                'Your account is awaiting Admin verification. Once approved, patients can view your profile & book slots.'}
              {verificationStatus === 'Rejected' &&
                'Your verification request was not approved by the Admin. Please update your details or contact support.'}
            </p>
          </div>
        </div>
      </div>

      {/* Incoming Patient Appointment Requests Section */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#B82126] text-white rounded-xl polo-border">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase text-black">Patient Appointment Requests</h3>
              <p className="text-xs font-bold text-neutral-500">Review incoming bookings and accept or decline</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-400 font-black text-xs uppercase rounded-full">
            {pendingAppointments.length} Pending Approval
          </span>
        </div>

        {loadingAppointments ? (
          <p className="text-xs font-bold text-neutral-500 py-4 text-center">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-neutral-300 rounded-xl">
            <p className="text-xs font-bold text-neutral-500">No appointment requests received yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Requests First */}
            {pendingAppointments.map((app) => (
              <div
                key={app._id}
                className="p-4 bg-amber-50/70 border-2 border-amber-400 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-base polo-border flex-shrink-0">
                    {app.user?.avatar ? (
                      <img src={app.user.avatar} alt={app.user.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      app.user?.name?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-black">{app.user?.name || 'Patient'}</h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-200 text-amber-900 rounded border border-amber-400">
                        Pending Confirmation
                      </span>
                    </div>
                    <p className="text-xs font-bold text-neutral-600">
                      Date: <span className="text-black">{app.date}</span> at <span className="text-[#B82126]">{app.timeSlot}</span>
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] font-semibold text-neutral-700 mt-1">
                      <span className="px-2 py-0.5 bg-white polo-border rounded font-black text-black">{app.mode}</span>
                      {app.notes && <span>Note: &quot;{app.notes}&quot;</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center">
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Check}
                    loading={actionLoadingId === app._id}
                    onClick={() => handleUpdateAppointment(app._id, 'Confirmed')}
                  >
                    Accept Booking
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={X}
                    loading={actionLoadingId === app._id}
                    onClick={() => handleUpdateAppointment(app._id, 'Cancelled')}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}

            {/* Confirmed Appointments */}
            {confirmedAppointments.map((app) => (
              <div
                key={app._id}
                className="p-4 bg-emerald-50/70 border-2 border-emerald-400 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base polo-border flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-black">{app.user?.name || 'Patient'}</h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded border border-emerald-500">
                        Confirmed
                      </span>
                    </div>
                    <p className="text-xs font-bold text-neutral-600">
                      Date: <span className="text-black">{app.date}</span> at <span className="text-[#B82126]">{app.timeSlot}</span>
                    </p>
                    <span className="inline-block text-[11px] font-black text-black mt-1 px-2 py-0.5 bg-white polo-border rounded">
                      Mode: {app.mode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center">
                  {app.mode === 'Online Video' && (
                    <Button
                      size="sm"
                      icon={Video}
                      onClick={() => navigate(`/meeting/${app.meetingId}`)}
                    >
                      Join Video Call
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={actionLoadingId === app._id}
                    onClick={() => handleUpdateAppointment(app._id, 'Completed')}
                  >
                    Mark Completed
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Main Grid: Profile Update & Visiting Slots Creation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Management Card */}
        <Card className="space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b-2 border-neutral-200">
            <div className="p-2.5 bg-[#B82126] text-white rounded-xl polo-border">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase text-black">Practitioner Profile</h3>
              <p className="text-xs font-bold text-neutral-500">Update your clinical details & visiting location</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              required
            />

            <Input
              label="Professional Title"
              name="title"
              placeholder="e.g. Senior Clinical Psychologist, PhD"
              value={profileData.title}
              onChange={handleProfileChange}
              icon={Briefcase}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Experience"
                name="experience"
                placeholder="e.g. 10+ Years"
                value={profileData.experience}
                onChange={handleProfileChange}
                icon={Award}
              />
              <Input
                label="Specialties (comma separated)"
                name="specialties"
                placeholder="Anxiety, CBT, Stress"
                value={profileData.specialties}
                onChange={handleProfileChange}
                icon={Tag}
              />
            </div>

            <Input
              label="Visiting Clinic / Address"
              name="visitingAddress"
              placeholder="e.g. Mind Wellness Clinic, Suite 402, Downtown"
              value={profileData.visitingAddress}
              onChange={handleProfileChange}
              icon={MapPin}
            />

            <Input
              label="Avatar Image URL (Optional)"
              name="avatar"
              placeholder="https://..."
              value={profileData.avatar}
              onChange={handleProfileChange}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                Bio & Clinical Summary
              </label>
              <textarea
                name="bio"
                rows={3}
                value={profileData.bio}
                onChange={handleProfileChange}
                placeholder="Brief description of your expertise, therapeutic approach, and visiting hours..."
                className="w-full bg-white text-black px-4 py-3 text-sm rounded-xl font-medium placeholder:text-neutral-400 focus:outline-none transition-all duration-150 polo-border focus:shadow-[4px_4px_0px_0px_#B82126]"
              />
            </div>

            <Button type="submit" loading={savingProfile} icon={Save} className="w-full">
              Save Profile Changes
            </Button>
          </form>
        </Card>

        {/* Visiting Slots & Timings Creation Card with CALENDAR */}
        <div className="space-y-6">
          <Card className="space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b-2 border-neutral-200">
              <div className="p-2.5 bg-black text-white rounded-xl polo-border">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-black">Create Visiting Date & Timings</h3>
                <p className="text-xs font-bold text-neutral-500">Pick date from calendar & specify session hours</p>
              </div>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-4">
              {/* Calendar Date Picker Input */}
              <Input
                label="Visiting Date (Calendar Picker)"
                type="date"
                icon={CalendarIcon}
                value={newSlot.dayOrDate}
                onChange={(e) => setNewSlot({ ...newSlot, dayOrDate: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  placeholder="e.g. 09:00 AM"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  required
                />
                <Input
                  label="End Time"
                  placeholder="e.g. 05:00 PM"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Slot Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={newSlot.durationMinutes}
                    onChange={(e) => setNewSlot({ ...newSlot, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-white text-black px-4 py-3 text-sm rounded-xl font-medium placeholder:text-neutral-400 focus:outline-none transition-all duration-150 polo-border focus:shadow-[4px_4px_0px_0px_#B82126]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Consultation Mode
                  </label>
                  <select
                    value={newSlot.mode}
                    onChange={(e) => setNewSlot({ ...newSlot, mode: e.target.value })}
                    className="w-full bg-white text-black px-4 py-3 text-sm rounded-xl font-medium focus:outline-none transition-all duration-150 polo-border focus:shadow-[4px_4px_0px_0px_#B82126]"
                  >
                    <option value="Online Video">Online Video Consultation</option>
                    <option value="In-Person Clinic">In-Person Clinic Visit</option>
                    <option value="Both">Both (Clinic & Video)</option>
                  </select>
                </div>
              </div>

              <Button type="submit" loading={addingSlot} icon={Plus} variant="primary" className="w-full">
                Add Visiting Slot to Calendar
              </Button>
            </form>
          </Card>

          {/* List of Active Visiting Slots */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase text-black">Active Visiting Dates & Slots</h4>
              <span className="text-xs font-extrabold text-[#B82126]">{slots.length} Slots</span>
            </div>

            {loadingSlots ? (
              <p className="text-xs font-bold text-neutral-500 py-4 text-center">Loading slots...</p>
            ) : slots.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-neutral-300 rounded-xl">
                <p className="text-xs font-bold text-neutral-500">No visiting dates created yet.</p>
                <p className="text-[11px] text-neutral-400 mt-1">Select a date on calendar above to add slots.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <div
                    key={slot._id || slot.id}
                    className="p-3.5 bg-neutral-50 rounded-xl polo-border flex items-center justify-between gap-3 hover:border-black transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-black flex items-center">
                          <CalendarIcon className="w-3.5 h-3.5 mr-1 text-[#B82126]" />
                          {slot.dayOrDate}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white polo-border rounded">
                          {slot.mode}
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-neutral-600">
                        {slot.startTime} - {slot.endTime} ({slot.durationMinutes} mins)
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSlot(slot._id || slot.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors polo-border"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
