import React, { useState, useMemo, useEffect } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Info,
  School,
  GraduationCap,
  Sparkles
} from 'lucide-react';

// ==========================================
// REAL-TIME DATE HELPERS
// ==========================================
const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AttendanceCalendarView: React.FC = () => {
  const { currentDate, setCurrentDate, openMarkModal } = useAttendance();

  // Aaj ki live real date (e.g. 2026-10-22)
  const todayDateStr = useMemo(() => getTodayDateStr(), []);

  // Calendar View month & year (defaults to today's real month & year)
  const [viewDate, setViewDate] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  // Selected date (defaults to today's live date)
  const [selectedDayString, setSelectedDayString] = useState<string>(todayDateStr);

  // Roster tab filter: 'all' | 'teachers' | 'students'
  const [rosterTab, setRosterTab] = useState<'all' | 'teachers' | 'students'>('all');

  // Load Real-time Teachers data from localStorage
  const [teachers, setTeachers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_teachers_att_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load Real-time Students data from localStorage
  const [students, setStudents] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_students_att_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state whenever window focuses or storage changes
  useEffect(() => {
    const syncData = () => {
      try {
        const savedT = localStorage.getItem('attendly_teachers_att_v2');
        if (savedT) setTeachers(JSON.parse(savedT));
        const savedS = localStorage.getItem('attendly_students_att_v2');
        if (savedS) setStudents(JSON.parse(savedS));
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('focus', syncData);
    return () => window.removeEventListener('focus', syncData);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleToday = () => {
    const today = new Date();
    setViewDate({ year: today.getFullYear(), month: today.getMonth() });
    setSelectedDayString(todayDateStr);
  };

  const firstDayOfWeek = new Date(viewDate.year, viewDate.month, 1).getDay();
  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();

  // Combine live members for today
  const liveMembers = useMemo(() => {
    const tMembers = teachers.map((t) => ({
      id: t.id,
      name: t.name,
      subTitle: `${t.subject} (${t.assignedClass})`,
      category: 'teacher',
      status: t.status,
      checkIn: t.checkIn,
    }));
    const sMembers = students.map((s) => ({
      id: s.id,
      name: s.name,
      subTitle: `${s.gradeClass} • Parent: ${s.parentName}`,
      category: 'student',
      status: s.status,
      checkIn: s.checkIn,
    }));
    return [...tMembers, ...sMembers];
  }, [teachers, students]);

  // Calculate day stats for any day in calendar
  const getDayStats = (dayNum: number) => {
    const formattedDay = dayNum.toString().padStart(2, '0');
    const formattedMonth = (viewDate.month + 1).toString().padStart(2, '0');
    const dateStr = `${viewDate.year}-${formattedMonth}-${formattedDay}`;

    // Agar ye date aaj (todayDateStr) hai, toh real-time data use karein
    if (dateStr === todayDateStr) {
      const present = liveMembers.filter((m) => m.status === 'present').length;
      const absent = liveMembers.filter((m) => m.status === 'absent').length;
      const late = liveMembers.filter((m) => m.status === 'late').length;
      const total = liveMembers.length;
      const rate = total > 0 ? Math.round(((present + late * 0.8) / total) * 100) : 0;
      return {
        dateStr,
        present,
        absent,
        late,
        total,
        rate,
        hasData: total > 0,
      };
    }

    // Past dates sample simulation
    const daySeed = (dayNum * 13) % 10;
    if (dayNum < new Date().getDate() && viewDate.month === new Date().getMonth() && viewDate.year === new Date().getFullYear()) {
      const total = liveMembers.length || 16;
      const absent = daySeed % 3;
      const late = (daySeed + 1) % 2;
      const present = total - absent - late;
      const rate = Math.round(((present + late * 0.8) / total) * 100);
      return {
        dateStr,
        present,
        absent,
        late,
        total,
        rate,
        hasData: true,
      };
    }

    return {
      dateStr,
      present: 0,
      absent: 0,
      late: 0,
      total: 0,
      rate: 0,
      hasData: false,
    };
  };

  // Selected date statistics
  const selectedStats = useMemo(() => {
    if (selectedDayString === todayDateStr) {
      const present = liveMembers.filter((m) => m.status === 'present').length;
      const absent = liveMembers.filter((m) => m.status === 'absent').length;
      const late = liveMembers.filter((m) => m.status === 'late').length;
      const total = liveMembers.length;
      const rate = total > 0 ? (((present + late * 0.8) / total) * 100).toFixed(1) : '0';
      return {
        present,
        absent,
        late,
        total,
        rate,
        members: liveMembers,
      };
    }

    const dayNum = parseInt(selectedDayString.split('-')[2] || '1', 10);
    const stats = getDayStats(dayNum);
    return {
      present: stats.present,
      absent: stats.absent,
      late: stats.late,
      total: stats.total,
      rate: stats.rate.toString(),
      members: liveMembers,
    };
  }, [selectedDayString, todayDateStr, liveMembers, viewDate]);

  // Filtered Roster by Tab
  const filteredRoster = useMemo(() => {
    if (rosterTab === 'teachers') {
      return selectedStats.members.filter((m) => m.category === 'teacher');
    }
    if (rosterTab === 'students') {
      return selectedStats.members.filter((m) => m.category === 'student');
    }
    return selectedStats.members;
  }, [selectedStats, rosterTab]);

  const formattedSelectedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(selectedDayString + 'T00:00:00'));
    } catch {
      return selectedDayString;
    }
  }, [selectedDayString]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-950">
              Monthly Attendance Calendar
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-mono border border-emerald-200 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Synchronized with today’s live date ({formattedSelectedDate}) and daily roll call.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleToday} className="flex items-center gap-1">
            <CalendarIcon size={13} />
            <span>Go to Today</span>
          </Button>

          <div className="flex items-center border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3.5 text-xs font-bold font-mono text-zinc-900 border-x border-zinc-200">
              {monthNames[viewDate.month]} {viewDate.year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Selected Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Container */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="p-4 sm:p-5">
            {/* Day Header row */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Padding cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div
                  key={`pad-${i}`}
                  className="min-h-20 sm:min-h-24 p-2 rounded-xl bg-zinc-50/40 border border-transparent"
                />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const stats = getDayStats(day);
                const isSelected = stats.dateStr === selectedDayString;
                const isToday = stats.dateStr === todayDateStr;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDayString(stats.dateStr)}
                    className={`min-h-20 sm:min-h-24 p-2.5 rounded-xl text-left border flex flex-col justify-between transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-50/80 ring-2 ring-zinc-950 ring-offset-1 shadow-sm'
                        : isToday
                        ? 'border-zinc-900 bg-white shadow-2xs hover:border-zinc-950'
                        : 'border-zinc-200/80 bg-white hover:border-zinc-400 hover:bg-zinc-50/50'
                    }`}
                  >
                    {/* Top Row: Date Number and Live/Rate */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-mono font-bold w-6 h-6 rounded-md flex items-center justify-center ${
                          isToday
                            ? 'bg-zinc-950 text-white shadow-xs'
                            : isSelected
                            ? 'bg-zinc-200 text-zinc-900'
                            : 'text-zinc-700'
                        }`}
                      >
                        {day}
                      </span>

                      {isToday && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                          TODAY
                        </span>
                      )}

                      {!isToday && stats.hasData && (
                        <span className="text-[10px] font-mono font-semibold text-zinc-600 bg-zinc-100 px-1 py-0.2 rounded hidden sm:inline-block">
                          {stats.rate}%
                        </span>
                      )}
                    </div>

                    {/* Status Breakdown Bar */}
                    {stats.hasData ? (
                      <div className="mt-1 space-y-1 w-full">
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%` }}
                            className="bg-zinc-950 h-full"
                          />
                          <div
                            style={{ width: `${stats.total > 0 ? (stats.late / stats.total) * 100 : 0}%` }}
                            className="bg-zinc-500 h-full"
                          />
                          <div
                            style={{ width: `${stats.total > 0 ? (stats.absent / stats.total) * 100 : 0}%` }}
                            className="bg-zinc-300 h-full"
                          />
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
                          <span className="text-zinc-950 font-bold">{stats.present}P</span>
                          <span>•</span>
                          <span className="text-zinc-400">{stats.absent}A</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-300 font-mono">--</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Indicators Legend */}
          <Card className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4 text-xs">
              <span className="font-semibold text-zinc-950 flex items-center gap-1.5">
                <Info size={14} className="text-zinc-600" /> Attendance Indicators:
              </span>
              <div className="flex items-center gap-4 flex-wrap text-zinc-600 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 inline-block" />
                  <span className="font-semibold text-zinc-900">Present (Black)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-500 inline-block" />
                  <span>Late (Gray)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 border border-zinc-400 inline-block" />
                  <span>Absent (Light)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Selected Date Summary Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <div className="border-b border-zinc-100 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  {selectedDayString === todayDateStr ? 'LIVE TODAY SUMMARY' : 'SELECTED DATE SUMMARY'}
                </span>
                {selectedDayString === todayDateStr && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    Live Real-Time
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-zinc-950 mt-1">
                {formattedSelectedDate}
              </h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                {selectedDayString} • {selectedStats.total} members synchronized
              </p>
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/90">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-medium">
                  <UserCheck size={12} className="text-emerald-600" /> Present
                </span>
                <span className="text-xl font-bold font-mono text-zinc-950 block mt-1">
                  {selectedStats.present}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/90">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-medium">
                  <UserX size={12} className="text-rose-600" /> Absent
                </span>
                <span className="text-xl font-bold font-mono text-zinc-950 block mt-1">
                  {selectedStats.absent}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/90">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-medium">
                  <Clock size={12} className="text-amber-600" /> Late
                </span>
                <span className="text-xl font-bold font-mono text-zinc-950 block mt-1">
                  {selectedStats.late}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/90">
                <span className="text-[11px] text-zinc-500 font-medium">Rate</span>
                <span className="text-xl font-bold font-mono text-zinc-950 block mt-1">
                  {selectedStats.rate}%
                </span>
              </div>
            </div>
          </Card>

          {/* Members on this day with Tab Filter */}
          <Card className="p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
              <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono">
                Day Roll Call ({filteredRoster.length})
              </h4>

              {/* Roster Tab Switcher */}
              <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setRosterTab('all')}
                  className={`px-2 py-0.5 rounded ${rosterTab === 'all' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setRosterTab('teachers')}
                  className={`px-2 py-0.5 rounded ${rosterTab === 'teachers' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'}`}
                >
                  Teachers
                </button>
                <button
                  type="button"
                  onClick={() => setRosterTab('students')}
                  className={`px-2 py-0.5 rounded ${rosterTab === 'students' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'}`}
                >
                  Students
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredRoster.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-4">No records found for this category.</p>
              ) : (
                filteredRoster.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl border border-zinc-100 hover:border-zinc-300 bg-white flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-950">{m.name}</span>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${m.category === 'teacher' ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-white'}`}>
                          {m.category === 'teacher' ? 'Faculty' : 'Student'}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{m.subTitle}</div>
                    </div>

                    <div className="text-right">
                      {m.status === 'present' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                          Present
                        </span>
                      )}
                      {m.status === 'absent' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-semibold border border-rose-200">
                          Absent
                        </span>
                      )}
                      {m.status === 'late' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                          Late
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
