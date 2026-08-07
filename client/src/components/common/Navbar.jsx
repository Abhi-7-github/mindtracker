import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Mic, Bell, LogOut, User, Settings, ShieldAlert, Menu, X } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-black px-4 md:px-8 py-3 flex items-center justify-between polo-shadow-sm">
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg polo-border hover:bg-neutral-100"
          >
            <Menu className="w-5 h-5 text-black" />
          </button>
        )}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-[#B82126] rounded-xl polo-border flex items-center justify-center text-white font-black text-lg polo-shadow-sm">
            M
          </div>
          <span className="text-xl font-black tracking-tight text-black uppercase">
            MindBridge <span className="text-[#B82126]">AI</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          icon={Mic}
          size="sm"
          onClick={() => navigate('/voice-checkin')}
          className="hidden sm:inline-flex"
        >
          Voice Check-in
        </Button>

        <Link
          to="/notifications"
          className="p-2.5 rounded-xl bg-white polo-border hover:bg-neutral-100 relative text-black"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B82126]" />
        </Link>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-neutral-100 focus:outline-none"
          >
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
            <span className="hidden md:inline-block text-xs font-black text-black">
              {user?.name || 'User'}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl polo-border polo-shadow-lg p-2 z-50 space-y-1">
              <div className="px-3 py-2 border-b-2 border-neutral-200">
                <p className="text-xs font-black text-black">{user?.name}</p>
                <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300">
                  {user?.role || 'user'}
                </span>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-black rounded-lg hover:bg-neutral-100"
              >
                <User className="w-4 h-4 text-[#B82126]" />
                <span>Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setShowDropdown(false)}
                className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-black rounded-lg hover:bg-neutral-100"
              >
                <Settings className="w-4 h-4 text-[#B82126]" />
                <span>Settings</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-[#B82126] rounded-lg hover:bg-red-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Portal</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-red-600 rounded-lg hover:bg-red-50 border-t border-neutral-200 mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
