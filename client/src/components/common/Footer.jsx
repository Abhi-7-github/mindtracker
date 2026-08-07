import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-black text-white border-t-4 border-[#B82126] py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-[#B82126] rounded-lg border-2 border-white flex items-center justify-center font-black">
              M
            </div>
            <span className="text-lg font-black uppercase tracking-tight">MindBridge AI</span>
          </div>
          <p className="text-xs font-medium text-neutral-400 leading-relaxed">
            Next-generation AI mental health tracking, confidential voice check-ins, real-time emotion scoring, and WebRTC therapy consultations.
          </p>
        </div>

        <div>
          <h5 className="text-xs font-black uppercase text-[#B82126] mb-3 tracking-wider">Features</h5>
          <ul className="space-y-2 text-xs font-bold text-neutral-300">
            <li><Link to="/voice-checkin" className="hover:text-white">AI Voice Check-in</Link></li>
            <li><Link to="/psychologists" className="hover:text-white">Therapist Directory</Link></li>
            <li><Link to="/journal" className="hover:text-white">AI Smart Journal</Link></li>
            <li><Link to="/appointments" className="hover:text-white">WebRTC Consultations</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-black uppercase text-[#B82126] mb-3 tracking-wider">Account</h5>
          <ul className="space-y-2 text-xs font-bold text-neutral-300">
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
            <li><Link to="/register" className="hover:text-white">Register Account</Link></li>
            <li><Link to="/profile" className="hover:text-white">User Profile</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-black uppercase text-[#B82126] mb-3 tracking-wider">Safety & Notice</h5>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            MindBridge AI assessments are AI-generated and provide supportive wellness insight. They do not constitute formal medical advice or emergency medical intervention.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-neutral-500">
        <p>© 2026 MindBridge AI. Built with POLO Design System.</p>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};
