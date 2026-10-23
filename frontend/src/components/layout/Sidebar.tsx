import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Users,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  LogOut,
  GraduationCap,
  School,
} from 'lucide-react';
import { useAttendance, NavigationTab } from '../../context/AttendanceContext';
import { UserSession } from '../auth/RoleLogin';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  userSession?: UserSession;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  setMobileOpen,
  userSession,
  onLogout,
}) => {
  const { activeTab, setActiveTab, people, attendanceRecords, currentDate, settings } = useAttendance();

  const todayRecords = attendanceRecords.filter((r) => r.date === currentDate);
  const presentCount = todayRecords.filter((r) => r.status === 'present').length;

  const role = userSession?.role || 'admin';

  // Role-based navigation items
  const allNavItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    allowedRoles: string[];
  }[] = [
    {
      id: 'dashboard',
      label: role === 'student' ? 'My Overview' : role === 'parent' ? "Child's Overview" : 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      allowedRoles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
      id: 'attendance',
      label: role === 'student' ? 'My Checkpoints' : role === 'parent' ? 'Daily Attendance' : 'Attendance',
      icon: <CheckSquare size={18} />,
      badge: role === 'admin' || role === 'teacher' ? `${presentCount}/${people.length}` : undefined,
      allowedRoles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
      id: 'calendar',
      label: 'Monthly Calendar',
      icon: <CalendarDays size={18} />,
      allowedRoles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
      id: 'people',
      label: 'Students & Staff',
      icon: <Users size={18} />,
      badge: `${people.length}`,
      allowedRoles: ['admin', 'teacher'],
    },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.allowedRoles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-zinc-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo & Nav */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
                A
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-950 text-base tracking-tight leading-none">
                  {settings.orgName.split(' ')[0] || 'Attendly'}
                </span>
                <span className="text-[10px] font-semibold text-zinc-500 tracking-wide uppercase mt-0.5">
                  {role} Portal
                </span>
              </div>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 uppercase">
              {role}
            </span>
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-1 overflow-y-auto flex-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Portal Navigation
            </div>
            {visibleNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-zinc-800 text-zinc-200'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile section */}
          <div className="p-3 mx-3 mb-2 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-zinc-700" />
                MongoDB Live Sync
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Active</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
              Role: <b className="capitalize">{role}</b> • Verified access
            </p>
          </div>
        </div>

        {/* Bottom: User Card and Logout Button */}
        <div className="p-3 border-t border-zinc-200/80 space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-zinc-950 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                {userSession ? userSession.name.slice(0, 2).toUpperCase() : 'AM'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-950 truncate block">
                  {userSession?.name || 'Alex Morgan'}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-zinc-600 hover:text-red-600 hover:bg-red-50 border border-zinc-200 hover:border-red-200 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out / Switch Role</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
