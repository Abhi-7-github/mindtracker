import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ScoreGauge } from '../components/charts/ScoreGauge';
import { EmotionMeter } from '../components/charts/EmotionMeter';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as aiService from '../services/aiService';
import { Sparkles, FileText, CheckCircle2, AlertTriangle, UserCheck, ArrowLeft, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export const AIReport = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [reportData, setReportData] = useState(location.state?.report || null);
  const [loading, setLoading] = useState(!location.state?.report);

  useEffect(() => {
    if (!reportData && sessionId) {
      fetchReport();
    }
  }, [sessionId]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await aiService.getSessionById(sessionId);
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load AI report');
    } finally {
      setLoading(false);
    }
  };

  const transcript = reportData?.transcript || '';
  const analysis = reportData?.analysis || null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24 text-center space-y-3">
          <p className="text-sm font-black uppercase text-neutral-600">Loading AI assessment report...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!reportData) {
    return (
      <DashboardLayout>
        <div className="py-24 text-center space-y-4 max-w-md mx-auto">
          <h2 className="text-xl font-black uppercase text-black">Report Not Found</h2>
          <p className="text-xs text-neutral-500 font-medium">
            Could not find an AI assessment report for this session. Complete a voice check-in to generate a report.
          </p>
          <Button icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 text-[#9F1239] border-2 border-[#9F1239] text-xs font-black uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assessment Report</span>
          </div>
        </div>

        {/* Crisis Warning Banner */}
        {analysis?.crisisDetection && (
          <div className="p-4 bg-red-600 text-white rounded-2xl polo-border flex items-start space-x-3 polo-shadow-lg">
            <ShieldAlert className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black uppercase">Crisis Alert Detected</h4>
              <p className="text-xs font-semibold mt-0.5">
                Our analysis indicated high distress signals. If you are in immediate distress, please reach out to emergency wellness resources or contact a counselor immediately.
              </p>
            </div>
          </div>
        )}

        {/* Scores Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ScoreGauge title="Wellness Score" score={analysis?.wellnessScore || 50} />
          <ScoreGauge title="Stress Score" score={analysis?.stressScore || 50} />
          <ScoreGauge title="Anxiety Score" score={analysis?.anxietyScore || 50} />
          <ScoreGauge title="Burnout Score" score={analysis?.burnoutScore || 50} />
        </div>

        {/* Emotion Meter & Transcript */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <EmotionMeter
              primaryEmotion={analysis?.primaryEmotion}
              secondaryEmotion={analysis?.secondaryEmotion}
            />
          </div>

          <Card className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#9F1239]" />
              <h4 className="text-sm font-black uppercase text-black">Voice Transcript</h4>
            </div>
            <p className="text-xs font-medium text-neutral-700 leading-relaxed italic bg-neutral-100 p-4 rounded-xl border border-neutral-300">
              "{transcript}"
            </p>
          </Card>
        </div>

        {/* Journal & Wellness Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-3">
            <h4 className="text-sm font-black uppercase text-black">Generated Journal Summary</h4>
            <p className="text-xs font-medium text-neutral-800 leading-relaxed">
              {analysis?.dailyJournal}
            </p>
            <p className="text-xs font-semibold text-neutral-500 pt-2 border-t border-neutral-200">
              {analysis?.wellnessSummary}
            </p>
          </Card>

          <Card className="space-y-4 bg-emerald-50/50 border-emerald-600">
            <h4 className="text-sm font-black uppercase text-emerald-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recommended Wellness Plan</span>
            </h4>
            <ul className="space-y-2">
              {analysis?.wellnessPlan?.recommendations?.map((item, idx) => (
                <li key={idx} className="text-xs font-bold text-neutral-800 flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Psychologist Recommendation Card */}
        <Card className="flex flex-col md:flex-row items-center justify-between gap-4 bg-black text-white polo-border-dark">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#9F1239] rounded-xl text-white polo-border">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase">Professional Recommendation</h4>
              <p className="text-xs font-medium text-neutral-300 mt-0.5">
                {analysis?.psychologistRecommendation}
              </p>
            </div>
          </div>
          <Button icon={UserCheck} onClick={() => navigate('/psychologists')}>
            Book Consultation
          </Button>
        </Card>

        {/* Disclaimer Notice */}
        <p className="text-[11px] text-center font-bold text-neutral-500 italic">
          {analysis?.disclaimer}
        </p>
      </div>
    </DashboardLayout>
  );
};
