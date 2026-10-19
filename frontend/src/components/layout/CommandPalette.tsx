import React, { useState, useEffect, useRef } from 'react';
import { useAttendance, NavigationTab } from '../../context/AttendanceContext';
import {
  Search,
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  PlusCircle,
  Download,
  RotateCcw,
  X,
  ArrowRight,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTab,
    people,
    openMarkModal,
    exportCSV,
    resetToMockData,
  } = useAttendance();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Filter actions and people
  const navigationItems: { title: string; category: string; tab: NavigationTab; icon: React.ReactNode }[] = [
    { title: 'Go to Dashboard', category: 'Navigation', tab: 'dashboard', icon: <LayoutDashboard size={15} /> },
    { title: 'Go to Attendance Table', category: 'Navigation', tab: 'attendance', icon: <CheckSquare size={15} /> },
    { title: 'Go to Calendar', category: 'Navigation', tab: 'calendar', icon: <CalendarDays size={15} /> },
    { title: 'Go to Students & Employees Directory', category: 'Navigation', tab: 'people', icon: <Users size={15} /> },
    { title: 'Go to Analytics & Reports', category: 'Navigation', tab: 'reports', icon: <BarChart3 size={15} /> },
    { title: 'Go to Settings', category: 'Navigation', tab: 'settings', icon: <Settings size={15} /> },
  ];

  const quickActions = [
    {
      title: 'Mark Attendance for Member',
      category: 'Actions',
      icon: <PlusCircle size={15} />,
      action: () => openMarkModal(),
    },
    {
      title: 'Export Attendance Data (CSV)',
      category: 'Actions',
      icon: <Download size={15} />,
      action: () => exportCSV(),
    },
    {
      title: 'Reset Demo Data to Initial State',
      category: 'Actions',
      icon: <RotateCcw size={15} />,
      action: () => resetToMockData(),
    },
  ];

  const matchedPeople = people
    .filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.employeeId.toLowerCase().includes(query.toLowerCase()) ||
        p.department.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);

  const matchedNav = navigationItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const matchedActions = quickActions.filter((action) =>
    action.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectPerson = (personId: string) => {
    setCommandPaletteOpen(false);
    openMarkModal(personId);
  };

  const handleSelectNav = (tab: NavigationTab) => {
    setCommandPaletteOpen(false);
    setActiveTab(tab);
  };

  const handleSelectAction = (fn: () => void) => {
    setCommandPaletteOpen(false);
    fn();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Palette Container */}
      <div
        className="relative w-full max-w-xl bg-white rounded-xl border border-zinc-200 shadow-2xl overflow-hidden z-10 transition-all animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-zinc-100">
          <Search size={18} className="text-zinc-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page, or search member..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-3.5 text-sm bg-transparent border-0 outline-none placeholder:text-zinc-400 text-zinc-950"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setCommandPaletteOpen(false);
            }}
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-zinc-100">
          {/* Quick Actions */}
          {matchedActions.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Quick Actions
              </div>
              {matchedActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectAction(action.action)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-md bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200">
                      {action.icon}
                    </span>
                    <span>{action.title}</span>
                  </div>
                  <ArrowRight size={13} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          )}

          {/* Members */}
          {matchedPeople.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Members & Students
              </div>
              {matchedPeople.map((person) => (
                <button
                  key={person.id}
                  onClick={() => handleSelectPerson(person.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-zinc-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                      {person.initials}
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-950">{person.name}</span>
                      <span className="text-zinc-400 ml-2 text-[11px]">
                        {person.employeeId} • {person.department}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">Mark Attendance</span>
                </button>
              ))}
            </div>
          )}

          {/* Pages */}
          {matchedNav.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Pages & Navigation
              </div>
              {matchedNav.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectNav(item.tab)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-md bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200">
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Jump</span>
                </button>
              ))}
            </div>
          )}

          {matchedActions.length === 0 && matchedPeople.length === 0 && matchedNav.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-400">
              No matching commands or members found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded border border-zinc-300 bg-white text-zinc-600 font-mono text-[10px]">
                Esc
              </kbd>{' '}
              to close
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded border border-zinc-300 bg-white text-zinc-600 font-mono text-[10px]">
                Enter
              </kbd>{' '}
              to select
            </span>
          </div>
          <span className="font-mono text-zinc-500">Attendly Quick Actions</span>
        </div>
      </div>
    </div>
  );
};
