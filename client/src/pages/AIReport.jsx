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
  Globe,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const SUPPORTED_LANGUAGES = [
  { code: 'English', label: 'English', native: 'English' },
  { code: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { code: 'Hindi', label: 'Hindi', native: 'हिंदी' },
  { code: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { code: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

const UI_DICTIONARY = {
  English: {
    backToDashboard: 'Back to Dashboard',
    engineBadge: 'AI Emotional Tracking Engine',
    stateDetected: 'Emotional State Detected',
    confidence: 'Confidence',
    primary: 'Primary:',
    secondary: 'Secondary:',
    bannerSubtext: 'Tone, pitch velocity, and semantic sentiment analyzed strictly from your speech.',
    emotionalIntensity: 'Emotional Intensity',
    highLoad: 'High Emotional Load',
    moderateIntensity: 'Moderate Intensity',
    calmGrounded: 'Calm / Grounded',
    sentiment: 'Sentiment',
    sentimentSubtext: 'Evaluated from lexical sentiment polarity.',
    moodTrend: 'Mood Trend',
    moodSubtext: 'Observed emotional trajectory.',
    stability: 'Stability',
    stabilitySubtext: 'Cognitive coherence and emotional regulation index.',
    cognitivePatterns: 'Observed Cognitive Patterns',
    behavioralIndicators: 'Behavioral Indicators',
    triggersTitle: 'Emotional Triggers Identified',
    positiveTitle: 'Positive Emotional Indicators',
    growthTitle: 'Emotional Growth Plan & Actionable Suggestions',
    tailoredBadge: 'Tailored Guidance',
    growthSuggestion: 'Growth Suggestion:',
    recommendedActivities: 'Recommended Activities:',
    reflectionTitle: 'Personalized Voice Reflection',
    transcriptTitle: 'Voice Transcript',
    consultationTitle: 'Professional Doctor Consultation',
    consultationSubtext: 'Discussing recurring emotional patterns or acute stress with a licensed specialist is always encouraged.',
    bookConsultation: 'Book Consultation',
    disclaimer: 'This assessment is AI-generated and should not be considered medical advice.'
  },
  Telugu: {
    backToDashboard: 'డాష్‌బోర్డ్‌కి తిరిగి వెళ్లండి',
    engineBadge: 'AI ఎమోషనల్ ట్రాకింగ్ ఇంజిన్',
    stateDetected: 'భావోద్వేగ స్థితి గుర్తించబడింది',
    confidence: 'ఖచ్చితత్వం',
    primary: 'ప్రాథమికం:',
    secondary: 'ద్వితీయం:',
    bannerSubtext: 'మీ ప్రసంగం నుండి స్వరం, వేగం మరియు భావోద్వేగ తీవ్రత ఖచ్చితంగా విశ్లేషించబడ్డాయి.',
    emotionalIntensity: 'భావోద్వేగ తీవ్రత',
    highLoad: 'అధిక భావోద్వేగ భారం',
    moderateIntensity: 'మధ్యస్థ తీవ్రత',
    calmGrounded: 'ప్రశాంతత / సమతుల్యత',
    sentiment: 'మనోభావం',
    sentimentSubtext: 'భాషా భావోద్వేగ ధోరణి ఆధారంగా విశ్లేషించబడింది.',
    moodTrend: 'మూడ్ ట్రెండ్',
    moodSubtext: 'గమనించిన భావోద్వేగ పథం.',
    stability: 'స్థిరత్వం',
    stabilitySubtext: 'అభిజ్ఞా సమన్వయం మరియు భావోద్వేగ నియంత్రణ సూచిక.',
    cognitivePatterns: 'గుర్తించిన ఆలోచనా సరళి',
    behavioralIndicators: 'ప్రవర్తనా సూచికలు',
    triggersTitle: 'గుర్తించిన భావోద్వేగ ప్రేరేపకాలు',
    positiveTitle: 'సానుకూల భావోద్వేగ సూచికలు',
    growthTitle: 'భావోద్వేగ వికాస ప్రణాళిక & కార్యాచరణ సూచనలు',
    tailoredBadge: 'ప్రత్యేక మార్గదర్శకత్వం',
    growthSuggestion: 'వికాస సూచన:',
    recommendedActivities: 'సిఫార్సు చేయబడిన కార్యకలాపాలు:',
    reflectionTitle: 'వ్యక్తిగతీకరించిన వాయిస్ ప్రతిబింబం',
    transcriptTitle: 'వాయిస్ రికార్డింగ్ పాఠ్యం',
    consultationTitle: 'నిపుణులైన వైద్యుల సంప్రదింపు',
    consultationSubtext: 'నిరంతర భావోద్వేగ సమస్యలు లేదా తీవ్ర ఒత్తిడి గురించి లైసెన్స్ పొందిన నిపుణుడితో మాట్లాడటం ఎల్లప్పుడూ మంచిది.',
    bookConsultation: 'కన్సల్టేషన్ బుక్ చేయండి',
    disclaimer: 'ఈ అంచనా AI-ఆధారితమైనది మరియు దీనిని వైద్య సలహాగా పరిగణించకూడదు.'
  },
  Hindi: {
    backToDashboard: 'डैशबोर्ड पर वापस जाएं',
    engineBadge: 'AI भावनात्मक ट्रैकिंग इंजन',
    stateDetected: 'भावनात्मक स्थिति पहचानी गई',
    confidence: 'विश्वसनीयता',
    primary: 'प्राथमिक:',
    secondary: 'द्वितीयक:',
    bannerSubtext: 'आपकी आवाज़ के स्वर, गति और मनोभाव का सटीक विश्लेषण किया गया है।',
    emotionalIntensity: 'भावनात्मक तीव्रता',
    highLoad: 'उच्च भावनात्मक भार',
    moderateIntensity: 'मध्यम तीव्रता',
    calmGrounded: 'शांत और संतुलित',
    sentiment: 'मनोभाव',
    sentimentSubtext: 'शारीरिक और मौखिक अभिव्यक्ति से मूल्यांकित।',
    moodTrend: 'मूड का रुझान',
    moodSubtext: 'देखी गई भावनात्मक दिशा।',
    stability: 'स्थिरता',
    stabilitySubtext: 'संज्ञानात्मक संतुलन और भावनात्मक नियंत्रण सूचकांक।',
    cognitivePatterns: 'पहचाने गए संज्ञानात्मक पैटर्न',
    behavioralIndicators: 'व्यवहार संबंधी संकेतक',
    triggersTitle: 'पहचाने गए भावनात्मक ट्रिगर्स',
    positiveTitle: 'सकारात्मक भावनात्मक संकेतक',
    growthTitle: 'भावनात्मक विकास योजना और कार्य सुझाव',
    tailoredBadge: 'विशेष मार्गदर्शन',
    growthSuggestion: 'विकास सुझाव:',
    recommendedActivities: 'अनुशंसित गतिविधियाँ:',
    reflectionTitle: 'व्यक्तिगत आवाज़ प्रतिबिंब',
    transcriptTitle: 'वॉयस ट्रांसक्रिप्ट',
    consultationTitle: 'विशेषज्ञ डॉक्टर से परामर्श',
    consultationSubtext: 'गंभीर तनाव या चिंता के लिए किसी प्रमाणित मनोवैज्ञानिक से बात करना हमेशा मददगार होता है।',
    bookConsultation: 'परामर्श बुक करें',
    disclaimer: 'यह मूल्यांकन AI-जनरेटेड है और इसे चिकित्सीय सलाह नहीं माना जाना चाहिए।'
  },
  Tamil: {
    backToDashboard: 'டாஷ்போர்டுக்குத் திரும்பு',
    engineBadge: 'AI உணர்ச்சி கண்காணிப்பு இயந்திரம்',
    stateDetected: 'உணர்ச்சி நிலை கண்டறியப்பட்டது',
    confidence: 'நம்பகத்தன்மை',
    primary: 'முதன்மை:',
    secondary: 'இரண்டாம் நிலை:',
    bannerSubtext: 'உங்கள் குரல் தொனி மற்றும் உணர்ச்சிகள் துல்லியமாக பகுப்பாய்வு செய்யப்பட்டுள்ளன.',
    emotionalIntensity: 'உணர்ச்சி தீவிரம்',
    highLoad: 'அதிக உணர்ச்சி சுமை',
    moderateIntensity: 'மிதமான தீவிரம்',
    calmGrounded: 'அமைதியானது',
    sentiment: 'மனோபாவம்',
    sentimentSubtext: 'வார்த்தை உணர்ச்சி அடிப்படையில் மதிப்பீடு செய்யப்பட்டது.',
    moodTrend: 'மனநிலை போக்கு',
    moodSubtext: 'கண்டறியப்பட்ட உணர்ச்சிப் பாதை.',
    stability: 'நிலைத்தன்மை',
    stabilitySubtext: 'உணர்ச்சிக் கட்டுப்பாடு மற்றும் அறிவாற்றல் சமநிலை.',
    cognitivePatterns: 'அவதானிக்கப்பட்ட அறிவாற்றல் முறைகள்',
    behavioralIndicators: 'நடத்தை குறிகாட்டிகள்',
    triggersTitle: 'கண்டறியப்பட்ட உணர்ச்சி தூண்டுதல்கள்',
    positiveTitle: 'நேர்மறை உணர்ச்சி குறிகாட்டிகள்',
    growthTitle: 'உணர்ச்சி வளர்ச்சி திட்டம் மற்றும் பரிந்துரைகள்',
    tailoredBadge: 'தனிப்பயனாக்கப்பட்ட வழிகாட்டுதல்',
    growthSuggestion: 'வளர்ச்சி பரிந்துரை:',
    recommendedActivities: 'பரிந்துரைக்கப்பட்ட செயல்பாடுகள்:',
    reflectionTitle: 'தனிப்பயனாக்கப்பட்ட குரல் பிரதிபலிப்பு',
    transcriptTitle: 'குரல் பதிவு உரை',
    consultationTitle: 'மருத்துவர் ஆலோசனை',
    consultationSubtext: 'தொடர்ச்சியான மன அழுத்தம் குறித்து உரிமம் பெற்ற மருத்துவரிடம் ஆலோசிப்பது சிறந்தது.',
    bookConsultation: 'ஆலோசனையை பதிவு செய்க',
    disclaimer: 'இந்த மதிப்பீடு AI மூலம் உருவாக்கப்பட்டது மற்றும் மருத்துவ ஆலோசனையாக கருதப்படக்கூடாது.'
  },
  Malayalam: {
    backToDashboard: 'ഡാഷ്‌ബോർഡിലേക്ക് മടങ്ങുക',
    engineBadge: 'AI വൈകാരിക ട്രാക്കിംഗ് എഞ്ചിൻ',
    stateDetected: 'വൈകാരികാവസ്ഥ കണ്ടെത്തി',
    confidence: 'വിശ്വാസ്യത',
    primary: 'പ്രാഥമികം:',
    secondary: 'ദ്വിതീയം:',
    bannerSubtext: 'നിങ്ങളുടെ ശബ്ദ ശൈലിയും വികാരങ്ങളും കൃത്യമായി വിലയിരുത്തിയിരിക്കുന്നു.',
    emotionalIntensity: 'വൈകാരിക തീവ്രത',
    highLoad: 'ഉയർന്ന വൈകാരിക ഭാരം',
    moderateIntensity: 'മിതമായ തീവ്രത',
    calmGrounded: 'ശാന്തവും സമതുലിതവും',
    sentiment: 'മനോഭാവം',
    sentimentSubtext: 'വാക്കുകളിലെ വൈകാരികത അടിസ്ഥാനമാക്കി വിലയിരുത്തി.',
    moodTrend: 'മൂഡ് പ്രവണത',
    moodSubtext: 'നിരീക്ഷിച്ച വൈകാരിക മാറ്റങ്ങൾ.',
    stability: 'സ്ഥിരത',
    stabilitySubtext: 'വൈകാരിക നിയന്ത്രണ സൂചിക.',
    cognitivePatterns: 'നിരീക്ഷിച്ച ചിന്താ രീതികൾ',
    behavioralIndicators: 'പെരുമാറ്റ സൂചകങ്ങൾ',
    triggersTitle: 'കണ്ടെത്തിയ വൈകാരിക പ്രേരകങ്ങൾ',
    positiveTitle: 'പോസിറ്റീവ് വൈകാരിക സൂചകങ്ങൾ',
    growthTitle: 'വൈകാരിക വളർച്ചാ പദ്ധതിയും നിർദ്ദേശങ്ങളും',
    tailoredBadge: 'പ്രത്യേക മാർഗ്ഗനിർദ്ദേശം',
    growthSuggestion: 'വളർച്ചാ നിർദ്ദേശം:',
    recommendedActivities: 'ശുപാർശ ചെയ്യുന്ന പ്രവർത്തനങ്ങൾ:',
    reflectionTitle: 'വ്യക്തിഗത വോയ്‌സ് പ്രതിഫലനം',
    transcriptTitle: 'വോയ്‌സ് ട്രാൻസ്ക്രിപ്റ്റ്',
    consultationTitle: 'വിദഗ്ദ്ധ ഡോക്ടർ കൺസൾട്ടേഷൻ',
    consultationSubtext: 'തുടർച്ചയായ മാനസിക സമ്മർദ്ദത്തിന് ലൈസൻസുള്ള വിദഗ്ദ്ധനുമായി സംസാരിക്കുന്നത് നല്ലതാണ്.',
    bookConsultation: 'കൺസൾട്ടേഷൻ ബുക്ക് ചെയ്യുക',
    disclaimer: 'ഈ വിലയിരുത്തൽ AI നിർമ്മിതമാണ്, ഇത് വൈദ്യോപദേശമായി കണക്കാക്കരുത്.'
  },
  Kannada: {
    backToDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    engineBadge: 'AI ಭಾವನಾತ್ಮಕ ಟ್ರ್ಯಾಕಿಂಗ್ ಎಂಜಿನ್',
    stateDetected: 'ಭಾವನಾತ್ಮಕ ಸ್ಥಿತಿ ಪತ್ತೆಯಾಗಿದೆ',
    confidence: 'ವಿಶ್ವಾಸಾರ್ಹತೆ',
    primary: 'ಪ್ರಾಥಮಿಕ:',
    secondary: 'ದ್ವಿತೀಯ:',
    bannerSubtext: 'ನಿಮ್ಮ ಧ್ವನಿಯ ಸ್ವರ ಮತ್ತು ಭಾವನೆಗಳನ್ನು ನಿಖರವಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ.',
    emotionalIntensity: 'ಭಾವನಾತ್ಮಕ ತೀವ್ರತೆ',
    highLoad: 'ಹೆಚ್ಚಿನ ಭಾವನಾತ್ಮಕ ಹೊರೆ',
    moderateIntensity: 'ಮಧ್ಯಮ ತೀವ್ರತೆ',
    calmGrounded: 'ಶಾಂತ ಮತ್ತು ಸ್ಥಿರ',
    sentiment: 'ಮನೋಭಾವನೆ',
    sentimentSubtext: 'ಪದಗಳ ಭಾವನೆಯ ಆಧಾರದ ಮೇಲೆ ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗಿದೆ.',
    moodTrend: 'ಮನಸ್ಥಿತಿ ಪ್ರವೃತ್ತಿ',
    moodSubtext: 'ಗಮನಿಸಿದ ಭಾವನಾತ್ಮಕ ಪಥ.',
    stability: 'ಸ್ಥಿರತೆ',
    stabilitySubtext: 'ಭಾವನಾತ್ಮಕ ನಿಯಂತ್ರಣ ಸೂಚಿ.',
    cognitivePatterns: 'ಗಮನಿಸಿದ ಅರಿವಿನ ಮಾದರಿಗಳು',
    behavioralIndicators: 'ವರ್ತನೆಯ ಸೂಚಕಗಳು',
    triggersTitle: 'ಗುರುತಿಸಲಾದ ಭಾವನಾತ್ಮಕ ಪ್ರಚೋದಕಗಳು',
    positiveTitle: 'ಧನಾತ್ಮಕ ಭಾವನಾತ್ಮಕ ಸೂಚಕಗಳು',
    growthTitle: 'ಭಾವನಾತ್ಮಕ ಬೆಳವಣಿಗೆಯ ಯೋಜನೆ ಮತ್ತು ಕ್ರಿಯಾಶೀಲ ಸಲಹೆಗಳು',
    tailoredBadge: 'ವಿಶೇಷ ಮಾರ್ಗದರ್ಶನ',
    growthSuggestion: 'ಬೆಳವಣಿಗೆಯ ಸಲಹೆ:',
    recommendedActivities: 'ಶಿಫಾರಸು ಮಾಡಲಾದ ಚಟುವಟಿಕೆಗಳು:',
    reflectionTitle: 'ವೈಯಕ್ತೀಕರಿಸಿದ ಧ್ವನಿ ಪ್ರತಿಬಿಂಬ',
    transcriptTitle: 'ಧ್ವನಿ ಪ್ರತಿಲೇಖನ',
    consultationTitle: 'ತಜ್ಞ ವೈದ್ಯರ ಸಮಾಲೋಚನೆ',
    consultationSubtext: 'ನಿರಂತರ ಒತ್ತಡ ಅಥವಾ ಆತಂಕಕ್ಕೆ ಪರವಾನಗಿ ಪಡೆದ ತಜ್ಞರೊಂದಿಗೆ ಮಾತನಾಡುವುದು ಸೂಕ್ತ.',
    bookConsultation: 'ಸಮಾಲೋಚನೆ ಕಾಯ್ದಿರಿಸಿ',
    disclaimer: 'ಈ ಮೌಲ್ಯಮಾಪನವು AI-ರಚಿತವಾಗಿದೆ ಮತ್ತು ಇದನ್ನು ವೈದ್ಯಕೀಯ ಸಲಹೆಯೆಂದು ಪರಿಗಣಿಸಬಾರದು.'
  }
};

export const AIReport = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [reportData, setReportData] = useState(location.state?.report || null);
  const [initialAnalysis, setInitialAnalysis] = useState(location.state?.report?.analysis || null);
  const [activeAnalysis, setActiveAnalysis] = useState(location.state?.report?.analysis || null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
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
        setInitialAnalysis(res.data.analysis);
        setActiveAnalysis(res.data.analysis);
      }
    } catch (err) {
      toast.error('Failed to load AI report');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (targetLang) => {
    if (targetLang === selectedLanguage || isTranslating) return;
    setSelectedLanguage(targetLang);

    if (targetLang === 'English') {
      setActiveAnalysis(initialAnalysis);
      return;
    }

    setIsTranslating(true);
    toast.info(`Translating report into ${targetLang}...`);

    try {
      const payloadToTranslate = initialAnalysis || activeAnalysis;
      const res = await aiService.translateReport(payloadToTranslate, targetLang);
      if (res.success && res.data) {
        setActiveAnalysis(res.data);
        toast.success(`Assessment translated into ${targetLang}`);
      }
    } catch (err) {
      toast.error(`Could not translate into ${targetLang}. Preserving original language.`);
    } finally {
      setIsTranslating(false);
    }
  };

  const transcript = reportData?.transcript || '';
  const rawAnalysis = activeAnalysis || reportData?.analysis || {};
  const t = UI_DICTIONARY[selectedLanguage] || UI_DICTIONARY.English;

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
        {/* Top Header & Multilingual Language Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
            {t.backToDashboard}
          </Button>

          {/* Multilingual Selector */}
          <div className="flex items-center space-x-1.5 p-1 bg-neutral-100 rounded-2xl polo-border flex-wrap gap-1">
            <div className="flex items-center space-x-1 px-2 text-xs font-black text-neutral-600">
              <Globe className="w-3.5 h-3.5 text-[#9F1239]" />
              <span className="hidden md:inline">Language:</span>
            </div>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                disabled={isTranslating}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all duration-200 ${
                  selectedLanguage === lang.code
                    ? 'bg-[#9F1239] text-white polo-shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {lang.native}
              </button>
            ))}
            {isTranslating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9F1239] ml-1" />}
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
                  {t.stateDetected}
                </span>
                <span className="text-[10px] font-mono font-bold bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
                  {confidenceScore}% {t.confidence}
                </span>
              </div>
              <div className="flex items-center space-x-3 mt-1.5 flex-wrap gap-y-1">
                <div className="text-2xl font-black uppercase">
                  {t.primary} <span className="text-red-400">{primaryEmotion}</span>
                </div>
                <span className="text-neutral-500">•</span>
                <div className="text-2xl font-black uppercase">
                  {t.secondary} <span className="text-amber-400">{secondaryEmotion}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-neutral-300 font-medium max-w-xs text-center md:text-right border-t md:border-t-0 md:border-l border-neutral-800 pt-3 md:pt-0 md:pl-4">
            {t.bannerSubtext}
          </div>
        </Card>

        {/* Emotion Metrics Quad Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Emotional Intensity */}
          <Card className="flex flex-col justify-between p-4 space-y-3 bg-red-50/40 border-red-200">
            <div className="flex items-center justify-between text-xs font-black text-red-900 uppercase">
              <span className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-red-600" />
                <span>{t.emotionalIntensity}</span>
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
              {emotionalIntensity > 75 ? t.highLoad : emotionalIntensity > 45 ? t.moderateIntensity : t.calmGrounded}
            </span>
          </Card>

          {/* Sentiment */}
          <Card className="flex flex-col justify-between p-4 space-y-3 bg-indigo-50/40 border-indigo-200">
            <div className="flex items-center justify-between text-xs font-black text-indigo-900 uppercase">
              <span className="flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.sentiment}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-black uppercase">
                {sentiment}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-indigo-800">
              {t.sentimentSubtext}
            </p>
          </Card>

          {/* Mood Trend */}
          <Card className="flex flex-col justify-between p-4 space-y-3 bg-emerald-50/40 border-emerald-200">
            <div className="flex items-center justify-between text-xs font-black text-emerald-900 uppercase">
              <span className="flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.moodTrend}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-black uppercase">
                {moodTrend}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-800">
              {t.moodSubtext}
            </p>
          </Card>

          {/* Emotional Stability */}
          <Card className="flex flex-col justify-between p-4 space-y-3 bg-amber-50/40 border-amber-200">
            <div className="flex items-center justify-between text-xs font-black text-amber-900 uppercase">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.stability}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[11px] font-black uppercase">
                {emotionalStability}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-amber-800">
              {t.stabilitySubtext}
            </p>
          </Card>
        </div>

        {/* Cognitive Patterns & Behavioral Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cognitive Patterns */}
          <Card className="p-5 space-y-3 bg-white polo-border">
            <div className="flex items-center space-x-2 text-neutral-900 border-b border-neutral-200 pb-2.5">
              <Brain className="w-4 h-4 text-[#9F1239]" />
              <h4 className="text-xs font-black uppercase tracking-wider">{t.cognitivePatterns}</h4>
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
              <h4 className="text-xs font-black uppercase tracking-wider">{t.behavioralIndicators}</h4>
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
              <span>{t.triggersTitle}</span>
            </h4>
            <ul className="space-y-1.5">
              {emotionalTriggers.map((trig, idx) => (
                <li key={idx} className="text-xs font-medium text-neutral-800 flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                  <span>{trig}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Positive Indicators */}
          <Card className="p-5 space-y-3 bg-emerald-50/30 border-emerald-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center space-x-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>{t.positiveTitle}</span>
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
                {t.growthTitle}
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-red-100 text-[#9F1239]">
              {t.tailoredBadge}
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9F1239]">
              {t.growthSuggestion}
            </span>
            <div className="p-4 bg-red-50/70 rounded-xl border border-red-200 text-xs font-bold text-neutral-900 leading-relaxed">
              {growthSuggestion}
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-black uppercase text-neutral-800">
              {t.recommendedActivities}
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
            <h4 className="text-xs font-black uppercase tracking-wider">{t.reflectionTitle}</h4>
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
            <h4 className="text-xs font-black uppercase text-black">{t.transcriptTitle}</h4>
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
              <h4 className="text-sm font-black uppercase">{t.consultationTitle}</h4>
              <p className="text-xs font-medium text-neutral-300 mt-0.5">
                {t.consultationSubtext}
              </p>
            </div>
          </div>
          <Button size="lg" icon={UserCheck} onClick={() => navigate('/psychologists')}>
            {t.bookConsultation}
          </Button>
        </Card>

        {/* Disclaimer */}
        <p className="text-[11px] text-center font-bold text-neutral-500 italic">
          {t.disclaimer}
        </p>
      </div>
    </DashboardLayout>
  );
};
