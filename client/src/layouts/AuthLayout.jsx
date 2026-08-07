import React from 'react';
import { Link } from 'react-router-dom';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 polo-border polo-shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-[#9F1239] rounded-xl polo-border flex items-center justify-center text-white font-black text-xl polo-shadow">
              M
            </div>
            <span className="text-2xl font-black tracking-tight text-black uppercase">
              POLO <span className="text-[#9F1239]">AI</span>
            </span>
          </Link>
          {title && <h2 className="text-2xl font-black uppercase text-black pt-2">{title}</h2>}
          {subtitle && <p className="text-xs font-semibold text-neutral-600">{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  );
};
