import React from 'react';
import { StudentEmployee } from '../../types';
import { useAttendance } from '../../context/AttendanceContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Mail,
  Phone,
  Calendar,
  Building2,
  Clock,
  UserCheck,
  Percent,
  Plus,
} from 'lucide-react';

interface PersonDetailsModalProps {
  person: StudentEmployee | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (person: StudentEmployee) => void;
}

export const PersonDetailsModal: React.FC<PersonDetailsModalProps> = ({
  person,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { attendanceRecords, openMarkModal } = useAttendance();

  if (!person || !isOpen) return null;

  const records = attendanceRecords.filter((r) => r.personId === person.id);
  const presentCount = records.filter((r) => r.status === 'present').length;
  const lateCount = records.filter((r) => r.status === 'late').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const halfDayCount = records.filter((r) => r.status === 'half-day').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Profile & Attendance"
      description={`System Record ID: ${person.id}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Top Header Card */}
        <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white font-mono text-sm flex items-center justify-center font-bold">
              {person.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-950">{person.name}</h3>
                <Badge status={person.status} size="sm" />
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                {person.employeeId} • {person.role} ({person.department})
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-zinc-950 block">
              {person.attendancePercentage}%
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Overall Rate</span>
          </div>
        </div>

        {/* Contact & Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 bg-white border border-zinc-200 rounded-lg">
            <span className="text-zinc-400 flex items-center gap-1.5 mb-1">
              <Mail size={12} /> Email
            </span>
            <span className="text-zinc-800 font-medium truncate block">{person.email}</span>
          </div>

          <div className="p-2.5 bg-white border border-zinc-200 rounded-lg">
            <span className="text-zinc-400 flex items-center gap-1.5 mb-1">
              <Phone size={12} /> Phone
            </span>
            <span className="text-zinc-800 font-medium truncate block">
              {person.phone || 'Not provided'}
            </span>
          </div>

          <div className="p-2.5 bg-white border border-zinc-200 rounded-lg">
            <span className="text-zinc-400 flex items-center gap-1.5 mb-1">
              <Calendar size={12} /> Enrolled
            </span>
            <span className="text-zinc-800 font-mono font-medium block">
              {person.joinDate}
            </span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
            <span className="text-[10px] text-zinc-400 font-mono block">Present</span>
            <span className="text-base font-bold text-zinc-950 font-mono mt-0.5 block">
              {presentCount}
            </span>
          </div>
          <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
            <span className="text-[10px] text-zinc-400 font-mono block">Late</span>
            <span className="text-base font-bold text-zinc-950 font-mono mt-0.5 block">
              {lateCount}
            </span>
          </div>
          <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
            <span className="text-[10px] text-zinc-400 font-mono block">Half Day</span>
            <span className="text-base font-bold text-zinc-950 font-mono mt-0.5 block">
              {halfDayCount}
            </span>
          </div>
          <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
            <span className="text-[10px] text-zinc-400 font-mono block">Absent</span>
            <span className="text-base font-bold text-zinc-950 font-mono mt-0.5 block">
              {absentCount}
            </span>
          </div>
        </div>

        {/* Attendance History Log */}
        <div>
          <h4 className="text-xs font-semibold text-zinc-900 mb-2 font-mono uppercase tracking-wider">
            Recent Attendance History ({records.length})
          </h4>
          <div className="max-h-48 overflow-y-auto divide-y divide-zinc-100 border border-zinc-200 rounded-lg">
            {records.map((r) => (
              <div
                key={r.id}
                className="p-2.5 flex items-center justify-between text-xs hover:bg-zinc-50"
              >
                <div>
                  <span className="font-mono text-zinc-800 font-semibold mr-2">{r.date}</span>
                  <span className="text-zinc-500 font-mono text-[11px]">
                    {r.checkIn} - {r.checkOut}
                  </span>
                  {r.notes && (
                    <p className="text-[11px] text-zinc-400 mt-0.5 italic">{r.notes}</p>
                  )}
                </div>
                <Badge status={r.status} size="sm" />
              </div>
            ))}
            {records.length === 0 && (
              <div className="p-4 text-center text-xs text-zinc-400">
                No attendance logs found for this member.
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={13} />}
            onClick={() => {
              onClose();
              openMarkModal(person.id);
            }}
          >
            Mark For This Member
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(person);
              }}
            >
              Edit Member
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
