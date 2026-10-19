import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAttendance, NavigationTab } from '../../context/AttendanceContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, people, attendanceRecords, currentDate } = useAttendance();

  const todayRecords = attendanceRecords.filter((r) => r.date === currentDate);
  const presentCount = todayRecords.filter((r) => r.status === 'present').length;

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <CheckSquare size={18} />,
      badge: `${presentCount}/${people.length}`,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <CalendarDays size={18} />,
    },
    {
      id: 'people',
      label: 'Students / Staff',
      icon: <Users size={18} />,
      badge: `${people.length}`,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 size={18} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={18} />,
    },
  ];

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
                  Attendly
                </span>
                <span className="text-[11px] font-medium text-zinc-600 tracking-wide mt-0.5">
                  SYSTEMS ENTERPRISE
                </span>
              </div>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
              PRO
            </span>
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-1 overflow-y-auto flex-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
              Workspace
            </div>
            {navItems.map((item) => {
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

          {/* Quick Info Box */}
          <div className="p-3 mx-3 mb-2 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-zinc-700" />
                Daily Sync Status
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">100% OK</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
              Monochrome dashboard active. Client-side state in sync.
            </p>
          </div>
        </div>

        {/* Bottom: User Profile Section */}
        <div className="p-3 border-t border-zinc-200/80">
          <button
            onClick={() => {
              setActiveTab('settings');
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-zinc-900 text-white font-medium text-xs flex items-center justify-center shrink-0 border border-zinc-800">
                AM
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-zinc-950 truncate">Alex Morgan</span>
                  <ShieldCheck size={12} className="text-zinc-700 shrink-0" />
                </div>
                <span className="text-[11px] text-zinc-600 truncate block">Administrator</span>
              </div>
            </div>
            <ChevronRight
              size={14}
              className="text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition-all"
            />
          </button>
        </div>
      </aside>
    </>
  );
};
