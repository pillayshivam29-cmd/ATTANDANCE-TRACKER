import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  User,
  Building,
  Clock,
  Sliders,
  Palette,
  RotateCcw,
  Save,
  Check,
  Shield,
  Bell,
  Download,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToMockData, people, attendanceRecords } = useAttendance();

  // Form states initialized from settings
  const [adminName, setAdminName] = useState(settings.adminName);
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail);
  const [orgName, setOrgName] = useState(settings.orgName);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [defaultCheckIn, setDefaultCheckIn] = useState(settings.defaultCheckIn);
  const [defaultCheckOut, setDefaultCheckOut] = useState(settings.defaultCheckOut);
  const [gracePeriodMins, setGracePeriodMins] = useState(settings.gracePeriodMins);
  const [lateThresholdMins, setLateThresholdMins] = useState(settings.lateThresholdMins);
  const [halfDayMinHours, setHalfDayMinHours] = useState(settings.halfDayMinHours);
  const [theme, setTheme] = useState(settings.theme);
  const [workingDays, setWorkingDays] = useState<string[]>(settings.workingDays);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      adminName,
      adminEmail,
      orgName,
      timezone,
      defaultCheckIn,
      defaultCheckOut,
      gracePeriodMins: Number(gracePeriodMins),
      lateThresholdMins: Number(lateThresholdMins),
      halfDayMinHours: Number(halfDayMinHours),
      theme,
      workingDays,
    });
  };

  const toggleWorkingDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleExportJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      settings,
      people,
      attendanceRecords,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendly_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const themeOptions: { id: typeof theme; title: string; desc: string; preview: string }[] = [
    {
      id: 'monochrome-light',
      title: 'Monochrome SaaS (Default)',
      desc: 'Crisp white canvas with deep black accents, inspired by Linear and Notion.',
      preview: 'bg-white border-zinc-200 text-zinc-950',
    },
    {
      id: 'monochrome-minimal',
      title: 'Zinc Subtle Contrast',
      desc: 'Muted slate & zinc undertones with soft tactile borders.',
      preview: 'bg-zinc-50 border-zinc-300 text-zinc-900',
    },
    {
      id: 'monochrome-dark',
      title: 'OLED Pure Monochrome',
      desc: 'High contrast monochrome styling optimized for productivity.',
      preview: 'bg-zinc-950 border-zinc-800 text-white',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-950">
            System Settings
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Configure organization policies, attendance thresholds, and interface preferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw size={13} />}
            onClick={() => setIsResetConfirmOpen(true)}
          >
            Reset Sample Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Save size={13} />}
            onClick={handleSaveSettings}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile & Identity */}
        <Card className="p-5">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
            <User size={16} className="text-zinc-700" />
            <h3 className="text-sm font-semibold text-zinc-950">Administrator Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Admin Full Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>
        </Card>

        {/* Organization / Institution */}
        <Card className="p-5">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
            <Building size={16} className="text-zinc-700" />
            <h3 className="text-sm font-semibold text-zinc-950">
              Organization & Institution Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Organization / Academy Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Primary Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950 cursor-pointer"
              >
                <option value="America/New_York (UTC-4)">America/New_York (UTC-4)</option>
                <option value="America/Los_Angeles (UTC-7)">America/Los_Angeles (UTC-7)</option>
                <option value="Europe/London (UTC+1)">Europe/London (UTC+1)</option>
                <option value="Europe/Berlin (UTC+2)">Europe/Berlin (UTC+2)</option>
                <option value="Asia/Tokyo (UTC+9)">Asia/Tokyo (UTC+9)</option>
                <option value="Asia/Kolkata (UTC+5:30)">Asia/Kolkata (UTC+5:30)</option>
              </select>
            </div>
          </div>

          {/* Working Days */}
          <div className="mt-4 pt-3 border-t border-zinc-100">
            <label className="block text-xs font-semibold text-zinc-800 mb-2">
              Configured Working Days
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = workingDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleWorkingDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xs'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Default Attendance Rules & Thresholds */}
        <Card className="p-5">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
            <Clock size={16} className="text-zinc-700" />
            <h3 className="text-sm font-semibold text-zinc-950">
              Attendance Rules & Threshold Engine
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Default Check-in */}
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Standard Check-in Time
              </label>
              <input
                type="time"
                value={defaultCheckIn}
                onChange={(e) => setDefaultCheckIn(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">Expected arrival time</span>
            </div>

            {/* Default Check-out */}
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Standard Check-out Time
              </label>
              <input
                type="time"
                value={defaultCheckOut}
                onChange={(e) => setDefaultCheckOut(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">Scheduled shift end</span>
            </div>

            {/* Grace Period */}
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Grace Period Window
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={gracePeriodMins}
                  onChange={(e) => setGracePeriodMins(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs">
                  mins
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Permitted delay without late flag
              </span>
            </div>

            {/* Late Arrival Threshold */}
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Late Arrival Threshold
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={lateThresholdMins}
                  onChange={(e) => setLateThresholdMins(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs">
                  mins
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Automatic late status trigger
              </span>
            </div>

            {/* Half Day Minimum Hours */}
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Half Day Minimum Hours
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={8}
                  step={0.5}
                  value={halfDayMinHours}
                  onChange={(e) => setHalfDayMinHours(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs">
                  hours
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Required presence for half-day credit
              </span>
            </div>
          </div>
        </Card>

        {/* Theme Preferences */}
        <Card className="p-5">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
            <Palette size={16} className="text-zinc-700" />
            <h3 className="text-sm font-semibold text-zinc-950">
              Theme & Aesthetic Preferences
            </h3>
          </div>

          <div className="space-y-3">
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`w-full p-4 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-zinc-950 bg-zinc-50/70 ring-2 ring-zinc-950 ring-offset-1 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-950">{opt.title}</span>
                      {opt.id === 'monochrome-light' && (
                        <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded border border-zinc-200">
                          Active Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{opt.desc}</p>
                  </div>

                  <div className="p-1 rounded-full border border-zinc-300">
                    <div
                      className={`w-3.5 h-3.5 rounded-full ${
                        isSelected ? 'bg-zinc-950' : 'bg-transparent'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Data Management & Backups */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-950 mb-1">
            Data Persistence & Maintenance
          </h3>
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
            All records exist within client-side state and browser localStorage. You can export a
            snapshot or restore original factory defaults at any time.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Download size={13} />}
              onClick={handleExportJSON}
            >
              Export System Snapshot (JSON)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<RotateCcw size={13} />}
              onClick={() => setIsResetConfirmOpen(true)}
            >
              Restore Factory Demo Data
            </Button>
          </div>
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" size="md" icon={<Save size={15} />}>
            Save All Preferences
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog for Reset */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetToMockData}
        title="Reset to Factory Sample Data"
        message="This will reset all people directory records, attendance entries, activity logs, and settings back to the initial sample state. Any custom modifications will be discarded."
        confirmLabel="Reset Everything"
        isDestructive
      />
    </div>
  );
};
