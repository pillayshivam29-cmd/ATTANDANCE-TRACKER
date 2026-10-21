import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Phone, Send } from 'lucide-react';

interface ParentPortalProps {
  childId?: string;
  childName?: string;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  childId = 'EMP-1042',
  childName = 'Eleanor Vance',
}) => {
  const { people, attendanceRecords, addToast, currentDate } = useAttendance();

  const child =
    people.find((p) => p.employeeId === childId || p.name.toLowerCase() === childName.toLowerCase()) ||
    people[0];

  const childRecords = attendanceRecords.filter(
    (r) => r.employeeId === child?.employeeId || r.personId === child?.id
  );

  const todayRecord = childRecords.find((r) => r.date === currentDate);
  const attendanceRate = child?.attendancePercentage || 96.2;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 text-white font-mono text-lg flex items-center justify-center font-bold">
            {child ? child.initials : 'EV'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-950">Student: {child?.name || childName}</h2>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Class: {child?.department} • Roll No: {child?.employeeId} • Teacher: Prof. Marcus Chen
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 border-zinc-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase font-mono">Today's Status ({currentDate})</span>
              <h3 className="text-base font-bold text-zinc-950">Live Attendance Status</h3>
            </div>
            <Badge status={todayRecord?.status || 'present'} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-xs">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-zinc-400 block mb-1">Arrival Time</span>
              <span className="font-mono font-bold text-zinc-950 text-sm">{todayRecord?.checkIn || '08:52 AM'}</span>
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-zinc-400 block mb-1">Departure Time</span>
              <span className="font-mono font-bold text-zinc-950 text-sm">{todayRecord?.checkOut || '05:00 PM'}</span>
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-zinc-400 block mb-1">Punctuality</span>
              <span className="font-bold text-zinc-900 text-sm">On-Time Arrival</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-zinc-200">
          <span className="text-xs font-semibold text-zinc-400 uppercase font-mono">Attendance Rate</span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-zinc-950">{attendanceRate}%</div>
          <p className="text-xs text-zinc-500 mt-2">Excellent attendance standing</p>
        </Card>
      </div>
    </div>
  );
};
