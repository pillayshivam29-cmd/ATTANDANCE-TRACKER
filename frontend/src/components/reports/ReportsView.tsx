import React, { useState, useMemo } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Download,
  Calendar,
  Award,
  Clock,
  TrendingUp,
  Percent,
  Search,
  ArrowUpDown,
  Building,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { attendanceRecords, people, exportCSV } = useAttendance();

  // Date range filter
  const [dateRange, setDateRange] = useState<'7d' | '14d' | 'month' | 'all'>('month');
  const [searchMember, setSearchMember] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter records based on selected date range
  const filteredRecords = useMemo(() => {
    const dates = Array.from(new Set(attendanceRecords.map((r) => r.date))).sort();
    if (dateRange === '7d') {
      const allowed = dates.slice(-7);
      return attendanceRecords.filter((r) => allowed.includes(r.date));
    }
    if (dateRange === '14d') {
      const allowed = dates.slice(-14);
      return attendanceRecords.filter((r) => allowed.includes(r.date));
    }
    if (dateRange === 'month') {
      // October 2026
      return attendanceRecords.filter((r) => r.date.startsWith('2026-10'));
    }
    return attendanceRecords;
  }, [attendanceRecords, dateRange]);

  // Aggregate daily stats for charts
  const chartData = useMemo(() => {
    const uniqueDates = Array.from(new Set(filteredRecords.map((r) => r.date))).sort();
    return uniqueDates.map((dateStr) => {
      const recs = filteredRecords.filter((r) => r.date === dateStr);
      const present = recs.filter((r) => r.status === 'present').length;
      const late = recs.filter((r) => r.status === 'late').length;
      const absent = recs.filter((r) => r.status === 'absent').length;
      const halfDay = recs.filter((r) => r.status === 'half-day').length;

      const dateObj = new Date(dateStr + 'T00:00:00');
      const label = new Intl.DateTimeFormat('en-US', {
        month: 'numeric',
        day: 'numeric',
      }).format(dateObj);

      const total = recs.length || 1;
      const rate = Number((((present + late * 0.85 + halfDay * 0.5) / total) * 100).toFixed(1));

      return {
        date: label,
        fullDate: dateStr,
        Present: present,
        Late: late,
        Absent: absent,
        'Half Day': halfDay,
        Rate: rate,
      };
    });
  }, [filteredRecords]);

  // High level overview metrics
  const totalEvents = filteredRecords.length;
  const totalPresent = filteredRecords.filter((r) => r.status === 'present').length;
  const totalLate = filteredRecords.filter((r) => r.status === 'late').length;
  const totalAbsent = filteredRecords.filter((r) => r.status === 'absent').length;
  const totalHalfDay = filteredRecords.filter((r) => r.status === 'half-day').length;

  const overallRate =
    totalEvents > 0
      ? (((totalPresent + totalLate * 0.85 + totalHalfDay * 0.5) / totalEvents) * 100).toFixed(1)
      : '0.0';

  const onTimeArrivalRate =
    totalPresent + totalLate > 0
      ? ((totalPresent / (totalPresent + totalLate)) * 100).toFixed(1)
      : '0.0';

  // Individual attendance summary
  const individualSummaries = useMemo(() => {
    return people.map((person) => {
      const recs = filteredRecords.filter((r) => r.personId === person.id);
      const pCount = recs.filter((r) => r.status === 'present').length;
      const lCount = recs.filter((r) => r.status === 'late').length;
      const aCount = recs.filter((r) => r.status === 'absent').length;
      const hCount = recs.filter((r) => r.status === 'half-day').length;
      const totalTracked = recs.length;

      let score = 0;
      if (totalTracked > 0) {
        score = Number(
          (((pCount + lCount * 0.85 + hCount * 0.5) / totalTracked) * 100).toFixed(1)
        );
      } else {
        score = person.attendancePercentage;
      }

      return {
        ...person,
        totalTracked,
        presentCount: pCount,
        lateCount: lCount,
        absentCount: aCount,
        halfDayCount: hCount,
        periodRate: score,
      };
    });
  }, [people, filteredRecords]);

  // Filter and sort individuals
  const displayedIndividuals = useMemo(() => {
    return individualSummaries
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchMember.toLowerCase()) ||
          p.employeeId.toLowerCase().includes(searchMember.toLowerCase()) ||
          p.department.toLowerCase().includes(searchMember.toLowerCase())
      )
      .sort((a, b) =>
        sortOrder === 'desc'
          ? b.periodRate - a.periodRate
          : a.periodRate - b.periodRate
      );
  }, [individualSummaries, searchMember, sortOrder]);

  // Department rankings
  const departmentBreakdown = useMemo(() => {
    const deptMap: Record<string, { totalScore: number; count: number; members: number }> = {};
    individualSummaries.forEach((ind) => {
      if (!deptMap[ind.department]) {
        deptMap[ind.department] = { totalScore: 0, count: 0, members: 0 };
      }
      deptMap[ind.department].totalScore += ind.periodRate;
      deptMap[ind.department].members += 1;
    });

    return Object.entries(deptMap)
      .map(([dept, data]) => ({
        dept,
        members: data.members,
        avgRate: (data.totalScore / (data.members || 1)).toFixed(1),
      }))
      .sort((a, b) => Number(b.avgRate) - Number(a.avgRate));
  }, [individualSummaries]);

  const handleExportFullReport = () => {
    exportCSV(filteredRecords, `attendly_report_${dateRange}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-950">
            Attendance Analytics & Reports
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Statistical metrics, trend evaluation, and departmental compliance
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Range pills */}
          <div className="flex items-center border border-zinc-200 rounded-lg bg-white p-0.5 shadow-2xs text-xs">
            {(
              [
                { id: '7d', label: 'Last 7 Days' },
                { id: '14d', label: 'Last 14 Days' },
                { id: 'month', label: 'This Month' },
                { id: 'all', label: 'All History' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDateRange(opt.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  dateRange === opt.id
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportFullReport}
          >
            Export Report (CSV)
          </Button>
        </div>
      </div>

      {/* 4 Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-zinc-200/90">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
            Overall Attendance Rate
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-zinc-950">
              {overallRate}%
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-2 pt-2 border-t border-zinc-100">
            Calculated across {totalEvents} attendance checkpoints
          </p>
        </Card>

        <Card className="p-4 border-zinc-200/90">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
            On-Time Arrival Index
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-zinc-950">
              {onTimeArrivalRate}%
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-2 pt-2 border-t border-zinc-100">
            {totalLate} late check-ins logged within period
          </p>
        </Card>

        <Card className="p-4 border-zinc-200/90">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
            Total Absent Events
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-zinc-950">
              {totalAbsent}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-2 pt-2 border-t border-zinc-100">
            {totalHalfDay} half-day scheduled exceptions
          </p>
        </Card>

        <Card className="p-4 border-zinc-200/90">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
            Top Performing Dept
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-zinc-950 truncate">
              {departmentBreakdown[0]?.dept || 'All'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-2 pt-2 border-t border-zinc-100 font-mono">
            {departmentBreakdown[0]?.avgRate}% average rate
          </p>
        </Card>
      </div>

      {/* Visualizations: Monthly Attendance Chart & Present vs Absent comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Distribution Chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-950">
                Attendance Volume by Status
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Stacked breakdown of Present, Late, and Absent per day
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
              Monochrome
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                />
                <Tooltip />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(val) => <span className="text-zinc-600">{val}</span>}
                />
                <Bar dataKey="Present" fill="#18181b" stackId="b" />
                <Bar dataKey="Late" fill="#71717a" stackId="b" />
                <Bar dataKey="Absent" fill="#e4e4e7" stackId="b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Rate Velocity Trend */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-950">
                Attendance Percentage Trajectory
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Percentage compliance curve over selected timeframe
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
              {overallRate}% Target
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#e4e4e7' }}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                />
                <YAxis
                  domain={[60, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  unit="%"
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="Rate"
                  stroke="#18181b"
                  strokeWidth={2}
                  fill="#f4f4f5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Department Compliance Breakdown Table */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-zinc-950 mb-1">
          Departmental Compliance Rankings
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Comparative attendance percentages across functional units
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {departmentBreakdown.map((d, idx) => (
            <div
              key={d.dept}
              className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-800 font-mono text-[10px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900">{d.dept}</h4>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {d.members} members
                  </span>
                </div>
              </div>
              <span className="text-sm font-mono font-bold text-zinc-950">
                {d.avgRate}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Individual Attendance Summaries Table */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950">
              Individual Attendance Summaries
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Member-by-member tracking metrics for current reporting period
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Filter members..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950"
              />
            </div>

            {/* Sort toggle */}
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowUpDown size={13} />}
              onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
            >
              {sortOrder === 'desc' ? 'Highest Rate' : 'Lowest Rate'}
            </Button>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Tracked Days</th>
                <th className="py-3 px-4 text-center">Present</th>
                <th className="py-3 px-4 text-center">Late</th>
                <th className="py-3 px-4 text-center">Absent</th>
                <th className="py-3 px-4 text-right">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800">
              {displayedIndividuals.map((ind) => (
                <tr key={ind.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-zinc-950 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                        {ind.initials}
                      </div>
                      <span className="font-semibold text-zinc-950">{ind.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500">{ind.employeeId}</td>
                  <td className="py-3 px-4 text-zinc-600">{ind.department}</td>
                  <td className="py-3 px-4 text-center font-mono">{ind.totalTracked}</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-950">
                    {ind.presentCount}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-zinc-600">
                    {ind.lateCount}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-zinc-400">
                    {ind.absentCount}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="bg-zinc-950 h-full rounded-full"
                          style={{ width: `${ind.periodRate}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-zinc-950">
                        {ind.periodRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {displayedIndividuals.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-zinc-400">
                    No members matching search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
