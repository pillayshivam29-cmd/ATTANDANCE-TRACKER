import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Send } from 'lucide-react';

interface StudentPortalProps {
  studentId?: string;
  studentName?: string;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  studentId = 'EMP-1042',
  studentName = 'Eleanor Vance',
}) => {
  const { people, attendanceRecords, addToast } = useAttendance();
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const currentStudent =
    people.find((p) => p.employeeId === studentId || p.name.toLowerCase() === studentName.toLowerCase()) ||
    people[0];

  const myRecords = attendanceRecords.filter(
    (r) => r.employeeId === currentStudent?.employeeId || r.personId === currentStudent?.id
  );

  const presentCount = myRecords.filter((r) => r.status === 'present').length;
  const lateCount = myRecords.filter((r) => r.status === 'late').length;
  const absentCount = myRecords.filter((r) => r.status === 'absent').length;
  const attendanceRate = currentStudent?.attendancePercentage || 96.2;

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Leave Request Submitted', `Leave requested for ${leaveDate}. Pending teacher approval.`, 'info');
    setLeaveModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 text-white font-mono text-lg flex items-center justify-center font-bold">
            {currentStudent ? currentStudent.initials : 'EV'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-zinc-950">Welcome, {currentStudent?.name || studentName}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                STUDENT
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Roll No: {currentStudent?.employeeId} • {currentStudent?.department}
            </p>
          </div>
        </div>

        <Button variant="primary" size="sm" icon={<Send size={14} />} onClick={() => setLeaveModalOpen(true)}>
          Request Leave / Submit Excuse
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-zinc-200">
          <span className="text-xs font-semibold text-zinc-500 uppercase font-mono">Attendance Rate</span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-zinc-950">{attendanceRate}%</div>
        </Card>
        <Card className="p-5 border-zinc-200">
          <span className="text-xs font-semibold text-zinc-500 uppercase font-mono">Days Present</span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-zinc-950">{presentCount || 15}</div>
        </Card>
        <Card className="p-5 border-zinc-200">
          <span className="text-xs font-semibold text-zinc-500 uppercase font-mono">Late Arrivals</span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-zinc-950">{lateCount || 1}</div>
        </Card>
        <Card className="p-5 border-zinc-200">
          <span className="text-xs font-semibold text-zinc-500 uppercase font-mono">Absent Days</span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-zinc-950">{absentCount || 0}</div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <h3 className="text-sm font-semibold text-zinc-950">My Attendance Checkpoints</h3>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold text-zinc-600 font-mono">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-in</th>
                <th className="py-3 px-4">Check-out</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {myRecords.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 font-mono font-bold">{r.date}</td>
                  <td className="py-3 px-4 font-mono">{r.checkIn}</td>
                  <td className="py-3 px-4 font-mono">{r.checkOut}</td>
                  <td className="py-3 px-4"><Badge status={r.status} size="sm" /></td>
                  <td className="py-3 px-4 text-zinc-500">{r.notes || 'Recorded on time'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={leaveModalOpen} onClose={() => setLeaveModalOpen(false)} title="Apply for Leave">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Date</label>
            <input
              type="date"
              required
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Reason</label>
            <textarea
              rows={3}
              required
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setLeaveModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
