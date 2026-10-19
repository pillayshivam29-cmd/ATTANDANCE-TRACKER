import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Card } from '../common/Card';
import { Users, UserCheck, UserX, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatsCards: React.FC = () => {
  const { people, attendanceRecords, currentDate, setActiveTab } = useAttendance();

  const totalPeople = people.length;
  const activePeople = people.filter((p) => p.status === 'active').length;

  const todayRecords = attendanceRecords.filter((r) => r.date === currentDate);
  const presentCount = todayRecords.filter((r) => r.status === 'present').length;
  const absentCount = todayRecords.filter((r) => r.status === 'absent').length;
  const lateCount = todayRecords.filter((r) => r.status === 'late').length;
  const halfDayCount = todayRecords.filter((r) => r.status === 'half-day').length;

  // Calculate effective attendance percentage today
  const effectivePresent = presentCount + lateCount * 0.85 + halfDayCount * 0.5;
  const attendanceRate = totalPeople > 0 ? ((effectivePresent / totalPeople) * 100).toFixed(1) : '0';

  const cards = [
    {
      title: 'Total Students / Staff',
      value: totalPeople,
      label: `${activePeople} active members enrolled`,
      trend: '+2 new this month',
      trendPositive: true,
      icon: <Users size={20} className="text-zinc-900" />,
      onClick: () => setActiveTab('people'),
    },
    {
      title: 'Present Today',
      value: presentCount,
      label: `${lateCount > 0 ? `+${lateCount} arrived late` : 'All on time'}`,
      trend: `${((presentCount / (totalPeople || 1)) * 100).toFixed(0)}% check-in rate`,
      trendPositive: true,
      icon: <UserCheck size={20} className="text-zinc-900" />,
      onClick: () => setActiveTab('attendance'),
    },
    {
      title: 'Absent Today',
      value: absentCount,
      label: `${halfDayCount > 0 ? `+${halfDayCount} half day` : 'No half days'}`,
      trend: 'Within normal threshold',
      trendPositive: false,
      icon: <UserX size={20} className="text-zinc-900" />,
      onClick: () => setActiveTab('attendance'),
    },
    {
      title: 'Attendance Rate',
      value: `${attendanceRate}%`,
      label: 'Calculated for current day',
      trend: '+1.8% vs last week',
      trendPositive: true,
      icon: <Percent size={20} className="text-zinc-900" />,
      onClick: () => setActiveTab('reports'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <Card
          key={idx}
          hoverEffect
          onClick={card.onClick}
          className="p-5 cursor-pointer relative group overflow-hidden border-zinc-200/90"
        >
          {/* Subtle accent bar on hover */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-950 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {card.title}
            </span>
            <div className="p-2 rounded-lg bg-zinc-100 group-hover:bg-zinc-200 transition-colors">
              {card.icon}
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-zinc-950 font-mono">
              {card.value}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500 truncate">{card.label}</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-mono text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded">
              {card.trendPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {card.trend}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};
