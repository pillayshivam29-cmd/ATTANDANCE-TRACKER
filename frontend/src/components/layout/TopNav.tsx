import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  Plus,
  ChevronDown,
  CheckCheck,
  User,
  Sliders,
  RotateCcw,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { Button } from '../common/Button';

interface TopNavProps {
  onMobileMenuToggle: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMobileMenuToggle }) => {
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
    people: { title: 'Students & Employees Directory', category: 'Organization' },
    reports: { title: 'Analytics & Reports', category: 'Intelligence' },
    settings: { title: 'System Settings', category: 'Configuration' },
  };

  const currentTabInfo = tabLabels[activeTab] || { title: 'Dashboard', category: 'Overview' };

  // Format current date nicely: "Saturday, Oct 17, 2026"
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(currentDate + 'T00:00:00'));

  const mockNotifications = [
    {
      id: 'n1',
      title: 'Late Arrival Alert',
      desc: 'Julian Hayes checked in at 09:38 AM (exceeded grace period)',
      time: '1h ago',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Absent Record Logged',
      desc: 'Lucas Sterling logged sick leave for today',
      time: '2h ago',
      unread: true,
    },
    {
      id: 'n3',
      title: 'System Milestone',
      desc: 'Weekly attendance rate reached 92.4% benchmark',
      time: '5h ago',
      unread: false,
    },
  ];

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
            <span>{currentTabInfo.category}</span>
            <span>/</span>
            <span className="text-zinc-600 font-medium capitalize">{activeTab}</span>
          </div>
          <h1 className="text-sm lg:text-base font-semibold text-zinc-950 tracking-tight leading-none mt-0.5">
            {currentTabInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Controls: Search, Date, Notifications, Quick Add, Profile */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Search Bar Button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-400 hover:border-zinc-300 hover:text-zinc-700 transition-all cursor-pointer group"
        >
          <Search size={14} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" />
          <span className="w-36 text-left truncate">Search or jump to...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-zinc-200 bg-white text-[10px] font-mono text-zinc-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Current Date Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-700">
          <Calendar size={13} className="text-zinc-500" />
          <span>{formattedDate}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zinc-950 ring-2 ring-white" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-zinc-200 shadow-xl z-50 p-1 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-950">Notifications</span>
                <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                  2 unread
                </span>
              </div>
              <div className="divide-y divide-zinc-50 max-h-64 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 text-left hover:bg-zinc-50 transition-colors cursor-pointer ${
                      notif.unread ? 'bg-zinc-50/60' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-zinc-900">{notif.title}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {notif.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-zinc-100 text-center">
                <button
                  onClick={() => setNotificationOpen(false)}
                  className="w-full text-center text-xs font-medium text-zinc-600 hover:text-zinc-950 py-1 cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Mark Attendance Button */}
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

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-zinc-950 text-white font-medium text-[11px] flex items-center justify-center">
              AM
            </div>
            <ChevronDown size={14} className="text-zinc-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-zinc-200 shadow-xl z-50 p-1 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2.5 border-b border-zinc-100">
                <p className="text-xs font-semibold text-zinc-950">{settings.adminName}</p>
                <p className="text-[11px] text-zinc-400 truncate">{settings.adminEmail}</p>
                <span className="inline-block mt-1.5 text-[10px] font-mono text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">
                  Head Administrator
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    setActiveTab('settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors text-left cursor-pointer"
                >
                  <Sliders size={14} />
                  <span>Preferences & Rules</span>
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

              <div className="p-1 border-t border-zinc-100">
                <div className="px-2 py-1 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                  <span>Theme</span>
                  <span className="font-semibold text-zinc-700">Monochrome</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
