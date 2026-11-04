import React, { useState, useMemo } from 'react';
import {
  School,
  Search,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Phone,
  Mail,
  BookOpen,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  X,
  ExternalLink,
  LayoutGrid,
  List,
  GraduationCap,
  Award,
  DollarSign,
  Send,
  Building,
  Lock,
  Key
} from 'lucide-react';
import { BulkUploadModal } from '../people/BulkUploadModal';

// ==========================================
// 1. DATA TYPES
// ==========================================
export type TeacherStatus = 'present' | 'absent' | 'late';

export interface TeacherRecord {
  id: string;
  name: string;
  subject: string;
  department: string;
  assignedClass: string;
  phone: string;
  email?: string;
  password?: string; // 🔒 Teacher Login Password configured by Admin
  qualification?: string;
  salary?: string;
  salaryStatus?: 'Paid' | 'Pending';
  dailyPeriods?: number;
  room?: string;
  checkIn: string;
  checkOut: string;
  status: TeacherStatus;
}

// ==========================================
// 2. INITIAL FALLBACK DATA (WITH LOGIN PASSWORDS)
// ==========================================
const DEFAULT_TEACHERS: TeacherRecord[] = [
  {
    id: 'FAC-101',
    name: 'Prof. Marcus Chen',
    subject: 'Mathematics & Calculus',
    department: 'Science & Math',
    assignedClass: 'Grade 10-A',
    phone: '+91 98765-43210',
    email: 'marcus.chen@gmail.com',
    password: 'Teacher123',
    qualification: 'M.Sc, B.Ed (10+ Yrs Exp)',
    salary: '₹65,000',
    salaryStatus: 'Paid',
    dailyPeriods: 5,
    room: 'Room 201',
    checkIn: '08:15 AM',
    checkOut: '03:30 PM',
    status: 'present',
  },
  {
    id: 'FAC-102',
    name: 'Dr. Sophia Rodriguez',
    subject: 'Physics & Lab Experiments',
    department: 'Science & Math',
    assignedClass: 'Grade 11-A',
    phone: '+91 98765-43211',
    email: 'sophia.rodriguez@gmail.com',
    password: 'Teacher123',
    qualification: 'Ph.D in Applied Physics',
    salary: '₹75,000',
    salaryStatus: 'Paid',
    dailyPeriods: 6,
    room: 'Physics Lab B',
    checkIn: '08:20 AM',
    checkOut: '03:30 PM',
    status: 'present',
  },
  {
    id: 'FAC-103',
    name: 'Julian Hayes',
    subject: 'English Literature & Grammar',
    department: 'Languages',
    assignedClass: 'Grade 10-B',
    phone: '+91 98765-43212',
    email: 'julian.hayes@gmail.com',
    password: 'Teacher123',
    qualification: 'M.A English, CELTA',
    salary: '₹55,000',
    salaryStatus: 'Paid',
    dailyPeriods: 4,
    room: 'Room 105',
    checkIn: '08:45 AM',
    checkOut: '03:30 PM',
    status: 'late',
  },
  {
    id: 'FAC-104',
    name: 'Amara Okafor',
    subject: 'Organic & Physical Chemistry',
    department: 'Science & Math',
    assignedClass: 'Grade 12-A',
    phone: '+91 98765-43213',
    email: 'amara.okafor@gmail.com',
    password: 'Teacher123',
    qualification: 'M.Sc Chemistry, CSIR NET',
    salary: '₹60,000',
    salaryStatus: 'Pending',
    dailyPeriods: 5,
    room: 'Chemistry Lab A',
    checkIn: '--',
    checkOut: '--',
    status: 'absent',
  },
  {
    id: 'FAC-105',
    name: 'Rajesh Sharma',
    subject: 'Computer Science & AI',
    department: 'Technology',
    assignedClass: 'Grade 11-B',
    phone: '+91 98765-43214',
    email: 'rajesh.sharma@gmail.com',
    password: 'Teacher123',
    qualification: 'B.Tech CS, MCA',
    salary: '₹70,000',
    salaryStatus: 'Paid',
    dailyPeriods: 6,
    room: 'Computer Lab 1',
    checkIn: '08:05 AM',
    checkOut: '03:30 PM',
    status: 'present',
  },
  {
    id: 'FAC-106',
    name: 'Priya Patel',
    subject: 'Social Studies & Civics',
    department: 'Humanities',
    assignedClass: 'Grade 9-A',
    phone: '+91 98765-43215',
    email: 'priya.patel@gmail.com',
    password: 'Teacher123',
    qualification: 'M.A History, B.Ed',
    salary: '₹52,000',
    salaryStatus: 'Paid',
    dailyPeriods: 5,
    room: 'Room 102',
    checkIn: '08:25 AM',
    checkOut: '03:30 PM',
    status: 'present',
  },
];

