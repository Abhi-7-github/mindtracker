import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ScoreGauge } from '../components/charts/ScoreGauge';
import { EmotionMeter } from '../components/charts/EmotionMeter';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as aiService from '../services/aiService';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ArrowLeft,
  ShieldAlert,
  Moon,
  Flame,
  Lightbulb,
  HeartHandshake,
  CalendarCheck,
  Clock,
  Compass,
  Smile,
  Zap,
} from 'lucide-react';
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

  // Dynamic extraction supporting both nested and flat schemas
  const stressObj = analysis?.analysis?.stressLevel || {};
  const stressLevel = typeof stressObj === 'object' && stressObj.score !== undefined
    ? stressObj.score
    : (analysis?.stressScore ?? 0);
  const stressLabel = stressObj?.label || (stressLevel > 75 ? 'High Stress' : stressLevel > 45 ? 'Moderate Stress' : 'Balanced');

  const wellnessScore = analysis?.analysis?.wellnessScore ?? analysis?.wellnessScore ?? 0;
  const burnoutRisk = analysis?.analysis?.burnoutRisk || analysis?.burnoutRisk || 'Unknown';
  const sleepQuality = analysis?.analysis?.sleepQuality || analysis?.sleepQuality || 'Unknown';
  const anxietyLevel = analysis?.analysis?.anxietyLevel || (analysis?.anxietyScore !== undefined ? `${analysis.anxietyScore}%` : 'Unknown');
  const depressionIndicator = analysis?.analysis?.depressionIndicator || 'Unknown';
  const emotionalStability = analysis?.analysis?.emotionalStability || 'Unknown';
  const riskLevel = analysis?.analysis?.riskLevel || (analysis?.crisisDetection ? 'CRITICAL' : 'MODERATE');

  const primaryEmotion = analysis?.emotionDetection?.primary || analysis?.primaryEmotion || 'Unknown';
  const secondaryEmotion = analysis?.emotionDetection?.secondary || analysis?.secondaryEmotion || 'Unknown';
  const emotionConfidence = analysis?.emotionDetection?.confidence || 88;

  const coreChallenge = analysis?.summary?.coreChallenge || analysis?.problemSummary || 'Daily emotional and cognitive balance.';
  const positiveStrengths = analysis?.summary?.positiveStrengths || 'Proactive engagement in self-reflection and mental awareness.';
  const clinicalSummary = analysis?.summary?.clinicalSummary || analysis?.wellnessSummary || '';

  const aiRecommendation = analysis?.recommendations?.aiRecommendation || analysis?.recommendation || 'Engage in regular self-care pauses and mind-body balance activities.';
  const recoveryPlan = (analysis?.recommendations?.recoveryPlan && analysis.recommendations.recoveryPlan.length > 0)
    ? analysis.recommendations.recoveryPlan
    : (analysis?.overcomePlan && analysis.overcomePlan.length > 0 ? analysis.overcomePlan : (analysis?.wellnessPlan?.recommendations || []));

  const journalData = analysis?.journal || {};
  const journalTitle = journalData.title || `AI Journal — ${primaryEmotion} Reflection`;
  const dailyJournalText = journalData.reflection || analysis?.dailyJournal || transcript || 'Your voice check-in has been analyzed and recorded.';
  const positiveNote = journalData.positiveNote || analysis?.positiveNote || 'Taking time to pause and reflect is an important foundation for emotional well-being.';
  const keyThemes = (journalData.keyThemes && journalData.keyThemes.length > 0) ? journalData.keyThemes : (analysis?.keyThemes || []);
  const suggestedActions = (journalData.suggestedActions && journalData.suggestedActions.length > 0) ? journalData.suggestedActions : (analysis?.suggestedActions || recoveryPlan);


  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 text-[#9F1239] border-2 border-[#9F1239] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mental Wellness Analysis</span>
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

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stress Level */}
          <Card className="flex flex-col justify-between p-4 space-y-3 bg-red-50/50 border-red-200">
            <div className="flex items-center justify-between text-xs font-black text-red-900 uppercase">
              <span className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-red-600" />
                <span>Stress Level</span>
              </span>
              <span className="text-lg font-mono font-black text-red-600">{stressLevel}%</span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-red-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, stressLevel))}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-red-800">{stressLabel}</span>
          </Card>

          {/* Sleep Quality */}
          <Card className="flex flex-col justify-between p-4 space-y-3 bg-indigo-50/50 border-indigo-200">
            <div className="flex items-center justify-between text-xs font-black text-indigo-900 uppercase">
              <span className="flex items-center space-x-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sleep Quality</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-black uppercase">
                {sleepQuality}
              </span>
            </div>
            <span className="text-[11px] font-bold text-indigo-800">
              {sleepQuality === 'Poor' ? 'Disrupted rest cycles detected' : sleepQuality === 'Good' ? 'Healthy restorative rest' : 'Rest analysis recorded'}
            </span>
          </Card>

          {/* Burnout Risk */}
          <Card className="flex flex-col justify-between p-4 space-y-3 bg-amber-50/50 border-amber-200">
            <div className="flex items-center justify-between text-xs font-black text-amber-900 uppercase">
              <span className="flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Burnout Risk</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${
                burnoutRisk === 'High' || burnoutRisk === 'Critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'
              }`}>
                {burnoutRisk}
              </span>
            </div>
            <span className="text-[11px] font-bold text-amber-800">Cognitive & workload fatigue index</span>
          </Card>

          {/* Overall Wellness */}
          <ScoreGauge title="Wellness Score" score={wellnessScore} />
        </div>

        {/* Psychological Diagnostics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-white rounded-xl polo-border flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Risk Assessment</span>
            <span className={`text-xs font-black uppercase mt-1 px-2 py-0.5 rounded-full inline-block w-fit ${
              riskLevel === 'CRITICAL' ? 'bg-red-600 text-white' : riskLevel === 'HIGH' ? 'bg-orange-500 text-white' : riskLevel === 'MODERATE' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
            }`}>
              {riskLevel}
            </span>
          </div>
          <div className="p-3.5 bg-white rounded-xl polo-border flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Anxiety Level</span>
            <span className="text-xs font-black text-neutral-900 mt-1">{anxietyLevel}</span>
          </div>
          <div className="p-3.5 bg-white rounded-xl polo-border flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Depression Indicator</span>
            <span className="text-xs font-black text-neutral-900 mt-1">{depressionIndicator}</span>
          </div>
          <div className="p-3.5 bg-white rounded-xl polo-border flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Emotional Stability</span>
            <span className="text-xs font-black text-neutral-900 mt-1">{emotionalStability}</span>
          </div>
        </div>

        {/* Primary & Secondary Emotions Banner */}
        <Card className="p-5 bg-gradient-to-r from-neutral-900 to-black text-white polo-border-dark flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#9F1239] rounded-2xl text-white polo-border flex-shrink-0">
              <Smile className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ff8d58]">
                Emotional State Detection
              </span>
              <div className="flex items-center space-x-3 mt-1">
                <div className="text-lg font-black uppercase">
                  Primary: <span className="text-red-400">{primaryEmotion}</span>
                </div>
                <span className="text-neutral-500">•</span>
                <div className="text-lg font-black uppercase">
                  Secondary: <span className="text-amber-400">{secondaryEmotion}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-neutral-300 font-medium max-w-sm text-center md:text-right">
            Voice pitch, tone, and lexical phrasing evaluated with neural mental health models.
          </div>
        </Card>

        {/* Core Challenge & Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 space-y-1.5 bg-white polo-border">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9F1239]">Core Challenge Identified</span>
            <p className="text-xs font-bold text-neutral-900 leading-relaxed">{coreChallenge}</p>
          </Card>
          <Card className="p-4 space-y-1.5 bg-emerald-50/40 border-emerald-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Identified Strengths & Resilience</span>
            <p className="text-xs font-bold text-emerald-900 leading-relaxed">{positiveStrengths}</p>
          </Card>
        </div>

        {/* Recommendation & Personalized Recovery Plan */}
        <Card className="p-6 space-y-4 border-2 border-[#9F1239]/40 bg-white polo-shadow">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div className="flex items-center space-x-2 text-[#9F1239]">
              <Lightbulb className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-wider">
                Personalized AI Recommendation & Recovery Plan
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-red-100 text-[#9F1239]">
              Tailored by POLO Engine
            </span>
          </div>
          
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9F1239]">
              Clinical AI Recommendation:
            </span>
            <div className="p-4 bg-red-50/70 rounded-xl border border-red-200 text-xs font-bold text-neutral-900 leading-relaxed">
              {aiRecommendation}
            </div>
          </div>

          {recoveryPlan && recoveryPlan.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-black uppercase text-neutral-800">
                Actionable Recovery Steps:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recoveryPlan.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 rounded-xl polo-border flex items-start space-x-2.5 text-xs font-medium text-neutral-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#9F1239] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>



        {/* AI-Generated Journal Section */}
        <Card className="p-6 space-y-6 bg-neutral-50 polo-border">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#9F1239]" />
              <h3 className="text-base font-black uppercase text-black">AI Generated Journal</h3>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-[#9F1239]/10 text-[#9F1239]">
              Session Reflection
            </span>
          </div>

          {/* Daily Journal Reflection */}
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-neutral-900 leading-relaxed">
              {dailyJournalText}
            </p>
          </div>

          {/* Key Themes & Positive Note Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Themes */}
            <div className="p-4 bg-white rounded-2xl polo-border space-y-2">
              <h4 className="text-xs font-black uppercase text-black flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-[#9F1239]" />
                <span>Key Themes</span>
              </h4>
              <ul className="space-y-1.5">
                {keyThemes.map((theme, i) => (
                  <li key={i} className="text-xs font-bold text-neutral-700 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9F1239]" />
                    <span>{theme}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Positive Note */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2 flex flex-col justify-center">
              <h4 className="text-xs font-black uppercase text-emerald-900 flex items-center space-x-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>Positive Note</span>
              </h4>
              <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                "{positiveNote}"
              </p>
            </div>
          </div>

          {/* Suggested Actions Checklist */}
          <div className="p-4 bg-white rounded-2xl polo-border space-y-3">
            <h4 className="text-xs font-black uppercase text-black flex items-center space-x-1.5">
              <CalendarCheck className="w-4 h-4 text-[#9F1239]" />
              <span>Suggested Actions</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {suggestedActions.map((action, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-300 flex items-center space-x-2 text-xs font-bold text-neutral-900"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Voice Transcript Review */}
        <Card className="p-5 space-y-2 bg-white polo-border">
          <div className="flex items-center space-x-2 text-neutral-700">
            <FileText className="w-4 h-4 text-[#9F1239]" />
            <h4 className="text-xs font-black uppercase text-black">Voice Transcript</h4>
          </div>
          <p className="text-xs font-medium text-neutral-700 leading-relaxed italic bg-neutral-100 p-3.5 rounded-xl border border-neutral-200">
            "{transcript}"
          </p>
        </Card>

        {/* Psychologist Recommendation Card */}
        <Card className="flex flex-col md:flex-row items-center justify-between gap-4 bg-black text-white polo-border-dark p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#9F1239] rounded-2xl text-white polo-border flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase">Professional Doctor Recommendation</h4>
              <p className="text-xs font-medium text-neutral-300 mt-0.5">
                {analysis?.psychologistRecommendation || 'Speaking with a licensed psychologist is recommended to develop coping mechanisms for stress.'}
              </p>
            </div>
          </div>
          <Button size="lg" icon={UserCheck} onClick={() => navigate('/psychologists')}>
            Book Consultation
          </Button>
        </Card>

        {/* Disclaimer Notice */}
        <p className="text-[11px] text-center font-bold text-neutral-500 italic">
          {analysis?.disclaimer || 'This assessment is AI-generated and should not be considered medical advice.'}
        </p>
      </div>
    </DashboardLayout>
  );
};

