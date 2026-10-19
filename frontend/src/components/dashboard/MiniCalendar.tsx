import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Card, CardHeader, CardContent } from '../common/Card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

export const MiniCalendar: React.FC = () => {
  const { attendanceRecords, currentDate, setCurrentDate, setActiveTab } = useAttendance();

  // Reference month is October 2026
  const [activeMonthYear, setActiveMonthYear] = useState({ year: 2026, month: 9 }); // 0-indexed month, 9 = October

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(activeMonthYear.year, activeMonthYear.month, 1).getDay();
  const daysInMonth = new Date(activeMonthYear.year, activeMonthYear.month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setActiveMonthYear((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setActiveMonthYear((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const getDayStatus = (dayNum: number) => {
    const formattedDay = dayNum.toString().padStart(2, '0');
    const formattedMonth = (activeMonthYear.month + 1).toString().padStart(2, '0');
    const dateStr = `${activeMonthYear.year}-${formattedMonth}-${formattedDay}`;

    const recordsForDay = attendanceRecords.filter((r) => r.date === dateStr);
    if (recordsForDay.length === 0) return null;

    const absent = recordsForDay.filter((r) => r.status === 'absent').length;
    const late = recordsForDay.filter((r) => r.status === 'late').length;

    if (absent > 0) return 'has-absent';
    if (late > 0) return 'has-late';
    return 'all-present';
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-zinc-700" />
          <h3 className="text-sm font-semibold text-zinc-950">
            {monthNames[activeMonthYear.month]} {activeMonthYear.year}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-3">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-semibold text-zinc-400 uppercase font-mono">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {paddingArray.map((_, i) => (
            <div key={`pad-${i}`} className="h-7" />
          ))}

          {daysArray.map((day) => {
            const dayStatus = getDayStatus(day);
            const formattedDay = day.toString().padStart(2, '0');
            const formattedMonth = (activeMonthYear.month + 1).toString().padStart(2, '0');
            const dateStr = `${activeMonthYear.year}-${formattedMonth}-${formattedDay}`;
            const isToday = dateStr === currentDate;

            return (
              <button
                key={day}
                onClick={() => {
                  setCurrentDate(dateStr);
                  setActiveTab('calendar');
                }}
                className={`h-7 rounded flex flex-col items-center justify-center text-xs font-mono transition-all cursor-pointer relative ${
                  isToday
                    ? 'bg-zinc-950 text-white font-bold shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
                title={`View attendance for ${dateStr}`}
              >
                <span>{day}</span>
                {dayStatus && !isToday && (
                  <span
                    className={`w-1 h-1 rounded-full absolute bottom-1 ${
                      dayStatus === 'all-present'
                        ? 'bg-zinc-950'
                        : dayStatus === 'has-late'
                        ? 'bg-zinc-500'
                        : 'bg-zinc-300'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend & Full View Link */}
        <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 inline-block" />
              100%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" />
              Late
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 inline-block" />
              Absent
            </span>
          </div>

          <button
            onClick={() => setActiveTab('calendar')}
            className="font-medium text-zinc-900 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Full View</span>
            <ArrowRight size={11} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
