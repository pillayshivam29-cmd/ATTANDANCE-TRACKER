import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
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
} from 'lucide-react';

export const AttendanceCalendarView: React.FC = () => {
  const {
    attendanceRecords,
    people,
    currentDate,
    setCurrentDate,
    openMarkModal,
  } = useAttendance();

  // Active month/year view (default to Oct 2026)
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = currentDate.split('-').map(Number);
    return { year: y || 2026, month: (m ? m - 1 : 9) };
  });

  const [selectedDayString, setSelectedDayString] = useState<string>(currentDate);

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
    const [y, m] = currentDate.split('-').map(Number);
    setViewDate({ year: y, month: m - 1 });
    setSelectedDayString(currentDate);
  };

  const firstDayOfWeek = new Date(viewDate.year, viewDate.month, 1).getDay();
  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();

  // Calculate day stats
  const getDayStats = (dayNum: number) => {
    const formattedDay = dayNum.toString().padStart(2, '0');
    const formattedMonth = (viewDate.month + 1).toString().padStart(2, '0');
    const dateStr = `${viewDate.year}-${formattedMonth}-${formattedDay}`;

    const records = attendanceRecords.filter((r) => r.date === dateStr);
    const present = records.filter((r) => r.status === 'present').length;
    const late = records.filter((r) => r.status === 'late').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const halfDay = records.filter((r) => r.status === 'half-day').length;

    const totalTracked = records.length;
    let rate = 0;
    if (totalTracked > 0) {
      rate = Math.round(((present + late * 0.85 + halfDay * 0.5) / totalTracked) * 100);
    }

    return {
      dateStr,
      records,
      present,
      late,
      absent,
      halfDay,
      totalTracked,
      rate,
    };
  };

  // Selected date statistics
  const selectedStats = (() => {
    const records = attendanceRecords.filter((r) => r.date === selectedDayString);
    const present = records.filter((r) => r.status === 'present').length;
    const late = records.filter((r) => r.status === 'late').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const halfDay = records.filter((r) => r.status === 'half-day').length;
    const total = records.length;
    const rate = total > 0 ? (((present + late * 0.85 + halfDay * 0.5) / total) * 100).toFixed(1) : '0';

    return {
      records,
      present,
      late,
      absent,
      halfDay,
      total,
      rate,
    };
  })();

  const formattedSelectedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(selectedDayString + 'T00:00:00'));

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-950">
            Attendance Calendar
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Monthly attendance status heatmaps, date selection, and daily summaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
          <div className="flex items-center border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-semibold font-mono text-zinc-900 border-x border-zinc-200">
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
                  className="min-h-20 sm:min-h-24 p-2 rounded-lg bg-zinc-50/50 border border-transparent"
                />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const stats = getDayStats(day);
                const isSelected = stats.dateStr === selectedDayString;
                const isToday = stats.dateStr === currentDate;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDayString(stats.dateStr)}
                    className={`min-h-20 sm:min-h-24 p-2 rounded-xl text-left border flex flex-col justify-between transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-50 ring-2 ring-zinc-950 ring-offset-1 shadow-sm'
                        : isToday
                        ? 'border-zinc-400 bg-white shadow-2xs hover:border-zinc-900'
                        : 'border-zinc-200/80 bg-white hover:border-zinc-400 hover:bg-zinc-50/50'
                    }`}
                  >
                    {/* Top Row: Date Number and Rate */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-mono font-bold w-6 h-6 rounded-md flex items-center justify-center ${
                          isToday
                            ? 'bg-zinc-950 text-white'
                            : isSelected
                            ? 'bg-zinc-200 text-zinc-900'
                            : 'text-zinc-700'
                        }`}
                      >
                        {day}
                      </span>

                      {stats.totalTracked > 0 && (
                        <span className="text-[10px] font-mono font-semibold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 hidden sm:inline-block">
                          {stats.rate}%
                        </span>
                      )}
                    </div>

                    {/* Indicators in Grayscale */}
                    {stats.totalTracked > 0 ? (
                      <div className="mt-1 space-y-1 w-full">
                        {/* Micro visual bar */}
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden flex">
                          <div
                            style={{
                              width: `${(stats.present / stats.totalTracked) * 100}%`,
                            }}
                            className="bg-zinc-950 h-full"
                          />
                          <div
                            style={{
                              width: `${(stats.late / stats.totalTracked) * 100}%`,
                            }}
                            className="bg-zinc-600 h-full"
                          />
                          <div
                            style={{
                              width: `${(stats.halfDay / stats.totalTracked) * 100}%`,
                            }}
                            className="bg-zinc-400 h-full"
                          />
                          <div
                            style={{
                              width: `${(stats.absent / stats.totalTracked) * 100}%`,
                            }}
                            className="bg-zinc-200 h-full"
                          />
                        </div>

                        {/* Status dots */}
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                          {stats.present > 0 && (
                            <span className="flex items-center gap-0.5 text-zinc-900 font-bold">
                              {stats.present}P
                            </span>
                          )}
                          {stats.late > 0 && (
                            <span className="flex items-center gap-0.5 text-zinc-600">
                              {stats.late}L
                            </span>
                          )}
                          {stats.absent > 0 && (
                            <span className="flex items-center gap-0.5 text-zinc-400">
                              {stats.absent}A
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-300 font-mono">No data</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Grayscale Status Legend */}
          <Card className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4 text-xs">
              <span className="font-semibold text-zinc-950 flex items-center gap-1.5">
                <Info size={14} className="text-zinc-600" /> Attendance Indicators:
              </span>
              <div className="flex items-center gap-4 flex-wrap text-zinc-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 inline-block" />
                  <span className="font-medium text-zinc-900">Present (Black)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 inline-block" />
                  <span>Late (Dark Gray)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 inline-block" />
                  <span>Half Day (Gray)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 border border-zinc-300 inline-block" />
                  <span>Absent (Light Gray)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Selected Date Summary Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <div className="border-b border-zinc-100 pb-3">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                Selected Day Summary
              </span>
              <h3 className="text-base font-bold text-zinc-950 mt-1">
                {formattedSelectedDate}
              </h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                {selectedDayString} • {selectedStats.total} total members tracked
              </p>
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <UserCheck size={12} className="text-zinc-700" /> Present
                </span>
                <span className="text-xl font-bold font-mono text-zinc-950 block mt-1">
                  {selectedStats.present}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <UserX size={12} className="text-zinc-700" /> Absent
                </span>
                <span className="text-xl font-bold font-mono text-zinc-950 block mt-1">
                  {selectedStats.absent}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <Clock size={12} className="text-zinc-700" /> Late
                </span>
                <span className="text-xl font-bold font-mono text-zinc-950 block mt-1">
                  {selectedStats.late}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="text-[11px] text-zinc-500">Rate</span>
                <span className="text-xl font-bold font-mono text-zinc-950 block mt-1">
                  {selectedStats.rate}%
                </span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                icon={<Plus size={14} />}
                onClick={() => openMarkModal()}
              >
                Log Entry For This Date
              </Button>
            </div>
          </Card>

          {/* Members on this day */}
          <Card className="p-4">
            <h4 className="text-xs font-semibold text-zinc-950 uppercase tracking-wider mb-2 font-mono">
              Day Roster ({selectedStats.records.length})
            </h4>

            <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto">
              {selectedStats.records.map((rec) => (
                <div
                  key={rec.id}
                  className="py-2 flex items-center justify-between text-xs hover:bg-zinc-50/70 px-1.5 rounded transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-zinc-900 truncate">{rec.personName}</p>
                    <p className="text-[10px] text-zinc-400 font-mono truncate">
                      {rec.department} • {rec.checkIn}
                    </p>
                  </div>
                  <Badge status={rec.status} size="sm" />
                </div>
              ))}

              {selectedStats.records.length === 0 && (
                <div className="py-6 text-center text-xs text-zinc-400">
                  No attendance records logged for {selectedDayString}. Click "Log Entry" to add one!
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
