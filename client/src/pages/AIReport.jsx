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
  TrendingUp,
  Activity,
  Brain,
  Layers,
  Heart,
  Target,
  Sparkle,
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
  const rawAnalysis = reportData?.analysis || {};

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24 text-center space-y-3">
          <p className="text-sm font-black uppercase text-neutral-600">Loading AI Emotional Assessment...</p>
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

  // Safe dynamic extraction from AI Emotional Tracking Engine schema
  const emotionObj = rawAnalysis?.emotionAnalysis || rawAnalysis?.emotionDetection || {};
  const primaryEmotion = emotionObj.primaryEmotion || emotionObj.primary || rawAnalysis?.primaryEmotion || 'Reflective';
  const secondaryEmotion = emotionObj.secondaryEmotion || emotionObj.secondary || rawAnalysis?.secondaryEmotion || 'Calm';
  const emotionalIntensity = emotionObj.emotionalIntensity ?? rawAnalysis?.stressScore ?? 45;
  const confidenceScore = emotionObj.confidence ?? 88;
  const sentiment = emotionObj.sentiment || (emotionalIntensity > 70 ? 'Negative' : emotionalIntensity > 40 ? 'Mixed' : 'Positive');
  const moodTrend = emotionObj.moodTrend || 'Stable';
  const emotionalStability = emotionObj.emotionalStability || rawAnalysis?.analysis?.emotionalStability || (emotionalIntensity > 75 ? 'Unstable' : 'Stable');

  const insightsObj = rawAnalysis?.insights || {};
  const emotionalTriggers = (insightsObj.emotionalTriggers && insightsObj.emotionalTriggers.length > 0) ? insightsObj.emotionalTriggers : ['Daily workload & cognitive focus'];
  const positiveIndicators = (insightsObj.positiveIndicators && insightsObj.positiveIndicators.length > 0) ? insightsObj.positiveIndicators : ['Self-awareness & active reflection'];
  const negativeIndicators = (insightsObj.negativeIndicators && insightsObj.negativeIndicators.length > 0) ? insightsObj.negativeIndicators : ['Cognitive fatigue during peak hours'];
  const cognitivePatterns = (insightsObj.cognitivePatterns && insightsObj.cognitivePatterns.length > 0) ? insightsObj.cognitivePatterns : ['Self Reflection', 'Problem Solving'];
  const behavioralIndicators = (insightsObj.behavioralIndicators && insightsObj.behavioralIndicators.length > 0) ? insightsObj.behavioralIndicators : ['Expressing Feelings'];

  const summaryObj = rawAnalysis?.summary || {};
  const emotionalSummary = summaryObj.emotionalSummary || rawAnalysis?.wellnessSummary || 'Voice check-in processed with empathetic clinical emotion modeling.';
  const personalReflection = summaryObj.personalReflection || rawAnalysis?.journal?.reflection || rawAnalysis?.dailyJournal || transcript || 'Your emotional state has been evaluated from your voice check-in.';

  const growthPlanObj = rawAnalysis?.growthPlan || rawAnalysis?.recommendations || {};
  const growthSuggestion = growthPlanObj.suggestion || growthPlanObj.aiRecommendation || rawAnalysis?.recommendation || 'Incorporate short mindfulness pauses and regular sleep routines.';
  const recommendedActivities = (growthPlanObj.recommendedActivities && growthPlanObj.recommendedActivities.length > 0)
    ? growthPlanObj.recommendedActivities
    : (growthPlanObj.recoveryPlan && growthPlanObj.recoveryPlan.length > 0 ? growthPlanObj.recoveryPlan : ['10-minute breathing pause', '20-minute restorative walk', 'Consistent sleep schedule']);

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
            <span>AI Emotional Tracking Engine</span>
          </div>
        </div>

        {/* Primary Emotion Banner */}
        <Card className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-black text-white polo-border-dark flex flex-col md:flex-row items-center justify-between gap-6 polo-shadow-lg">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-[#9F1239] rounded-2xl text-white polo-border flex-shrink-0">
              <Smile className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ff8d58]">
                  Emotional State Detected
                </span>
                <span className="text-[10px] font-mono font-bold bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
                  {confidenceScore}% Confidence
                </span>
              </div>
              <div className="flex items-center space-x-3 mt-1.5 flex-wrap gap-y-1">
                <div className="text-2xl font-black uppercase">
                  Primary: <span className="text-red-400">{primaryEmotion}</span>
                </div>
                <span className="text-neutral-500">•</span>
                <div className="text-2xl font-black uppercase">
                  Secondary: <span className="text-amber-400">{secondaryEmotion}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-neutral-300 font-medium max-w-xs text-center md:text-right border-t md:border-t-0 md:border-l border-neutral-800 pt-3 md:pt-0 md:pl-4">
            Tone, pitch velocity, and semantic sentiment analyzed strictly from your speech.
          </div>
        </Card>

        {/* Emotion Metrics Quad Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Emotional Intensity */}
          <Card className="flex flex-col justify-between p-4 space-y-3 bg-red-50/40 border-red-200">
            <div className="flex items-center justify-between text-xs font-black text-red-900 uppercase">
              <span className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-red-600" />
                <span>Emotional Intensity</span>
              </span>
              <span className="text-lg font-mono font-black text-red-600">{emotionalIntensity}%</span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-red-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, emotionalIntensity))}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-red-800">
              {emotionalIntensity > 75 ? 'High Emotional Load' : emotionalIntensity > 45 ? 'Moderate Intensity' : 'Calm / Grounded'}
            </span>
          </Card>

          {/* Sentiment */}
          <Card className="flex flex-col justify-between p-4 space-y-3 bg-indigo-50/40 border-indigo-200">
            <div className="flex items-center justify-between text-xs font-black text-indigo-900 uppercase">
              <span className="flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sentiment</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-black uppercase">
                {sentiment}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-indigo-800">
              Evaluated from lexical sentiment polarity.
            </p>
          </Card>

          {/* Mood Trend */}
          <Card className="flex flex-col justify-between p-4 space-y-3 bg-emerald-50/40 border-emerald-200">
            <div className="flex items-center justify-between text-xs font-black text-emerald-900 uppercase">
              <span className="flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mood Trend</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-black uppercase">
                {moodTrend}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-800">
              Observed emotional trajectory.
            </p>
          </Card>

          {/* Emotional Stability */}
          <Card className="flex flex-col justify-between p-4 space-y-3 bg-amber-50/40 border-amber-200">
            <div className="flex items-center justify-between text-xs font-black text-amber-900 uppercase">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                <span>Stability</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[11px] font-black uppercase">
                {emotionalStability}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-amber-800">
              Cognitive coherence and emotional regulation index.
            </p>
          </Card>
        </div>

        {/* Cognitive Patterns & Behavioral Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cognitive Patterns */}
          <Card className="p-5 space-y-3 bg-white polo-border">
            <div className="flex items-center space-x-2 text-neutral-900 border-b border-neutral-200 pb-2.5">
              <Brain className="w-4 h-4 text-[#9F1239]" />
              <h4 className="text-xs font-black uppercase tracking-wider">Observed Cognitive Patterns</h4>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {cognitivePatterns.map((pattern, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-bold text-neutral-800 border border-neutral-300"
                >
                  {pattern}
                </span>
              ))}
            </div>
          </Card>

          {/* Behavioral Indicators */}
          <Card className="p-5 space-y-3 bg-white polo-border">
            <div className="flex items-center space-x-2 text-neutral-900 border-b border-neutral-200 pb-2.5">
              <Layers className="w-4 h-4 text-[#9F1239]" />
              <h4 className="text-xs font-black uppercase tracking-wider">Behavioral Indicators</h4>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {behavioralIndicators.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-bold text-neutral-800 border border-neutral-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Emotional Triggers & Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Triggers */}
          <Card className="p-5 space-y-3 bg-red-50/30 border-red-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-red-900 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-red-600" />
              <span>Emotional Triggers Identified</span>
            </h4>
            <ul className="space-y-1.5">
              {emotionalTriggers.map((t, idx) => (
                <li key={idx} className="text-xs font-medium text-neutral-800 flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Positive Indicators */}
          <Card className="p-5 space-y-3 bg-emerald-50/30 border-emerald-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center space-x-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Positive Emotional Indicators</span>
            </h4>
            <ul className="space-y-1.5">
              {positiveIndicators.map((p, idx) => (
                <li key={idx} className="text-xs font-medium text-neutral-800 flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Emotional Growth Plan & Recommended Activities */}
        <Card className="p-6 space-y-5 border-2 border-[#9F1239]/40 bg-white polo-shadow">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div className="flex items-center space-x-2 text-[#9F1239]">
              <Target className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-wider">
                Emotional Growth Plan & Actionable Suggestions
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-red-100 text-[#9F1239]">
              Tailored Guidance
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9F1239]">
              Growth Suggestion:
            </span>
            <div className="p-4 bg-red-50/70 rounded-xl border border-red-200 text-xs font-bold text-neutral-900 leading-relaxed">
              {growthSuggestion}
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-black uppercase text-neutral-800">
              Recommended Activities:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recommendedActivities.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-neutral-50 rounded-xl polo-border flex items-start space-x-2.5 text-xs font-medium text-neutral-800"
                >
                  <span className="w-5 h-5 rounded-full bg-[#9F1239] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{act}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Personalized Reflection & Clinical Summary */}
        <Card className="p-6 space-y-4 bg-neutral-50 polo-border">
          <div className="flex items-center space-x-2 text-neutral-900 border-b border-neutral-200 pb-2.5">
            <FileText className="w-4 h-4 text-[#9F1239]" />
            <h4 className="text-xs font-black uppercase tracking-wider">Personalized Voice Reflection</h4>
          </div>
          <p className="text-sm font-bold text-neutral-900 leading-relaxed">
            {personalReflection}
          </p>
          {emotionalSummary && (
            <p className="text-xs font-semibold text-neutral-600 pt-2 border-t border-neutral-200">
              {emotionalSummary}
            </p>
          )}
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

        {/* Consultation Recommendation Card */}
        <Card className="flex flex-col md:flex-row items-center justify-between gap-4 bg-black text-white polo-border-dark p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#9F1239] rounded-2xl text-white polo-border flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase">Professional Doctor Consultation</h4>
              <p className="text-xs font-medium text-neutral-300 mt-0.5">
                Discussing recurring emotional patterns or acute stress with a licensed specialist is always encouraged.
              </p>
            </div>
          </div>
          <Button size="lg" icon={UserCheck} onClick={() => navigate('/psychologists')}>
            Book Consultation
          </Button>
        </Card>

        {/* Disclaimer */}
        <p className="text-[11px] text-center font-bold text-neutral-500 italic">
          This assessment is AI-generated and should not be considered medical advice.
        </p>
      </div>
    </DashboardLayout>
  );
};
