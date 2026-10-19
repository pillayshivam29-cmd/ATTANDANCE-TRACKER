import React from 'react';
import { StatsCards } from './StatsCards';
import { AttendanceOverviewChart } from './AttendanceOverviewChart';
import { WeeklyTrendChart } from './WeeklyTrendChart';
import { RecentActivityList } from './RecentActivityList';
import { MiniCalendar } from './MiniCalendar';
import { Button } from '../common/Button';
import { useAttendance } from '../../context/AttendanceContext';
import { Plus, Download, Sparkles } from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { openMarkModal, exportCSV, settings } = useAttendance();

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-950">
              Operations Center
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-mono border border-zinc-200">
              Live Monitor
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Real-time daily attendance telemetry for {settings.orgName}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => exportCSV()}
          >
            Export Sheet
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => openMarkModal()}
          >
            Log Entry
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <StatsCards />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceOverviewChart />
        </div>
        <div className="lg:col-span-1">
          <WeeklyTrendChart />
        </div>
      </div>

      {/* Bottom Grid: Recent Activities & Mini Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivityList />
        </div>
        <div className="lg:col-span-1">
          <MiniCalendar />
        </div>
      </div>
    </div>
  );
};
