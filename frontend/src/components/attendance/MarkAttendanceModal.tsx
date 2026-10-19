import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AttendanceStatus } from '../../types';
import { Clock, Calendar, Check, User, FileText, ChevronDown } from 'lucide-react';

export const MarkAttendanceModal: React.FC = () => {
  const {
    isMarkModalOpen,
    closeMarkModal,
    markModalPersonId,
    people,
    currentDate,
    attendanceRecords,
    markAttendance,
    settings,
  } = useAttendance();

  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [date, setDate] = useState<string>(currentDate);
  const [checkIn, setCheckIn] = useState<string>('09:00 AM');
  const [checkOut, setCheckOut] = useState<string>('05:00 PM');
  const [notes, setNotes] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // When modal opens or markModalPersonId changes, populate with existing or default data
  useEffect(() => {
    if (isMarkModalOpen) {
      const initialId = markModalPersonId || (people.length > 0 ? people[0].id : '');
      setSelectedPersonId(initialId);
      setDate(currentDate);

      // Check if there is already a record for this person on this date
      const existing = attendanceRecords.find(
        (r) => r.personId === initialId && r.date === currentDate
      );
      if (existing) {
        setStatus(existing.status);
        setCheckIn(existing.checkIn);
        setCheckOut(existing.checkOut);
        setNotes(existing.notes || '');
      } else {
        setStatus('present');
        setCheckIn('09:00 AM');
        setCheckOut('05:00 PM');
        setNotes('');
      }
      setSearchTerm('');
      setIsDropdownOpen(false);
    }
  }, [isMarkModalOpen, markModalPersonId, currentDate, people]);

  // When person or date changes, auto-load if record exists
  const handlePersonChange = (personId: string) => {
    setSelectedPersonId(personId);
    setIsDropdownOpen(false);
    const existing = attendanceRecords.find(
      (r) => r.personId === personId && r.date === date
    );
    if (existing) {
      setStatus(existing.status);
      setCheckIn(existing.checkIn);
      setCheckOut(existing.checkOut);
      setNotes(existing.notes || '');
    } else {
      setStatus('present');
      setCheckIn('09:00 AM');
      setCheckOut('05:00 PM');
      setNotes('');
    }
  };

  const handleStatusChange = (newStatus: AttendanceStatus) => {
    setStatus(newStatus);
    if (newStatus === 'absent') {
      setCheckIn('--');
      setCheckOut('--');
    } else if (checkIn === '--') {
      setCheckIn('09:00 AM');
      setCheckOut(newStatus === 'half-day' ? '01:00 PM' : '05:00 PM');
    } else if (newStatus === 'half-day') {
      setCheckOut('01:00 PM');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const person = people.find((p) => p.id === selectedPersonId);
    if (!person) return;

    markAttendance({
      personId: person.id,
      personName: person.name,
      employeeId: person.employeeId,
      department: person.department,
      date,
      status,
      checkIn: status === 'absent' ? '--' : checkIn,
      checkOut: status === 'absent' ? '--' : checkOut,
      notes,
    });
  };

  const selectedPerson = people.find((p) => p.id === selectedPersonId);

  const filteredPeople = people.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions: { value: AttendanceStatus; label: string; desc: string }[] = [
    { value: 'present', label: 'Present', desc: 'Full shift completed' },
    { value: 'absent', label: 'Absent', desc: 'Not in attendance' },
    { value: 'late', label: 'Late', desc: 'Exceeded grace limit' },
    { value: 'half-day', label: 'Half Day', desc: 'Minimum 4 hrs worked' },
  ];

  return (
    <Modal
      isOpen={isMarkModalOpen}
      onClose={closeMarkModal}
      title="Record Attendance"
      description="Log or modify a daily attendance event for a student or staff member."
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Person Selector */}
        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
            Student / Employee <span className="text-zinc-400">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 text-left transition-colors cursor-pointer text-sm"
            >
              {selectedPerson ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-zinc-950 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                    {selectedPerson.initials}
                  </div>
                  <span className="font-medium text-zinc-900">{selectedPerson.name}</span>
                  <span className="text-xs text-zinc-400">
                    ({selectedPerson.employeeId} • {selectedPerson.department})
                  </span>
                </div>
              ) : (
                <span className="text-zinc-400">Select person...</span>
              )}
              <ChevronDown size={16} className="text-zinc-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95">
                <div className="p-2 border-b border-zinc-100">
                  <input
                    type="text"
                    placeholder="Search by name, ID, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md outline-none focus:border-zinc-400"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-zinc-50">
                  {filteredPeople.map((person) => (
                    <button
                      type="button"
                      key={person.id}
                      onClick={() => handlePersonChange(person.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-zinc-50 transition-colors cursor-pointer text-xs ${
                        person.id === selectedPersonId ? 'bg-zinc-100 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-zinc-900 text-white font-mono text-[9px] flex items-center justify-center">
                          {person.initials}
                        </span>
                        <span className="text-zinc-900">{person.name}</span>
                        <span className="text-zinc-400 font-mono text-[11px]">
                          {person.employeeId}
                        </span>
                      </div>
                      <span className="text-zinc-400 text-[10px]">{person.department}</span>
                    </button>
                  ))}
                  {filteredPeople.length === 0 && (
                    <div className="p-3 text-center text-xs text-zinc-400">No member found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Selection Cards */}
        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
            Attendance Status <span className="text-zinc-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {statusOptions.map((opt) => {
              const isSelected = status === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold">{opt.label}</span>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <span
                    className={`text-[10px] leading-tight block ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-400'
                    }`}
                  >
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date and Times Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5 flex items-center gap-1">
              <Calendar size={13} className="text-zinc-500" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-900"
              required
            />
          </div>

          {/* Check-in Time */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5 flex items-center gap-1">
              <Clock size={13} className="text-zinc-500" />
              Check-in Time
            </label>
            <input
              type="text"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              disabled={status === 'absent'}
              placeholder="09:00 AM"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 bg-white disabled:bg-zinc-100 disabled:text-zinc-400 text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
          </div>

          {/* Check-out Time */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5 flex items-center gap-1">
              <Clock size={13} className="text-zinc-500" />
              Check-out Time
            </label>
            <input
              type="text"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              disabled={status === 'absent'}
              placeholder="05:00 PM"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 bg-white disabled:bg-zinc-100 disabled:text-zinc-400 text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1.5 flex items-center gap-1">
            <FileText size={13} className="text-zinc-500" />
            Optional Notes & Remarks
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add explanation, reason for delay, or approval details..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-900 resize-none placeholder:text-zinc-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <span className="text-[11px] text-zinc-400">
            Updates immediate dashboard stats & directory
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={closeMarkModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Attendance
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
