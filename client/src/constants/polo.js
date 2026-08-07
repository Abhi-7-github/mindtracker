export const POLO_THEME = {
  primary: '#B82126',
  primaryHover: '#8A181C',
  black: '#000000',
  white: '#FFFFFF',
  bg: '#F5F5F5',
  darkCard: '#1A1A1A',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  VOICE_CHECKIN: '/voice-checkin',
  AI_REPORT: '/ai-report/:sessionId',
  PSYCHOLOGISTS: '/psychologists',
  APPOINTMENTS: '/appointments',
  MEETING: '/meeting/:roomId',
  JOURNAL: '/journal',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
};

export const NAV_LINKS = [
  { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Voice Check-in', path: '/voice-checkin', icon: 'Mic' },
  { name: 'Psychologists', path: '/psychologists', icon: 'UserCheck' },
  { name: 'Appointments', path: '/appointments', icon: 'Calendar' },
  { name: 'Journal', path: '/journal', icon: 'BookOpen' },
  { name: 'Notifications', path: '/notifications', icon: 'Bell' },
];