export const TeachersManagement: React.FC = () => {
  // LocalStorage State (Unified with attendly_teachers_att_v2)
  const [teachers, setTeachers] = useState<TeacherRecord[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_teachers_att_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Enrich any older schema records with default modern fields
        return parsed.map((t: any, idx: number) => ({
          id: t.id || `FAC-${101 + idx}`,
          name: t.name || 'Faculty Member',
          subject: t.subject || 'General Subject',
          department: t.department || 'General',
          assignedClass: t.assignedClass || 'None',
          phone: t.phone || '+91 98765-00000',
          email: t.email || `${t.name?.toLowerCase().replace(/\s+/g, '.') || 'teacher'}@gmail.com`,
          password: t.password || 'Teacher123',
          qualification: t.qualification || 'M.A / M.Sc, B.Ed',
          salary: t.salary || '₹55,000',
          salaryStatus: t.salaryStatus || 'Paid',
          dailyPeriods: t.dailyPeriods || 5,
          room: t.room || `Room ${200 + idx}`,
          checkIn: t.checkIn || '08:30 AM',
          checkOut: t.checkOut || '03:30 PM',
          status: t.status || 'present',
        }));
      }
      return DEFAULT_TEACHERS;
    } catch {
      return DEFAULT_TEACHERS;
    }
  });

  // Controls & Filters
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'late'>('all');
  const [classFilter, setClassFilter] = useState('all');

  // Modals
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState<TeacherRecord | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);

  // Add Form State
  const [formName, setFormName] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formDept, setFormDept] = useState('Science & Math');
  const [formClass, setFormClass] = useState('Grade 10-A');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('Teacher123');
  const [formQual, setFormQual] = useState('');
  const [formSalary, setFormSalary] = useState('₹55,000');
  const [formPeriods, setFormPeriods] = useState(5);
  const [formRoom, setFormRoom] = useState('Room 201');

  // Live Today Date formatted
  const todayDateStr = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }, []);

  // Save to LocalStorage helper
  const saveTeachers = (newTeachers: TeacherRecord[]) => {
    setTeachers(newTeachers);
    localStorage.setItem('attendly_teachers_att_v2', JSON.stringify(newTeachers));
  };

  // Toggle or Set Status
  const handleStatusChange = (id: string, newStatus: TeacherStatus) => {
    const updated = teachers.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          checkIn: newStatus === 'absent' ? '--' : t.checkIn === '--' ? '08:30 AM' : t.checkIn,
          checkOut: newStatus === 'absent' ? '--' : t.checkOut === '--' ? '03:30 PM' : t.checkOut,
        };
      }
      return t;
    });
    saveTeachers(updated);
  };

  // Delete Teacher
  const handleDeleteTeacher = (id: string) => {
    if (window.confirm('Are you sure you want to delete this faculty record?')) {
      const updated = teachers.filter((t) => t.id !== id);
      saveTeachers(updated);
      if (viewingTeacher?.id === id) setViewingTeacher(null);
      if (editingTeacher?.id === id) setEditingTeacher(null);
    }
  };

  // Add New Teacher Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newId = `FAC-${100 + teachers.length + 1}`;
    const newRecord: TeacherRecord = {
      id: newId,
      name: formName.trim(),
      subject: formSubject.trim() || 'General Subject',
      department: formDept,
      assignedClass: formClass,
      phone: formPhone.trim() || '+91 98000-00000',
      email: formEmail.trim().toLowerCase() || `${formName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      password: formPassword.trim() || 'Teacher123',
      qualification: formQual.trim() || 'M.A / M.Sc, B.Ed',
      salary: formSalary.trim() || '₹55,000',
      salaryStatus: 'Paid',
      dailyPeriods: Number(formPeriods) || 5,
      room: formRoom.trim() || 'Room 101',
      checkIn: '08:30 AM',
      checkOut: '03:30 PM',
      status: 'present',
    };

    saveTeachers([...teachers, newRecord]);

    // Reset Form
    setFormName('');
    setFormSubject('');
    setFormPhone('');
    setFormEmail('');
    setFormPassword('Teacher123');
    setFormQual('');
    setIsAddTeacherOpen(false);
  };

  // Edit Teacher Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    const updated = teachers.map((t) => (t.id === editingTeacher.id ? editingTeacher : t));
    saveTeachers(updated);
    setEditingTeacher(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'ID,Name,Department,Subject,Assigned Class,Phone,Email,Qualification,Salary,Status,CheckIn,CheckOut\n';
    const rows = teachers
      .map(
        (t) =>
          `"${t.id}","${t.name}","${t.department}","${t.subject}","${t.assignedClass}","${t.phone}","${t.email || ''}","${t.qualification || ''}","${t.salary || ''}","${t.status}","${t.checkIn}","${t.checkOut}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendly_teachers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unique Departments & Classes for Filters
  const departments = useMemo(() => {
    return Array.from(new Set(teachers.map((t) => t.department))).filter(Boolean);
  }, [teachers]);

  const classes = useMemo(() => {
    return Array.from(new Set(teachers.map((t) => t.assignedClass))).filter(Boolean);
  }, [teachers]);

  // Filtered List
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const mName = t.name.toLowerCase().includes(q);
        const mSub = t.subject.toLowerCase().includes(q);
        const mId = t.id.toLowerCase().includes(q);
        const mPhone = t.phone.toLowerCase().includes(q);
        if (!mName && !mSub && !mId && !mPhone) return false;
      }
      if (departmentFilter !== 'all' && t.department !== departmentFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (classFilter !== 'all' && t.assignedClass !== classFilter) return false;
      return true;
    });
  }, [teachers, searchQuery, departmentFilter, statusFilter, classFilter]);

  // Statistics
  const totalCount = teachers.length;
  const presentCount = teachers.filter((t) => t.status === 'present').length;
  const absentCount = teachers.filter((t) => t.status === 'absent').length;
  const lateCount = teachers.filter((t) => t.status === 'late').length;
  const presentRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP HEADER - FULL SCREEN WIDTH */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <School size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                  Teachers & Faculty Management
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-xs font-mono font-semibold border border-zinc-200">
                  {totalCount} Faculty
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Complete roster, daily attendance roll call, teaching workload, class assignments & payroll.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 font-mono bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-lg hidden sm:inline-flex">
            📅 {todayDateStr}
          </span>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-zinc-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Upload size={14} className="text-zinc-500" />
            <span>Bulk Upload CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddTeacherOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Add New Teacher</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STATS CARDS - 4-COL FULL WIDTH GRID */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Faculty */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Total Faculty
            </span>
            <div className="text-2xl font-bold text-zinc-950 mt-0.5 tracking-tight">
              {totalCount}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Across {departments.length} departments
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
        </div>

        {/* Card 2: Present Today */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider font-mono">
              Present Today
            </span>
            <div className="text-2xl font-bold text-zinc-950 mt-0.5 tracking-tight flex items-baseline gap-1.5">
              <span>{presentCount}</span>
              <span className="text-xs font-semibold text-emerald-600">({presentRate}%)</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              On duty in classrooms & labs
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 3: Absent / Leave */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider font-mono">
              Absent / Leave
            </span>
            <div className="text-2xl font-bold text-zinc-950 mt-0.5 tracking-tight flex items-baseline gap-1.5">
              <span>{absentCount}</span>
              {lateCount > 0 && (
                <span className="text-xs font-semibold text-amber-600">({lateCount} Late)</span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Requires substitute assignment
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <XCircle size={20} />
          </div>
        </div>

        {/* Card 4: Avg Workload */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Avg Daily Periods
            </span>
            <div className="text-2xl font-bold text-zinc-950 mt-0.5 tracking-tight">
              5.2 <span className="text-xs font-normal text-zinc-500">Periods/Day</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Full schedule coverage
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CONTROL & SEARCH BAR (FULL WIDTH) */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search faculty by name, ID (e.g. FAC-101), subject, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white text-xs border border-zinc-200 rounded-xl outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters and View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
          >
            <option value="all">All Status ({teachers.length})</option>
            <option value="present">Present ({presentCount})</option>
            <option value="absent">Absent ({absentCount})</option>
            <option value="late">Late ({lateCount})</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
          >
            <option value="all">All Class In-Charges</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                Class: {c}
              </option>
            ))}
          </select>

          {/* View Switcher: Table vs Cards */}
          <div className="flex items-center p-0.5 bg-zinc-100 rounded-xl border border-zinc-200 ml-auto lg:ml-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Full Table View"
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-950'
              }`}
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Faculty Cards View"
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-950'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN CONTENT AREA - TABLE OR GRID VIEW */}
      {/* ======================================================== */}
      {filteredTeachers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-zinc-200">
          <School size={36} className="mx-auto text-zinc-300 mb-2" />
          <h3 className="text-sm font-semibold text-zinc-800">No faculty members found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            No teachers match the current search or filters. Try adjusting your search query or add a new faculty member.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setDepartmentFilter('all');
              setStatusFilter('all');
              setClassFilter('all');
            }}
            className="mt-3 text-xs font-semibold text-zinc-950 underline underline-offset-2 cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ========================================== */
        /* FULL-SCREEN RESPONSIVE TABLE */
        /* ========================================== */
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Department & Subject</th>
                  <th className="py-3 px-4">Class In-Charge</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Workload</th>
                  <th className="py-3 px-4">Salary</th>
                  <th className="py-3 px-4 text-center">Today's Attendance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTeachers.map((teacher) => {
                  return (
                    <tr
                      key={teacher.id}
                      className="hover:bg-zinc-50/70 transition-colors group"
                    >
                      {/* 1. Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {teacher.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-950 flex items-center gap-1.5">
                              <span>{teacher.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                                {teacher.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                              {teacher.qualification || 'M.A / M.Sc, B.Ed'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Department & Subject */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-zinc-900">{teacher.subject}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {teacher.department}
                        </span>
                      </td>

                      {/* 3. Assigned Class */}
                      <td className="py-3.5 px-4">
                        {teacher.assignedClass && teacher.assignedClass !== 'None' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 text-white text-[11px] font-semibold shadow-2xs">
                            <span>{teacher.assignedClass}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[11px]">--</span>
                        )}
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {teacher.room || 'Room 101'}
                        </div>
                      </td>

                      {/* 4. Contact & Portal Login Credentials */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-zinc-800 font-mono text-xs">
                          <Phone size={12} className="text-zinc-400" />
                          <span>{teacher.phone}</span>
                        </div>

                        {/* 🔒 Teacher Portal Login Credentials (Gmail & Password) */}
                        <div className="mt-1.5 p-1.5 rounded-lg bg-zinc-50 border border-zinc-200/80 font-mono text-[10px] space-y-0.5 max-w-[210px]">
                          <div className="flex items-center gap-1 text-zinc-700 truncate" title={teacher.email}>
                            <Mail size={10} className="text-zinc-400 shrink-0" />
                            <span className="truncate">{teacher.email || 'No email set'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-zinc-600">
                            <Key size={10} className="text-amber-500 shrink-0" />
                            <span>Pass: <strong className="text-zinc-950 font-bold">{teacher.password || 'Teacher123'}</strong></span>
                          </div>
                        </div>

                        <div className="mt-1">
                          <a
                            href={`https://api.whatsapp.com/send?phone=${teacher.phone.replace(/[^0-9]/g, '')}&text=Hello%20${encodeURIComponent(teacher.name)},%20your%20Teacher%20Portal%20login%20details:%0AGmail:%20${encodeURIComponent(teacher.email || '')}%0APassword:%20${encodeURIComponent(teacher.password || 'Teacher123')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200/80 transition-colors"
                            title="Send login credentials via WhatsApp"
                          >
                            <Send size={10} />
                            <span>Share Login</span>
                          </a>
                        </div>
                      </td>

                      {/* 5. Workload */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-900 flex items-center gap-1">
                          <BookOpen size={13} className="text-zinc-400" />
                          <span>{teacher.dailyPeriods || 5} Periods</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          In: {teacher.checkIn}
                        </div>
                      </td>

                      {/* 6. Salary */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-950 font-mono">
                          {teacher.salary || '₹55,000'}
                        </div>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                            teacher.salaryStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {teacher.salaryStatus || 'Paid'}
                        </span>
                      </td>

                      {/* 7. Today's Attendance Toggle */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* Present Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(teacher.id, 'present')}
                            title="Mark Present"
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                              teacher.status === 'present'
                                ? 'bg-zinc-950 text-white shadow-xs'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            P
                          </button>

                          {/* Absent Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(teacher.id, 'absent')}
                            title="Mark Absent"
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                              teacher.status === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            A
                          </button>

                          {/* Late Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(teacher.id, 'late')}
                            title="Mark Late"
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                              teacher.status === 'late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            L
                          </button>
                        </div>
                      </td>

                      {/* 8. Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingTeacher(teacher)}
                            title="View Full Profile & Schedule"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingTeacher(teacher)}
                            title="Edit Faculty Info"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================== */
        /* RESPONSIVE FULL-WIDTH CARD GRID VIEW */
        /* ========================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => {
            return (
              <div
                key={teacher.id}
                className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar, Name, Dept Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                        {teacher.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-950 text-sm">{teacher.name}</h3>
                        <p className="text-xs font-semibold text-zinc-600 mt-0.5">{teacher.subject}</p>
                        <span className="text-[10px] font-mono text-zinc-400">{teacher.id}</span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase font-mono border ${
                        teacher.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : teacher.status === 'absent'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {teacher.status}
                    </span>
                  </div>

                  {/* Badges & Meta info */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-600">
                      <span className="text-zinc-400">Department:</span>
                      <span className="font-semibold text-zinc-800">{teacher.department}</span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-600">
                      <span className="text-zinc-400">Class In-Charge:</span>
                      <span className="font-semibold text-zinc-800">
                        {teacher.assignedClass || 'Subject Faculty'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-600">
                      <span className="text-zinc-400">Daily Periods:</span>
                      <span className="font-semibold text-zinc-800 font-mono">
                        {teacher.dailyPeriods || 5} Periods / Day
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-600">
                      <span className="text-zinc-400">Monthly Salary:</span>
                      <span className="font-bold text-zinc-950 font-mono">
                        {teacher.salary || '₹55,000'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Quick Attendance & Actions */}
                <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                  {/* Attendance Switcher */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(teacher.id, 'present')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono cursor-pointer ${
                        teacher.status === 'present'
                          ? 'bg-zinc-950 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      P
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(teacher.id, 'absent')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono cursor-pointer ${
                        teacher.status === 'absent'
                          ? 'bg-rose-600 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(teacher.id, 'late')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono cursor-pointer ${
                        teacher.status === 'late'
                          ? 'bg-amber-500 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      L
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://api.whatsapp.com/send?phone=${teacher.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="WhatsApp"
                    >
                      <Send size={15} />
                    </a>
                    <button
                      type="button"
                      onClick={() => setViewingTeacher(teacher)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTeacher(teacher)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTeacher(teacher.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: ADD NEW TEACHER */}
      {/* ======================================================== */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 text-base">Add New Faculty Member</h3>
                  <p className="text-xs text-zinc-500">Register teacher into school roster & timetable</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTeacherOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Subject Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics & Calculus"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  >
                    <option value="Science & Math">Science & Math</option>
                    <option value="Languages">Languages</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Technology">Technology</option>
                    <option value="Physical Education">Physical Education</option>
                    <option value="Arts & Music">Arts & Music</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Class In-Charge</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  >
                    <option value="None">None (Subject Teacher)</option>
                    <option value="Grade 9-A">Grade 9-A</option>
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 10-B">Grade 10-B</option>
                    <option value="Grade 11-A">Grade 11-A</option>
                    <option value="Grade 11-B">Grade 11-B</option>
                    <option value="Grade 12-A">Grade 12-A</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765-43210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Teacher Gmail Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. teacher@gmail.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Teacher Login Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TeacherPass123"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="M.Sc, B.Ed (8+ yrs)"
                    value={formQual}
                    onChange={(e) => setFormQual(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Monthly Salary</label>
                  <input
                    type="text"
                    placeholder="₹55,000"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Daily Periods</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formPeriods}
                    onChange={(e) => setFormPeriods(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Room / Lab</label>
                  <input
                    type="text"
                    placeholder="Room 201"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Save Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: EDIT TEACHER */}
      {/* ======================================================== */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 text-base">Edit Faculty Record</h3>
                  <p className="text-xs text-zinc-500">{editingTeacher.name} ({editingTeacher.id})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Subject Specialization</label>
                  <input
                    type="text"
                    value={editingTeacher.subject}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editingTeacher.department}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Class In-Charge</label>
                  <input
                    type="text"
                    value={editingTeacher.assignedClass}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, assignedClass: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingTeacher.phone}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  />
                </div>
              </div>

              {/* 🔒 Login Credentials Configuration by Admin */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
                <div>
                  <label className="block font-semibold text-zinc-800 mb-1 flex items-center gap-1">
                    <Mail size={12} className="text-zinc-500" />
                    <span>Teacher Login Gmail *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editingTeacher.email || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value.toLowerCase() })}
                    className="w-full p-2 rounded-xl border border-zinc-200 bg-white focus:ring-1 focus:ring-zinc-950 outline-none font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-800 mb-1 flex items-center gap-1">
                    <Lock size={12} className="text-zinc-500" />
                    <span>Teacher Login Password *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.password || 'Teacher123'}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, password: e.target.value })}
                    className="w-full p-2 rounded-xl border border-zinc-200 bg-white focus:ring-1 focus:ring-zinc-950 outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Monthly Salary</label>
                  <input
                    type="text"
                    value={editingTeacher.salary || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, salary: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Salary Status</label>
                  <select
                    value={editingTeacher.salaryStatus || 'Paid'}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, salaryStatus: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: VIEW TEACHER PROFILE & SCHEDULE */}
      {/* ======================================================== */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white font-bold text-base flex items-center justify-center shadow-xs">
                  {viewingTeacher.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 text-lg leading-tight">{viewingTeacher.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">{viewingTeacher.id} • {viewingTeacher.department}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingTeacher(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              {/* Status & Quick Toggle */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    Today's Attendance
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-semibold font-mono uppercase border ${
                        viewingTeacher.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : viewingTeacher.status === 'absent'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {viewingTeacher.status}
                    </span>
                    <span className="text-zinc-500 font-mono text-[11px]">
                      Check-In: {viewingTeacher.checkIn}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(viewingTeacher.id, 'present')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono cursor-pointer ${
                      viewingTeacher.status === 'present' ? 'bg-zinc-950 text-white' : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    P
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(viewingTeacher.id, 'absent')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono cursor-pointer ${
                      viewingTeacher.status === 'absent' ? 'bg-rose-600 text-white' : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(viewingTeacher.id, 'late')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono cursor-pointer ${
                      viewingTeacher.status === 'late' ? 'bg-amber-500 text-white' : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    L
                  </button>
                </div>
              </div>

              {/* Faculty Dossier Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/50">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Subject</span>
                  <span className="font-semibold text-zinc-900 mt-0.5 block">{viewingTeacher.subject}</span>
                </div>
                <div className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/50">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Class In-Charge</span>
                  <span className="font-semibold text-zinc-900 mt-0.5 block">{viewingTeacher.assignedClass || 'Subject Teacher'}</span>
                </div>
                <div className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/50">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Qualification</span>
                  <span className="font-semibold text-zinc-900 mt-0.5 block">{viewingTeacher.qualification || 'M.A / M.Sc, B.Ed'}</span>
                </div>
                <div className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/50">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Teaching Load</span>
                  <span className="font-semibold text-zinc-900 mt-0.5 block">{viewingTeacher.dailyPeriods || 5} Periods / Day ({viewingTeacher.room || 'Room 101'})</span>
                </div>
                <div className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/50">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Monthly Salary</span>
                  <span className="font-bold text-zinc-950 font-mono mt-0.5 block">{viewingTeacher.salary || '₹55,000'} ({viewingTeacher.salaryStatus || 'Paid'})</span>
                </div>
                <div className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/50">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Contact Phone</span>
                  <span className="font-semibold text-zinc-900 font-mono mt-0.5 block">{viewingTeacher.phone}</span>
                </div>
              </div>

              {/* 🔑 TEACHER PORTAL LOGIN CREDENTIALS BOX */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 text-white shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Lock size={13} className="text-emerald-400" />
                    <span>Teacher Portal Login Credentials</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    Admin Configured
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Authorized Gmail</span>
                    <span className="font-mono font-semibold text-emerald-400 mt-0.5 block truncate">
                      {viewingTeacher.email || 'teacher@gmail.com'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Login Password</span>
                    <span className="font-mono font-semibold text-white mt-0.5 block">
                      {viewingTeacher.password || 'Teacher123'}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 mt-2 font-mono">
                  Share these credentials with {viewingTeacher.name} to log in to the Teacher Portal.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-100">
                <a
                  href={`https://api.whatsapp.com/send?phone=${viewingTeacher.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                >
                  <Send size={13} />
                  <span>Send WhatsApp</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTeacher(viewingTeacher);
                      setViewingTeacher(null);
                    }}
                    className="px-3 py-2 rounded-xl border border-zinc-200 text-zinc-800 hover:bg-zinc-100 font-semibold cursor-pointer"
                  >
                    Edit Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingTeacher(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          // Reload teachers from local storage
          const saved = localStorage.getItem('attendly_teachers_att_v2');
          if (saved) {
            setTeachers(JSON.parse(saved));
          }
        }}
        defaultType="teachers"
      />
    </div>
  );
};
