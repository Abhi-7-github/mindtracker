import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PsychologistDashboard } from '../components/dashboard/PsychologistDashboard';
import { ScoreGauge } from '../components/charts/ScoreGauge';
import { EmotionMeter } from '../components/charts/EmotionMeter';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AppointmentCard } from '../components/cards/AppointmentCard';
import { Mic, Sparkles, BookOpen, UserCheck, ArrowRight, UserCog } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Psychologist View
  if (user?.role === 'psychologist') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black uppercase text-black">Psychologist Practitioner Portal</h1>
            <p className="text-xs font-bold text-neutral-600">
              Manage your professional profile, update visiting location, and define visiting slots & timings
            </p>
          </div>
          <PsychologistDashboard />
        </div>
      </DashboardLayout>
    );
  }

  // Admin View (or redirect)
  if (user?.role === 'admin') {
    navigate('/admin');
    return null;
  }

  // User / Patient View
  const mockAppointment = {
    psychologist: {
      name: 'Dr. Sarah Jenkins',
      title: 'Clinical Specialist',
      avatar: 'https://images.unsplash.com/photo-1594824813566-8185b378fd5f?w=300&auto=format&fit=crop&q=80',
    },
    date: new Date().toISOString(),
    duration: 50,
    status: 'Confirmed',
    meetingId: 'room-demo-123',
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Banner Section */}
        <div className="p-8 bg-[#1A1A1A] text-white rounded-3xl polo-border-dark polo-shadow-red flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B82126] text-white text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Wellness Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Welcome back, <span className="text-[#B82126]">{user?.name || 'Friend'}</span>
            </h1>
            <p className="text-xs font-semibold text-neutral-400 max-w-lg">
              Track your emotional trajectory, process daily check-ins, and manage therapist video appointments.
            </p>
          </div>

          <Button
            size="lg"
            icon={Mic}
            onClick={() => navigate('/voice-checkin')}
            className="flex-shrink-0"
          >
            Record Check-in
          </Button>
        </div>

        {/* Mental Health Score Gauges */}
        <div className="space-y-3">
          <h3 className="text-xl font-black uppercase tracking-tight text-black">Current Health Metrics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreGauge title="Wellness Score" score={78} subtitle="Optimal Level" />
            <ScoreGauge title="Stress Index" score={42} subtitle="Moderate" />
            <ScoreGauge title="Anxiety Score" score={35} subtitle="Mild" />
            <ScoreGauge title="Burnout Risk" score={28} subtitle="Low" />
          </div>
        </div>

        {/* Emotion breakdown & Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <EmotionMeter primaryEmotion="Focused" secondaryEmotion="Calm" />
          </div>

          <Card className="flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-sm font-black uppercase text-black">Smart Actions</h4>
              <p className="text-xs text-neutral-600 mt-1">Recommended daily wellness routines</p>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                icon={BookOpen}
                onClick={() => navigate('/journal')}
                className="w-full justify-start"
              >
                View Journal Entries
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={UserCheck}
                onClick={() => navigate('/psychologists')}
                className="w-full justify-start"
              >
                Book Therapist Session
              </Button>
            </div>
          </Card>
        </div>

        {/* Upcoming Session */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tight text-black">Upcoming Consultation</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <AppointmentCard
            appointment={mockAppointment}
            onJoin={(roomId) => navigate(`/meeting/${roomId}`)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};
