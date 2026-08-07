import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AppointmentCard } from '../components/cards/AppointmentCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Calendar } from 'lucide-react';
import * as appointmentService from '../services/appointmentService';
import { toast } from 'sonner';

export const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getMyAppointments();
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } catch (err) {
      toast.error('Failed to load therapy appointments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'All') return true;
    return a.status === activeTab;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black uppercase text-black">Therapy Consultations</h1>
          <p className="text-xs font-bold text-neutral-600">
            Manage your booked sessions, track doctor approval status, and launch video consultations
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap space-x-2 border-b-2 border-black pb-3">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all mb-1 ${activeTab === tab
                ? 'bg-[#9F1239] text-white polo-border polo-shadow-sm'
                : 'bg-white text-black border-2 border-transparent hover:bg-neutral-100'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {loading ? (
          <p className="text-xs font-bold text-neutral-500 py-12 text-center">Loading appointments...</p>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((item) => (
                <AppointmentCard
                  key={item._id || item.id}
                  appointment={{
                    ...item,
                    psychologist: item.psychologist || item.user,
                  }}
                  onJoin={(roomId) => navigate(`/meeting/${roomId}`)}
                />
              ))
            ) : (
              <EmptyState
                icon={Calendar}
                title={`No ${activeTab === 'All' ? '' : activeTab} Consultations`}
                description="You do not have any sessions matching this status filter."
                actionLabel="Book a Psychologist"
                onAction={() => navigate('/psychologists')}
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
