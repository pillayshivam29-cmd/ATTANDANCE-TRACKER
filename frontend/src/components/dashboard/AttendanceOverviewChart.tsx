import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useAttendance } from '../../context/AttendanceContext';
import { Card, CardHeader, CardContent } from '../common/Card';

export const AttendanceOverviewChart: React.FC = () => {
  const { attendanceRecords } = useAttendance();

  // Aggregate past 7 unique dates in ascending order
  const uniqueDates = Array.from(new Set(attendanceRecords.map((r) => r.date)))
    .sort()
    .slice(-7);

  const data = uniqueDates.map((dateStr) => {
    const dayRecords = attendanceRecords.filter((r) => r.date === dateStr);
    const present = dayRecords.filter((r) => r.status === 'present').length;
    const late = dayRecords.filter((r) => r.status === 'late').length;
    const absent = dayRecords.filter((r) => r.status === 'absent').length;
    const halfDay = dayRecords.filter((r) => r.status === 'half-day').length;

    // Short format date like "Oct 12"
    const dateObj = new Date(dateStr + 'T00:00:00');
    const label = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(dateObj);

    return {
      date: label,
      fullDate: dateStr,
      Present: present,
      Late: late,
      Absent: absent,
      'Half Day': halfDay,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-zinc-200 rounded-lg shadow-lg text-xs font-mono">
          <p className="font-semibold text-zinc-950 mb-1.5">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-zinc-600">
                  <span
                    className="w-2 h-2 rounded-xs inline-block"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}:
                </span>
                <span className="font-bold text-zinc-950">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <div>
          <h3 className="text-sm font-semibold text-zinc-950">Daily Attendance Breakdown</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Comparative attendance status distribution over the past 7 recorded days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
            Past 7 Days
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={{ stroke: '#e4e4e7' }}
                tick={{ fill: '#71717a', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-zinc-600">{value}</span>}
              />
              <Bar dataKey="Present" fill="#18181b" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="Late" fill="#71717a" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="Half Day" fill="#a1a1aa" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="Absent" fill="#e4e4e7" radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
