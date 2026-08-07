import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PsychologistCard } from '../components/cards/PsychologistCard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import * as psychologistService from '../services/psychologistService';
import * as appointmentService from '../services/appointmentService';
import { Search, Calendar as CalendarIcon, Clock, UserCheck, Video, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const Psychologists = () => {
  const navigate = useNavigate();
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Booking Modal Form State
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingMode, setBookingMode] = useState('Online Video');
  const [bookingNotes, setBookingNotes] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  useEffect(() => {
    fetchVerifiedDoctors();
  }, []);

  const fetchVerifiedDoctors = async () => {
    setLoading(true);
    try {
      const res = await psychologistService.getVerifiedPsychologists();
      if (res.success && res.data) {
        setPsychologists(res.data);
      }
    } catch (err) {
      toast.error('Failed to load verified psychologists');
    } finally {
      setLoading(false);
    }
  };

  const specialtiesList = ['All', 'Anxiety', 'Depression', 'CBT', 'Mindfulness', 'Stress Management', 'Burnout'];

  const filteredDoctors = psychologists.filter((doc) => {
    const nameMatch = (doc.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const titleMatch = (doc.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || titleMatch;

    const matchesSpec =
      selectedSpecialty === 'All' ||
      (doc.specialties && doc.specialties.some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase())));

    return matchesSearch && matchesSpec;
  });

  const handleConfirmBooking = async () => {
    if (!selectedDoctor) return;
    if (!bookingDate) return toast.error('Please select a date for the session');

    setSubmittingBooking(true);
    try {
      const res = await appointmentService.bookAppointment({
        psychologistId: selectedDoctor._id || selectedDoctor.id,
        date: bookingDate,
        timeSlot: bookingTime,
        mode: bookingMode,
        notes: bookingNotes,
      });

      if (res.success) {
        toast.success(`Booking request sent to ${selectedDoctor.name}. Awaiting doctor approval!`);
        setSelectedDoctor(null);
        navigate('/appointments');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit appointment request');
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-black">Verified Psychologists</h1>
            <p className="text-xs font-bold text-neutral-600">
              Connect with registered & admin-verified mental health practitioners
            </p>
          </div>
          <div className="w-full md:w-72">
            <Input
              placeholder="Search doctor by name or specialty..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Specialty Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {specialtiesList.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${selectedSpecialty === spec
                ? 'bg-[#9F1239] text-white polo-border polo-shadow-sm'
                : 'bg-white text-black polo-border hover:bg-neutral-100'
                }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Psychologists Directory Grid */}
        {loading ? (
          <p className="text-xs font-bold text-neutral-500 py-12 text-center">Loading verified doctors...</p>
        ) : filteredDoctors.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-neutral-300 rounded-2xl bg-white space-y-2">
            <UserCheck className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-black text-black uppercase">No Verified Psychologists Available</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              There are currently no verified psychologists matching your search criteria. Check back soon or request admin approval.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <PsychologistCard
                key={doc._id || doc.id}
                psychologist={{
                  ...doc,
                  id: doc._id || doc.id,
                  name: doc.name,
                  title: doc.title,
                  rating: doc.rating,
                  reviews: doc.reviews,
                  available: true,
                  experience: doc.experience,
                  specialties: doc.specialties,
                  avatar: doc.avatar,
                }}
                onBook={(doctor) => {
                  setSelectedDoctor(doctor);
                  if (doctor.visitingSlots?.[0]?.dayOrDate) {
                    setBookingDate(doctor.visitingSlots[0].dayOrDate);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Booking Modal */}
        <Modal
          isOpen={!!selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          title={`Book Consultation — ${selectedDoctor?.name}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-neutral-100 rounded-xl border border-neutral-300 flex items-center space-x-3">
              <div className="p-2.5 bg-[#9F1239] text-white rounded-xl polo-border">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-black">{selectedDoctor?.name}</p>
                <p className="text-[11px] text-neutral-600">{selectedDoctor?.title || 'Clinical Specialist'}</p>
                {selectedDoctor?.visitingAddress && (
                  <p className="text-[10px] font-bold text-neutral-500 flex items-center mt-0.5">
                    <MapPin className="w-3 h-3 mr-1 text-[#9F1239]" />
                    {selectedDoctor.visitingAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Date Input Calendar Picker */}
            <Input
              label="Select Session Date (Calendar)"
              type="date"
              icon={CalendarIcon}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />

            {/* Time Slot Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                Available Time Slots
              </label>
              {selectedDoctor?.visitingSlots?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {selectedDoctor.visitingSlots.map((slot, idx) => {
                    const slotLabel = `${slot.startTime} - ${slot.endTime}`;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setBookingTime(slotLabel);
                          if (slot.mode) setBookingMode(slot.mode.includes('Clinic') ? 'In-Person Clinic' : 'Online Video');
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-left ${bookingTime === slotLabel
                          ? 'bg-[#9F1239] text-white border-black polo-shadow-sm'
                          : 'bg-white text-black border-neutral-300 hover:border-black'
                          }`}
                      >
                        <div className="font-black">{slot.dayOrDate}</div>
                        <div className="text-[11px] font-bold">{slotLabel}</div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {['09:00 AM', '10:00 AM', '02:00 PM', '04:00 PM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBookingTime(slot)}
                      className={`p-2 rounded-xl text-xs font-bold border-2 transition-all ${bookingTime === slot
                        ? 'bg-[#9F1239] text-white border-black polo-shadow-sm'
                        : 'bg-white text-black border-neutral-300'
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Consultation Mode */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                Consultation Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBookingMode('Online Video')}
                  className={`p-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 border-2 transition-all ${bookingMode === 'Online Video'
                    ? 'bg-black text-white border-black polo-shadow-sm'
                    : 'bg-white text-black border-neutral-300'
                    }`}
                >
                  <Video className="w-4 h-4 text-[#9F1239]" />
                  <span>Online Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('In-Person Clinic')}
                  className={`p-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 border-2 transition-all ${bookingMode === 'In-Person Clinic'
                    ? 'bg-black text-white border-black polo-shadow-sm'
                    : 'bg-white text-black border-neutral-300'
                    }`}
                >
                  <MapPin className="w-4 h-4 text-[#9F1239]" />
                  <span>In-Person Clinic</span>
                </button>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                Notes for Doctor (Optional)
              </label>
              <input
                type="text"
                placeholder="Briefly describe what you would like to discuss..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="w-full bg-white text-black px-4 py-2.5 text-xs rounded-xl font-medium placeholder:text-neutral-400 focus:outline-none polo-border"
              />
            </div>

            <Button className="w-full mt-4" loading={submittingBooking} onClick={handleConfirmBooking}>
              Send Booking Request to Doctor
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
