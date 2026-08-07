import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Footer } from '../components/common/Footer';
import { Mic, Activity, ShieldCheck, Video, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';

export const Landing = () => {
  const heroRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-[#9F1239] rounded-xl polo-border flex items-center justify-center text-white font-black text-xl polo-shadow-sm">
            P
          </div>
          <span className="text-2xl font-black tracking-tight text-black uppercase">
            POLO <span className="text-[#9F1239]">AI</span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 max-w-7xl mx-auto w-full">
        <div ref={heroRef} className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-black leading-none">
            Speak Your Mind. <br />
            <span className="text-[#9F1239] underline decoration-black decoration-4">Understand Your Emotion.</span>
          </h1>

          <p className="text-base md:text-lg font-bold text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Record voice check-ins in seconds. OpenAI Whisper & GPT-5.1 instantly generate real-time stress scores, burnout metrics, AI journals, and connect you with licensed psychologists.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" icon={Mic} onClick={() => navigate('/voice-checkin')}>
              Start Voice Check-in
            </Button>
            <Button size="lg" variant="secondary" icon={ArrowRight} onClick={() => navigate('/psychologists')}>
              Explore Psychologists
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 bg-white border-y-4 border-black">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black uppercase text-black">Enterprise Mental Wellness Features</h2>
            <p className="text-sm font-bold text-neutral-600">Built on POLO Design System for seamless user interaction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:translate-y-[-4px]">
              <div className="p-3 bg-[#9F1239] text-white rounded-xl polo-border w-fit mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase text-black mb-2">AI Voice Check-in</h3>
              <p className="text-xs font-medium text-neutral-600 leading-relaxed">
                Record short voice notes. Automatic speech recognition transcribes your audio and evaluates emotion, stress, and anxiety.
              </p>
            </Card>

            <Card className="hover:translate-y-[-4px]">
              <div className="p-3 bg-black text-white rounded-xl polo-border w-fit mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase text-black mb-2">Real-time Analytics</h3>
              <p className="text-xs font-medium text-neutral-600 leading-relaxed">
                Track quantitative health scores (Stress, Anxiety, Burnout, Overall Wellness) with visual progress meters and actionable plans.
              </p>
            </Card>

            <Card className="hover:translate-y-[-4px]">
              <div className="p-3 bg-[#9F1239] text-white rounded-xl polo-border w-fit mb-4">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase text-black mb-2">WebRTC Video Calls</h3>
              <p className="text-xs font-medium text-neutral-600 leading-relaxed">
                Connect directly with licensed therapists in encrypted end-to-end Socket.IO WebRTC video consultation rooms.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Safety Notice Banner */}
      <section className="px-6 py-12 max-w-7xl mx-auto w-full">
        <div className="p-8 bg-amber-50 rounded-3xl border-4 border-amber-500 polo-shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <ShieldCheck className="w-10 h-10 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-black uppercase text-amber-900">Confidential & Compliant</h4>
              <p className="text-xs font-semibold text-amber-800 mt-1">
                Your data is stored securely. AI assessments serve as personal wellness tools and do not replace professional clinical therapy.
              </p>
            </div>
          </div>
          <Link to="/register">
            <Button size="md">Create Free Account</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};
