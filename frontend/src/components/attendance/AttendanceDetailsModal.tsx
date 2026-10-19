import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useAttendance } from '../../context/AttendanceContext';
import { Clock, Calendar, Building2, User, FileText, Trash2, Edit3, Check } from 'lucide-react';

interface AttendanceDetailsModalProps {
  record: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (record: AttendanceRecord) => void;
}

export const AttendanceDetailsModal: React.FC<AttendanceDetailsModalProps> = ({
  record,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { deleteAttendance } = useAttendance();
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  if (!record || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attendance Record Details"
      description={`Entry ID: ${record.id}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Header Profile card */}
        <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200/90 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-950 text-white font-mono text-xs flex items-center justify-center font-bold">
              {record.personName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-950">{record.personName}</h4>
              <p className="text-xs text-zinc-500 font-mono">
                {record.employeeId} • {record.department}
              </p>
            </div>
          </div>
          <Badge status={record.status} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white border border-zinc-200 rounded-lg">
            <span className="text-zinc-400 block mb-1 flex items-center gap-1.5">
              <Calendar size={13} /> Date
            </span>
            <span className="font-semibold text-zinc-900 font-mono">{record.date}</span>
          </div>

          <div className="p-3 bg-white border border-zinc-200 rounded-lg">
            <span className="text-zinc-400 block mb-1 flex items-center gap-1.5">
              <Building2 size={13} /> Department
            </span>
            <span className="font-semibold text-zinc-900">{record.department}</span>
          </div>

          <div className="p-3 bg-white border border-zinc-200 rounded-lg">
            <span className="text-zinc-400 block mb-1 flex items-center gap-1.5">
              <Clock size={13} /> Check-in Time
            </span>
            <span className="font-semibold text-zinc-900 font-mono">{record.checkIn}</span>
          </div>

          <div className="p-3 bg-white border border-zinc-200 rounded-lg">
            <span className="text-zinc-400 block mb-1 flex items-center gap-1.5">
              <Clock size={13} /> Check-out Time
            </span>
            <span className="font-semibold text-zinc-900 font-mono">{record.checkOut}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="p-3 bg-white border border-zinc-200 rounded-lg text-xs">
          <span className="text-zinc-400 block mb-1 flex items-center gap-1.5">
            <FileText size={13} /> Notes & Audit Remarks
          </span>
          <p className="text-zinc-700 leading-relaxed font-normal">
            {record.notes || 'No remarks submitted for this entry.'}
          </p>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          {isConfirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-700 font-medium">Permanently delete?</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  deleteAttendance(record.id);
                  setIsConfirmDelete(false);
                  onClose();
                }}
              >
                Yes, Delete
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmDelete(true)}
              className="text-xs text-zinc-500 hover:text-zinc-950 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Delete entry</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Edit3 size={13} />}
              onClick={() => {
                onClose();
                onEdit(record);
              }}
            >
              Edit Details
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
