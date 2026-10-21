import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  Plus,
  ChevronDown,
  LogOut,
  Upload,
  User,
  Sliders,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { Button } from '../common/Button';
import { UserSession } from '../auth/RoleLogin';

interface TopNavProps {
  onMobileMenuToggle: () => void;
  userSession?: UserSession;
  onLogout?: () => void;
  onOpenBulkModal?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onMobileMenuToggle,
  userSession,
  onLogout,
  onOpenBulkModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    currentDate,
    setCommandPaletteOpen,
    openMarkModal,
    resetToMockData,
    settings,
  } = useAttendance();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabLabels: Record<string, { title: string; category: string }> = {
    dashboard: { title: 'Dashboard Overview', category: 'Overview' },
    attendance: { title: 'Attendance Management', category: 'Management' },
    calendar: { title: 'Monthly Calendar', category: 'Schedule' },
    people: { title: 'Students & Staff Directory', category: 'Organization' },
    reports: { title: 'Analytics & Reports', category: 'Intelligence' },
    settings: { title: 'System Settings', category: 'Configuration' },
  };

  const currentTabInfo = tabLabels[activeTab] || { title: 'Dashboard', category: 'Overview' };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(currentDate + 'T00:00:00'));

  const role = userSession?.role || 'admin';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200/90 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
          aria-label="Toggle mobile sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-900 capitalize">{role} Portal</span>
            <span>/</span>
            <span className="text-zinc-500 font-medium capitalize">{activeTab}</span>
          </div>
          <h1 className="text-sm lg:text-base font-semibold text-zinc-950 tracking-tight leading-none mt-0.5">
            {role === 'student'
              ? 'My Academic Attendance'
              : role === 'parent'
              ? "Child's Daily Attendance"
              : currentTabInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Bulk Upload Button (For Admin) */}
        {role === 'admin' && onOpenBulkModal && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload size={13} />}
            onClick={onOpenBulkModal}
            className="hidden sm:inline-flex"
          >
            Bulk Upload (CSV)
          </Button>
        )}

        {/* Search Bar Button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-400 hover:border-zinc-300 hover:text-zinc-700 transition-all cursor-pointer group"
        >
          <Search size={14} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" />
          <span className="w-32 text-left truncate">Search or jump to...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-zinc-200 bg-white text-[10px] font-mono text-zinc-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Current Date Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-700">
          <Calendar size={13} className="text-zinc-500" />
          <span>{formattedDate}</span>
        </div>

        {/* Quick Mark Attendance (Admin & Teachers only) */}
        {(role === 'admin' || role === 'teacher') && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => openMarkModal()}
            className="shadow-xs"
          >
            <span className="hidden sm:inline">Mark Attendance</span>
            <span className="sm:hidden">Mark</span>
          </Button>
        )}

        {/* User Profile & Logout Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-zinc-950 text-white font-mono text-[11px] font-bold flex items-center justify-center">
              {userSession ? userSession.name.slice(0, 2).toUpperCase() : 'AM'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <span className="font-semibold text-zinc-950 block leading-tight">
                {userSession?.name || 'Alex Morgan'}
              </span>
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">
                {role}
              </span>
            </div>
            <ChevronDown size={14} className="text-zinc-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl border border-zinc-200 shadow-xl z-50 p-1 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2.5 border-b border-zinc-100">
                <p className="text-xs font-bold text-zinc-950">{userSession?.name || settings.adminName}</p>
                <p className="text-[11px] text-zinc-400 truncate">{userSession?.email || settings.adminEmail}</p>
                <span className="inline-block mt-1.5 text-[10px] font-mono font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded uppercase border border-zinc-200">
                  {role} Portal Active
                </span>
              </div>

              {role === 'admin' && (
                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setActiveTab('settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors text-left cursor-pointer"
                  >
                    <Sliders size={14} />
                    <span>System Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      resetToMockData();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors text-left cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Sample Data</span>
                  </button>
                </div>
              )}

              {/* Logout / Switch Role Option */}
              <div className="p-1 border-t border-zinc-100">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Log Out / Switch Role</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
