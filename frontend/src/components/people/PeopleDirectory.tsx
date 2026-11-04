import React, { useState, useMemo, useEffect } from 'react';
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
  Upload,
  GraduationCap,
  School,
  Users,
  Phone,
  Send,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export const PeopleDirectory: React.FC = () => {
  const { people, deletePerson, openMarkModal, addPerson } = useAttendance();

  // 1. DIVIDE SECTION: 'students' | 'teachers' | 'all'
  const [roleCategory, setRoleCategory] = useState<'students' | 'teachers' | 'all'>('students');

  // View mode: 'table' | 'grid'
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

  // Teachers State from LocalStorage
  const [teachersList, setTeachersList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_teachers_att_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reload teachers whenever window focuses
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('attendly_teachers_att_v2');
        if (saved) setTeachersList(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('focus', handleSync);
    return () => window.removeEventListener('focus', handleSync);
  }, []);

  // User Session check (Check if logged in user is a Teacher)
  const userSession = useMemo(() => {
    try {
      const saved = localStorage.getItem('attendly_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const isTeacherUser = userSession?.role === 'teacher';

  // Find teacher's assigned class if logged in as teacher
  const teacherClass = useMemo(() => {
    if (!isTeacherUser) return null;
    const found = teachersList.find(
      (t) => (t.email && t.email.toLowerCase() === userSession?.email?.toLowerCase()) || t.name === userSession?.name
    );
    return found?.assignedClass || 'Grade 10-A';
  }, [isTeacherUser, userSession, teachersList]);

  // Separate Students List (Strictly scoped to teacher's class if logged in as teacher)
  const studentsList: StudentEmployee[] = useMemo(() => {
    return people.filter((p) => {
      const r = (p.role || '').toLowerCase();
      const isStudent = r === 'student' || r === 'member' || !r.includes('teacher');
      if (!isStudent) return false;
      if (isTeacherUser && teacherClass) {
        return p.department === teacherClass;
      }
      return true;
    });
  }, [people, isTeacherUser, teacherClass]);

  // Teachers converted to Directory format
  const formattedTeachers: StudentEmployee[] = useMemo(() => {
    return teachersList.map((t: any, idx: number) => {
      const nameParts = (t.name || 'Faculty Member').trim().split(' ');
      const initials =
        nameParts.length > 1
          ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
          : (t.name || 'FC').slice(0, 2).toUpperCase();

      return {
        id: t.id || `fac-${100 + idx}`,
        name: t.name || 'Faculty Member',
        employeeId: t.id || `FAC-${100 + idx}`,
        email: t.email || `${t.name?.toLowerCase().replace(/\s+/g, '.') || 'faculty'}@attendly.edu`,
        department: t.department || 'Academics',
        role: `Faculty (${t.subject || 'Subject'})`,
        phone: t.phone || '+91 98765-00000',
        joinDate: '2024-01-15',
        status: t.status === 'absent' ? 'inactive' : 'active',
        attendancePercentage: t.status === 'absent' ? 88.5 : 98.2,
        initials,
      };
    });
  }, [teachersList]);

  // Active items depending on Divided Section ('students' | 'teachers' | 'all')
  const currentDirectoryItems = useMemo(() => {
    if (isTeacherUser) return studentsList;
    if (roleCategory === 'students') return studentsList;
    if (roleCategory === 'teachers') return formattedTeachers;
    return [...studentsList, ...formattedTeachers];
  }, [isTeacherUser, roleCategory, studentsList, formattedTeachers]);

  // Available Departments / Classes based on current category
  const departments = useMemo(() => {
    return Array.from(new Set(currentDirectoryItems.map((p) => p.department))).filter(Boolean).sort();
  }, [currentDirectoryItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return currentDirectoryItems.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesId = p.employeeId.toLowerCase().includes(q);
        const matchesEmail = p.email.toLowerCase().includes(q);
        const matchesRole = p.role.toLowerCase().includes(q);
        const matchesDept = p.department.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesEmail && !matchesRole && !matchesDept) return false;
      }

      if (departmentFilter !== 'all' && p.department !== departmentFilter) {
        return false;
      }

      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [currentDirectoryItems, searchQuery, departmentFilter, statusFilter]);

  const handleEdit = (person: StudentEmployee) => {
    setEditingPerson(person);
    setIsAddModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingPerson) {
      if (roleCategory === 'teachers') {
        const updatedT = teachersList.filter((t) => t.id !== deletingPerson.employeeId && t.id !== deletingPerson.id);
        setTeachersList(updatedT);
        localStorage.setItem('attendly_teachers_att_v2', JSON.stringify(updatedT));
      } else {
        deletePerson(deletingPerson.id);
      }
      setDeletingPerson(null);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & ACTION BUTTONS */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-950">
              {roleCategory === 'students'
                ? 'Students Registry'
                : roleCategory === 'teachers'
                ? 'Teachers & Faculty Registry'
                : 'Students & Staff Registry'}
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-xs font-mono border border-zinc-200">
              {filteredItems.length} records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            {roleCategory === 'students'
              ? 'Complete student records, class enrollments, and academic attendance benchmarks'
              : roleCategory === 'teachers'
              ? 'Faculty roster, department alignments, subject specializations, and staff status'
              : 'Unified member directory, attendance benchmarks, and account states'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Grid/Table Switcher */}
          <div className="flex items-center border border-zinc-200 rounded-xl bg-white p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-950'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
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
            Bulk Upload ({roleCategory === 'teachers' ? 'Teachers' : 'Students'})
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
            {roleCategory === 'teachers'
              ? '+ Add Teacher'
              : roleCategory === 'students'
              ? '+ Add Student'
              : '+ Add Member'}
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DIVIDED SECTION (TEACHERS ALAG, STUDENTS ALAG) */}
      {/* ======================================================== */}
      {!isTeacherUser ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-zinc-100 rounded-2xl border border-zinc-200">
          <div className="flex items-center gap-1.5">
            {/* Option 1: Students Directory */}
            <button
              type="button"
              onClick={() => {
                setRoleCategory('students');
                setDepartmentFilter('all');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                roleCategory === 'students'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              }`}
            >
              <GraduationCap size={16} />
              <span>Students Directory</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  roleCategory === 'students' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {studentsList.length}
              </span>
            </button>

            {/* Option 2: Teachers & Faculty */}
            <button
              type="button"
              onClick={() => {
                setRoleCategory('teachers');
                setDepartmentFilter('all');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                roleCategory === 'teachers'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              }`}
            >
              <School size={16} />
              <span>Teachers & Faculty</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  roleCategory === 'teachers' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {teachersList.length}
              </span>
            </button>

            {/* Option 3: All Members */}
            <button
              type="button"
              onClick={() => {
                setRoleCategory('all');
                setDepartmentFilter('all');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                roleCategory === 'all'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              }`}
            >
              <Users size={16} />
              <span>All Members</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  roleCategory === 'all' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {studentsList.length + teachersList.length}
              </span>
            </button>
          </div>

          <div className="text-xs text-zinc-500 font-mono pr-2 hidden sm:block">
            Active View:{' '}
            <span className="font-bold text-zinc-900 capitalize">
              {roleCategory === 'teachers' ? 'Faculty & Staff Only' : roleCategory === 'students' ? 'Students Only' : 'Combined Roster'}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-zinc-100 rounded-2xl border border-zinc-200 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-zinc-900" />
            <span className="font-bold text-zinc-950">
              Class {teacherClass} Student Roster (Institutional Staff & Other Classes Hidden)
            </span>
          </div>
          <span className="text-zinc-500">
            {studentsList.length} Class Students
          </span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. FILTER AND SEARCH BAR CARD */}
      {/* ======================================================== */}
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
              placeholder={
                roleCategory === 'students'
                  ? 'Search student name, admission ID, email...'
                  : roleCategory === 'teachers'
                  ? 'Search faculty name, ID, subject...'
                  : 'Search name, ID, email, role...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950"
            />
          </div>

          {/* Department / Class Filter */}
          <div className="relative">
            <Building
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:border-zinc-950 cursor-pointer appearance-none"
            >
              <option value="all">
                {roleCategory === 'students'
                  ? 'All Classes / Grades'
                  : roleCategory === 'teachers'
                  ? 'All Faculty Departments'
                  : 'All Departments / Classes'}
              </option>
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
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:border-zinc-950 cursor-pointer appearance-none"
            >
              <option value="all">All Statuses (Active & Inactive)</option>
              <option value="active">Active Members Only</option>
              <option value="inactive">Inactive / On Leave</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ======================================================== */}
      {/* 4. DIRECTORY CONTENT: TABLE OR GRID */}
      {/* ======================================================== */}
      {viewMode === 'table' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider font-mono">
                  {roleCategory === 'students' ? (
                    <>
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Admission No</th>
                      <th className="py-3 px-4">Class & Section</th>
                      <th className="py-3 px-4">Parents Phone Number</th>
                      <th className="py-3 px-4">Attendance Rate</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </>
                  ) : roleCategory === 'teachers' ? (
                    <>
                      <th className="py-3 px-4">Faculty Member</th>
                      <th className="py-3 px-4">Faculty ID</th>
                      <th className="py-3 px-4">Email / Phone</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Attendance Rate</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Department / Class</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Attendance Rate</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-zinc-800">
                {filteredItems.map((person, idx) => {
                  const isTeacher =
                    person.role?.toLowerCase().includes('faculty') ||
                    person.role?.toLowerCase().includes('teacher') ||
                    person.employeeId.startsWith('FAC-');

                  if (roleCategory === 'students') {
                    // 🎓 DEDICATED STUDENT ROW: Roll No, Name, Admission No, Class & Section, Parents Phone Number
                    const rollDisplay = person.rollNo || String(idx + 1).padStart(2, '0');
                    const admDisplay = person.admissionNo || person.employeeId;
                    const classSecDisplay =
                      person.className && person.section
                        ? `${person.className} - Sec ${person.section}`
                        : person.department;
                    const phoneDisplay = person.parentPhone || person.phone || '+91 98765-00000';

                    return (
                      <tr
                        key={person.id}
                        className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                        onClick={() => setViewingPerson(person)}
                      >
                        {/* 1. Roll No */}
                        <td className="py-3 px-4 font-mono font-bold text-zinc-950">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-xs">
                            #{rollDisplay}
                          </span>
                        </td>

                        {/* 2. Student Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg font-mono text-xs flex items-center justify-center font-bold shrink-0 bg-zinc-950 text-white">
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

                        {/* 3. Admission No */}
                        <td className="py-3 px-4 font-mono text-zinc-700">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 font-semibold text-xs">
                            {admDisplay}
                          </span>
                        </td>

                        {/* 4. Class & Section */}
                        <td className="py-3 px-4 text-zinc-800">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200 font-sans">
                            {classSecDisplay}
                          </span>
                        </td>

                        {/* 5. Parents Phone Number */}
                        <td className="py-3 px-4 text-zinc-700">
                          <div className="font-mono text-xs flex items-center gap-1.5 font-semibold text-zinc-900">
                            <Phone size={12} className="text-zinc-400" />
                            <span>{phoneDisplay}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-sans">Parents Contact</span>
                        </td>

                        {/* 6. Attendance Rate */}
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

                        {/* 7. Status */}
                        <td className="py-3 px-4">
                          <Badge status={person.status} size="sm" />
                        </td>

                        {/* 8. Actions */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingPerson(person)}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                              title="View Student"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleEdit(person)}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                              title="Edit Student"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setDeletingPerson(person)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-500 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // 👨‍🏫 TEACHERS & ALL MEMBERS ROW
                  return (
                    <tr
                      key={person.id}
                      className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                      onClick={() => setViewingPerson(person)}
                    >
                      {/* Name + Initials */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg font-mono text-xs flex items-center justify-center font-bold shrink-0 ${
                              isTeacher ? 'bg-zinc-900 text-white' : 'bg-zinc-950 text-white'
                            }`}
                          >
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
                      <td className="py-3 px-4 font-mono text-zinc-600">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 font-semibold">
                          {person.employeeId}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 text-zinc-600">
                        <div className="font-mono text-zinc-800">{person.email}</div>
                        {person.phone && (
                          <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                            <Phone size={10} />
                            <span>{person.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Department / Class */}
                      <td className="py-3 px-4 text-zinc-700">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {person.department}
                        </span>
                      </td>

                      {/* Role Pill */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                            isTeacher
                              ? 'bg-zinc-100 text-zinc-800 border border-zinc-300'
                              : 'bg-zinc-950 text-white'
                          }`}
                        >
                          {isTeacher ? <School size={10} /> : <GraduationCap size={10} />}
                          <span>{isTeacher ? 'Faculty / Teacher' : 'Student'}</span>
                        </span>
                      </td>

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

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingPerson(person)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                            title="View Profile"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleEdit(person)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                            title="Edit Details"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeletingPerson(person)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-500 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400 text-xs">
                      No {roleCategory} found matching your search.
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
          {filteredItems.map((person, idx) => {
            const isTeacher =
              person.role?.toLowerCase().includes('faculty') ||
              person.role?.toLowerCase().includes('teacher') ||
              person.employeeId.startsWith('FAC-');

            const isStudent = roleCategory === 'students' || !isTeacher;
            const rollDisplay = person.rollNo || String(idx + 1).padStart(2, '0');
            const admDisplay = person.admissionNo || person.employeeId;
            const classSecDisplay =
              person.className && person.section
                ? `${person.className} - Sec ${person.section}`
                : person.department;
            const phoneDisplay = person.parentPhone || person.phone || '+91 98765-00000';

            return (
              <Card
                key={person.id}
                hoverEffect
                className="p-5 cursor-pointer relative group flex flex-col justify-between"
                onClick={() => setViewingPerson(person)}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl font-mono text-sm flex items-center justify-center font-bold ${
                          isTeacher ? 'bg-zinc-900 text-white' : 'bg-zinc-950 text-white'
                        }`}
                      >
                        {person.initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-950 group-hover:underline">
                          {person.name}
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          {isStudent ? `Adm: ${admDisplay}` : person.employeeId}
                        </p>
                      </div>
                    </div>
                    <Badge status={person.status} size="sm" />
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-zinc-600">
                    {isStudent ? (
                      <>
                        <p className="flex items-center gap-2">
                          <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                            Roll #{rollDisplay}
                          </span>
                          <span className="font-semibold text-zinc-800">{classSecDisplay}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone size={13} className="text-zinc-400" />
                          <span className="font-mono text-zinc-800">{phoneDisplay}</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="flex items-center gap-2">
                          <Building size={13} className="text-zinc-400" />
                          <span>{person.department}</span>
                        </p>
                        <p className="flex items-center gap-2 truncate">
                          <Mail size={13} className="text-zinc-400" />
                          <span className="truncate">{person.email}</span>
                        </p>
                      </>
                    )}
                    <div className="pt-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                          isTeacher
                            ? 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                            : 'bg-zinc-950 text-white'
                        }`}
                      >
                        {isTeacher ? <School size={10} /> : <GraduationCap size={10} />}
                        <span>{isTeacher ? 'Teacher / Faculty' : 'Student'}</span>
                      </span>
                    </div>
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
            );
          })}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        personToEdit={editingPerson}
        category={roleCategory}
      />

      {/* View Member Profile Modal */}
      <PersonDetailsModal
        person={viewingPerson}
        isOpen={Boolean(viewingPerson)}
        onClose={() => setViewingPerson(null)}
        onEdit={(p) => handleEdit(p)}
      />

      {/* Bulk Upload Modal with Active Category */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          // Refresh teachers
          const saved = localStorage.getItem('attendly_teachers_att_v2');
          if (saved) setTeachersList(JSON.parse(saved));
        }}
        defaultType={roleCategory === 'teachers' ? 'teachers' : 'students'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingPerson)}
        onClose={() => setDeletingPerson(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Member from Registry"
        message={`Are you sure you want to delete ${deletingPerson?.name} (${deletingPerson?.employeeId})? This action is irreversible.`}
        confirmLabel="Delete Member"
        isDestructive
      />
    </div>
  );
};
