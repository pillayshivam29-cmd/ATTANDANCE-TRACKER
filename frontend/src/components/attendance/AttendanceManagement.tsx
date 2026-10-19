import React, { useState, useMemo } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { AttendanceDetailsModal } from './AttendanceDetailsModal';
import {
  Search,
  Filter,
  Download,
  Plus,
  RotateCcw,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building,
} from 'lucide-react';

export const AttendanceManagement: React.FC = () => {
  const {
    attendanceRecords,
    people,
    openMarkModal,
    exportCSV,
    currentDate,
  } = useAttendance();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(''); // empty means all dates or filtered
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal inspection
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Unique departments for filter dropdown
  const departments = useMemo(() => {
    return Array.from(new Set(people.map((p) => p.department))).sort();
  }, [people]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = record.personName.toLowerCase().includes(query);
        const matchesId = record.employeeId.toLowerCase().includes(query);
        const matchesDept = record.department.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesDept) return false;
      }

      // Status
      if (selectedStatus !== 'all' && record.status !== selectedStatus) {
        return false;
      }

      // Department
      if (selectedDept !== 'all' && record.department !== selectedDept) {
        return false;
      }

      // Date
      if (selectedDate && record.date !== selectedDate) {
        return false;
      }

      return true;
    });
  }, [attendanceRecords, searchTerm, selectedStatus, selectedDept, selectedDate]);

  // Pagination calculation
  const totalItems = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedDept('all');
    setSelectedDate('');
    setCurrentPage(1);
  };

  const handleViewDetails = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    openMarkModal(record.personId);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-950">
            Attendance Records
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Manage daily check-ins, verify working hours, and audit logs
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw size={13} />}
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => exportCSV(filteredRecords, 'attendly_filtered.csv')}
          >
            Export CSV ({totalItems})
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => openMarkModal()}
          >
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Search member, ID, class..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Building
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:border-zinc-950 cursor-pointer appearance-none transition-colors"
            >
              <option value="all">All Departments / Classes</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:border-zinc-950 cursor-pointer appearance-none transition-colors"
            >
              <option value="all">All Statuses (Any)</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="relative">
            <Calendar
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:border-zinc-950 transition-colors"
            />
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-zinc-100 text-xs">
          <span className="text-zinc-600 font-medium text-[11px] mr-1">Status:</span>
          {['all', 'present', 'late', 'half-day', 'absent'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedStatus(st);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer capitalize ${
                selectedStatus === st
                  ? 'bg-zinc-950 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {st === 'half-day' ? 'Half Day' : st}
            </button>
          ))}

          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="ml-auto text-[11px] font-mono text-zinc-500 hover:text-zinc-900 underline"
            >
              Clear date ({selectedDate})
            </button>
          )}
        </div>
      </Card>

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Member / Student</th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Department / Class</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-in</th>
                <th className="py-3 px-4">Check-out</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-800">
              {paginatedRecords.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                  onClick={() => handleViewDetails(record)}
                >
                  {/* Name with initials */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-zinc-900 text-white font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                        {record.personName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <span className="font-semibold text-zinc-950 group-hover:underline">
                        {record.personName}
                      </span>
                    </div>
                  </td>

                  {/* ID */}
                  <td className="py-3 px-4 font-mono text-zinc-500">{record.employeeId}</td>

                  {/* Department */}
                  <td className="py-3 px-4 text-zinc-600">{record.department}</td>

                  {/* Date */}
                  <td className="py-3 px-4 font-mono text-zinc-600">{record.date}</td>

                  {/* Check-in */}
                  <td className="py-3 px-4 font-mono text-zinc-800">
                    {record.checkIn === '--' ? (
                      <span className="text-zinc-300">--</span>
                    ) : (
                      record.checkIn
                    )}
                  </td>

                  {/* Check-out */}
                  <td className="py-3 px-4 font-mono text-zinc-800">
                    {record.checkOut === '--' ? (
                      <span className="text-zinc-300">--</span>
                    ) : (
                      record.checkOut
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <Badge status={record.status} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                        title="View Full Entry"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                        title="Edit Entry"
                      >
                        <Edit size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400 text-xs">
                    No attendance records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-zinc-200 rounded px-2 py-1 bg-white text-zinc-800 font-mono text-xs cursor-pointer focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-zinc-400">
              Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="font-mono text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </Card>

      {/* Details & Edit Modal */}
      <AttendanceDetailsModal
        record={selectedRecord}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onEdit={(rec) => openMarkModal(rec.personId)}
      />
    </div>
  );
};
