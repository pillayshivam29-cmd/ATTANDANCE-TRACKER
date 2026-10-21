import React, { useState, useMemo } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { StudentEmployee } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { AddPersonModal } from './AddPersonModal';
import { PersonDetailsModal } from './PersonDetailsModal';
import { BulkUploadModal } from './BulkUploadModal';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Building,
  Calendar,
  Upload,
} from 'lucide-react';

export const PeopleDirectory: React.FC = () => {
  const { people, deletePerson, openMarkModal } = useAttendance();

  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<StudentEmployee | null>(null);
  const [viewingPerson, setViewingPerson] = useState<StudentEmployee | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<StudentEmployee | null>(null);

  // Departments list
  const departments = useMemo(() => {
    return Array.from(new Set(people.map((p) => p.department))).sort();
  }, [people]);

  // Filtered members
  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesId = p.employeeId.toLowerCase().includes(q);
        const matchesEmail = p.email.toLowerCase().includes(q);
        const matchesRole = p.role.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesEmail && !matchesRole) return false;
      }

      if (departmentFilter !== 'all' && p.department !== departmentFilter) {
        return false;
      }

      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [people, searchQuery, departmentFilter, statusFilter]);

  const handleEdit = (person: StudentEmployee) => {
    setEditingPerson(person);
    setIsAddModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingPerson) {
      deletePerson(deletingPerson.id);
      setDeletingPerson(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-950">
              Students & Staff Registry
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-xs font-mono border border-zinc-200">
              {filteredPeople.length} records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Member directory, attendance benchmarks, department alignments, and account states
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Grid/Table Switcher */}
          <div className="flex items-center border border-zinc-200 rounded-lg bg-white p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-950'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-950'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            onClick={() => setIsBulkModalOpen(true)}
          >
            Bulk Upload (CSV)
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => {
              setEditingPerson(null);
              setIsAddModalOpen(true);
            }}
          >
            Add Student / Staff
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Search name, ID, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Building
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:border-zinc-950 cursor-pointer appearance-none"
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
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
              }
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:border-zinc-950 cursor-pointer appearance-none"
            >
              <option value="all">All Statuses (Active & Inactive)</option>
              <option value="active">Active Members Only</option>
              <option value="inactive">Inactive / On Leave</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Directory Content: Table or Grid */}
      {viewMode === 'table' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Department / Class</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Attendance Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-zinc-800">
                {filteredPeople.map((person) => (
                  <tr
                    key={person.id}
                    className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                    onClick={() => setViewingPerson(person)}
                  >
                    {/* Name + Initials */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white font-mono text-xs flex items-center justify-center font-bold shrink-0">
                          {person.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-950 group-hover:underline">
                            {person.name}
                          </p>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Joined {person.joinDate}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-3 px-4 font-mono text-zinc-600">{person.employeeId}</td>

                    {/* Email */}
                    <td className="py-3 px-4 text-zinc-600">{person.email}</td>

                    {/* Department */}
                    <td className="py-3 px-4 text-zinc-700">{person.department}</td>

                    {/* Role */}
                    <td className="py-3 px-4 text-zinc-600">{person.role}</td>

                    {/* Attendance Percentage Progress Bar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 min-w-28">
                        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="bg-zinc-950 h-full rounded-full"
                            style={{ width: `${person.attendancePercentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-zinc-950 w-11 text-right">
                          {person.attendancePercentage}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <Badge status={person.status} size="sm" />
                    </td>

                    {/* Row Actions */}
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingPerson(person)}
                          className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                          title="View Profile"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleEdit(person)}
                          className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingPerson(person)}
                          className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                          title="Delete Member"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredPeople.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400 text-xs">
                      No members found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => (
            <Card
              key={person.id}
              hoverEffect
              className="p-5 cursor-pointer relative group flex flex-col justify-between"
              onClick={() => setViewingPerson(person)}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white font-mono text-sm flex items-center justify-center font-bold">
                      {person.initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-950 group-hover:underline">
                        {person.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono">{person.employeeId}</p>
                    </div>
                  </div>
                  <Badge status={person.status} size="sm" />
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-zinc-600">
                  <p className="flex items-center gap-2">
                    <Building size={13} className="text-zinc-400" />
                    <span>{person.department} • {person.role}</span>
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Mail size={13} className="text-zinc-400" />
                    <span className="truncate">{person.email}</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-500 font-mono text-[11px]">Attendance Rate</span>
                  <span className="font-mono font-bold text-zinc-950">
                    {person.attendancePercentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="bg-zinc-950 h-full rounded-full"
                    style={{ width: `${person.attendancePercentage}%` }}
                  />
                </div>

                <div
                  className="mt-3 flex items-center justify-between pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openMarkModal(person.id)}
                    className="text-[11px] p-1 h-auto"
                  >
                    Quick Mark
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(person)}
                      className="p-1 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeletingPerson(person)}
                      className="p-1 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        personToEdit={editingPerson}
      />

      {/* View Member Profile Modal */}
      <PersonDetailsModal
        person={viewingPerson}
        isOpen={Boolean(viewingPerson)}
        onClose={() => setViewingPerson(null)}
        onEdit={(p) => handleEdit(p)}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingPerson)}
        onClose={() => setDeletingPerson(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Member from Registry"
        message={`Are you sure you want to delete ${deletingPerson?.name} (${deletingPerson?.employeeId})? All corresponding attendance logs for this member will also be removed. This action is irreversible.`}
        confirmLabel="Delete Member"
        isDestructive
      />
    </div>
  );
};
