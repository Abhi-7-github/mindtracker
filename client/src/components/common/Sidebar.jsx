import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NAV_LINKS } from '../../constants/polo';
import { useAuthStore } from '../../store/useAuthStore';
import {
  LayoutDashboard,
  Mic,
  UserCheck,
  Calendar,
  BookOpen,
  Bell,
  User,
  Settings,
  ShieldAlert,
  LogOut,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Mic,
  UserCheck,
  Calendar,
  BookOpen,
  Bell,
  User,
  Settings,
  ShieldAlert,
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed md:sticky top-[61px] left-0 z-30 w-64 h-[calc(100vh-61px)] bg-white border-r-2 border-black p-4 flex flex-col justify-between transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black uppercase text-neutral-400 tracking-wider">
            Menu Navigation
          </p>
          {NAV_LINKS.map((link) => {
            const Icon = iconMap[link.icon] || LayoutDashboard;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-3 rounded-xl text-xs font-extrabold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#B82126] text-white polo-border polo-shadow-sm'
                      : 'text-black hover:bg-neutral-100 border-2 border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </div>

        {user?.role === 'admin' && (
          <div className="space-y-1 pt-2 border-t-2 border-neutral-200">
            <p className="px-3 text-[10px] font-black uppercase text-neutral-400 tracking-wider">
              Administration
            </p>
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-3 rounded-xl text-xs font-extrabold transition-all duration-150 ${
                  isActive
                    ? 'bg-black text-white polo-border polo-shadow-sm'
                    : 'text-black hover:bg-neutral-100 border-2 border-transparent'
                }`
              }
            >
              <ShieldAlert className="w-4 h-4 text-[#B82126]" />
              <span>Admin Portal</span>
            </NavLink>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t-2 border-black">
        <NavLink
          to="/profile"
          className="flex items-center space-x-3 px-3 py-2 text-xs font-bold text-black hover:bg-neutral-100 rounded-lg"
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
};
