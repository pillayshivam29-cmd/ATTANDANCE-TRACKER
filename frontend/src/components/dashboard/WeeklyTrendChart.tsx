import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAttendance } from '../../context/AttendanceContext';
import { Card, CardHeader, CardContent } from '../common/Card';
import { TrendingUp } from 'lucide-react';

export const WeeklyTrendChart: React.FC = () => {
  const { attendanceRecords, people } = useAttendance();

  // Aggregate past 7 unique dates in ascending order
  const uniqueDates = Array.from(new Set(attendanceRecords.map((r) => r.date)))
    .sort()
    .slice(-7);

  const totalPeople = people.length || 1;

  const data = uniqueDates.map((dateStr) => {
    const dayRecords = attendanceRecords.filter((r) => r.date === dateStr);
    const present = dayRecords.filter((r) => r.status === 'present').length;
    const late = dayRecords.filter((r) => r.status === 'late').length;
    const halfDay = dayRecords.filter((r) => r.status === 'half-day').length;

    const effective = present + late * 0.85 + halfDay * 0.5;
    const rate = Number(((effective / totalPeople) * 100).toFixed(1));

    const dateObj = new Date(dateStr + 'T00:00:00');
    const label = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj);

    return {
      day: label,
      date: dateStr,
      rate,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 text-white p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-zinc-400 text-[10px]">{label}</p>
          <p className="text-sm font-bold mt-0.5">{payload[0].value}% Attendance</p>
        </div>
      );
    }
    return null;
  };

  // Calculate average of the week
  const avgRate =
    data.length > 0
      ? (data.reduce((acc, curr) => acc + curr.rate, 0) / data.length).toFixed(1)
      : '0.0';

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <div>
          <h3 className="text-sm font-semibold text-zinc-950 flex items-center gap-2">
            Weekly Attendance Velocity
            <TrendingUp size={14} className="text-zinc-700" />
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Composite attendance efficiency rating
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold font-mono text-zinc-950">{avgRate}% avg</span>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-2">
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="monochromeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: '#e4e4e7' }}
                tick={{ fill: '#71717a', fontSize: 11 }}
              />
              <YAxis
                domain={[70, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#18181b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#monochromeArea)"
                dot={{ stroke: '#18181b', strokeWidth: 2, r: 3, fill: '#ffffff' }}
                activeDot={{ stroke: '#000000', strokeWidth: 2, r: 5, fill: '#18181b' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
