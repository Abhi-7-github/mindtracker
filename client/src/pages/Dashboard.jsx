import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PsychologistDashboard } from '../components/dashboard/PsychologistDashboard';
import { ScoreGauge } from '../components/charts/ScoreGauge';
import { EmotionMeter } from '../components/charts/EmotionMeter';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AppointmentCard } from '../components/cards/AppointmentCard';
import * as appointmentService from '../services/appointmentService';
import * as aiService from '../services/aiService';
import { Mic, Sparkles, BookOpen, UserCheck, ArrowRight, Calendar, Activity } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [latestSession, setLatestSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    if (user?.role === 'user') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [appRes, sessionRes] = await Promise.allSettled([
        appointmentService.getMyAppointments(),
        aiService.getLatestSession(),
      ]);

      if (appRes.status === 'fulfilled' && appRes.value?.success && appRes.value?.data) {
        setAppointments(appRes.value.data);
      }
      if (sessionRes.status === 'fulfilled' && sessionRes.value?.success && sessionRes.value?.data) {
        setLatestSession(sessionRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoadingAppointments(false);
      setLoadingSession(false);
    }
  };

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
  const upcomingAppointment = appointments.find(
    (a) => a.status === 'Confirmed' || a.status === 'Pending'
  );

  const analysis = latestSession?.analysis;
  const hasAnalysis = Boolean(analysis && (analysis.wellnessScore || analysis.stressScore));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Banner Section */}
        <div className="p-8 bg-[#1A1A1A] text-white rounded-3xl polo-border-dark polo-shadow-red flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#9F1239] text-white text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Wellness Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Welcome back, <span className="text-[#9F1239]">{user?.name || 'Friend'}</span>
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
          {loadingSession ? (
            <p className="text-xs font-bold text-neutral-500 py-6 text-center">Loading health metrics...</p>
          ) : hasAnalysis ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <ScoreGauge title="Wellness Score" score={analysis.wellnessScore || 0} subtitle="Real-time Score" />
              <ScoreGauge title="Stress Index" score={analysis.stressScore || 0} subtitle="Real-time Score" />
              <ScoreGauge title="Anxiety Score" score={analysis.anxietyScore || 0} subtitle="Real-time Score" />
              <ScoreGauge title="Burnout Risk" score={analysis.burnoutScore || 0} subtitle="Real-time Score" />
            </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-neutral-300 rounded-2xl bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-neutral-100 rounded-xl polo-border text-[#9F1239]">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-black uppercase">No Check-in Metrics Recorded Yet</h4>
                  <p className="text-xs text-neutral-500 font-medium">
                    Record your first voice check-in to analyze your stress, anxiety, and burnout metrics.
                  </p>
                </div>
              </div>
              <Button size="sm" icon={Mic} onClick={() => navigate('/voice-checkin')}>
                Start Voice Check-in
              </Button>
            </div>
          )}
        </div>

        {/* Emotion breakdown & Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <EmotionMeter
              primaryEmotion={analysis?.primaryEmotion || (hasAnalysis ? 'Balanced' : 'No Data')}
              secondaryEmotion={analysis?.secondaryEmotion || (hasAnalysis ? 'Calm' : 'Record check-in to evaluate')}
            />
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

          {loadingAppointments ? (
            <p className="text-xs font-bold text-neutral-500 py-6 text-center">Loading consultation data...</p>
          ) : upcomingAppointment ? (
            <AppointmentCard
              appointment={{
                ...upcomingAppointment,
                psychologist: upcomingAppointment.psychologist || upcomingAppointment.user,
              }}
              onJoin={(roomId) => navigate(`/meeting/${roomId}`)}
            />
          ) : (
            <div className="p-6 border-2 border-dashed border-neutral-300 rounded-2xl bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-neutral-100 rounded-xl polo-border text-black">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-black uppercase">No Upcoming Consultations</h4>
                  <p className="text-xs text-neutral-500 font-medium">
                    You don&apos;t have any scheduled sessions with a therapist right now.
                  </p>
                </div>
              </div>
              <Button size="sm" icon={UserCheck} onClick={() => navigate('/psychologists')}>
                Book a Psychologist
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

