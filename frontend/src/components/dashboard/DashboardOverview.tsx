import React, { useState, useMemo } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Plus, 
  Trash2,
  Upload,
  X,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { BulkUploadModal } from '../people/BulkUploadModal';

// ==========================================
// 1. DATA TYPES
// ==========================================
interface TeacherItem {
  id: string;
  name: string;
  subject: string;
  assignedClass: string;
  phone: string;
  status: 'present' | 'absent';
  checkInTime: string;
}

interface StudentItem {
  id: string;
  admissionNo: string;
  name: string;
  gradeClass: string;
  parentName: string;
  parentPhone: string;
  feeStatus: 'Paid' | 'Partial' | 'Pending';
  feePaidTill: string;
  totalFee: string;
  dueAmount: string;
  attendanceRate: number;
}

interface TimetableSlot {
  period: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

// ==========================================
// 2. INITIAL MOCK DATA
// ==========================================
const INITIAL_TEACHERS: TeacherItem[] = [
  { id: 'T-101', name: 'Prof. Marcus Chen', subject: 'Mathematics & Calculus', assignedClass: 'Grade 10-A', phone: '+91 98765-43210', status: 'present', checkInTime: '08:15 AM' },
  { id: 'T-102', name: 'Dr. Sophia Rodriguez', subject: 'Physics & Lab', assignedClass: 'Grade 11-A', phone: '+91 98765-43211', status: 'present', checkInTime: '08:20 AM' },
  { id: 'T-103', name: 'Julian Hayes', subject: 'English Literature', assignedClass: 'Grade 10-B', phone: '+91 98765-43212', status: 'present', checkInTime: '08:45 AM' },
  { id: 'T-104', name: 'Amara Okafor', subject: 'Chemistry', assignedClass: 'Grade 12-A', phone: '+91 98765-43213', status: 'absent', checkInTime: '--' },
  { id: 'T-105', name: 'Rajesh Sharma', subject: 'Computer Science & AI', assignedClass: 'Grade 11-B', phone: '+91 98765-43214', status: 'present', checkInTime: '08:05 AM' },
  { id: 'T-106', name: 'Priya Patel', subject: 'Social Studies & Civics', assignedClass: 'Grade 9-A', phone: '+91 98765-43215', status: 'present', checkInTime: '08:30 AM' },
];

const INITIAL_STUDENTS: StudentItem[] = [
  {
    id: 'S-1',
    admissionNo: 'ADM-2026-101',
    name: 'Eleanor Vance',
    gradeClass: 'Grade 10-A',
    parentName: 'Arthur & Helen Vance',
    parentPhone: '+91 98234-11001',
    feeStatus: 'Paid',
    feePaidTill: 'Paid Full Year (Session 2026-27)',
    totalFee: '₹60,000',
    dueAmount: '₹0',
    attendanceRate: 96.5,
  },
  {
    id: 'S-2',
    admissionNo: 'ADM-2026-102',
    name: 'Aarav Mehta',
    gradeClass: 'Grade 10-A',
    parentName: 'Sanjay Mehta',
    parentPhone: '+91 98234-11002',
    feeStatus: 'Paid',
    feePaidTill: 'Paid till Term 2 (Nov 2026)',
    totalFee: '₹60,000',
    dueAmount: '₹0',
    attendanceRate: 92.0,
  },
  {
    id: 'S-3',
    admissionNo: 'ADM-2026-103',
    name: 'Zoya Khan',
    gradeClass: 'Grade 10-B',
    parentName: 'Farhan & Yasmin Khan',
    parentPhone: '+91 98234-11003',
    feeStatus: 'Partial',
    feePaidTill: 'Paid till Term 1 (July 2026)',
    totalFee: '₹60,000',
    dueAmount: '₹20,000',
    attendanceRate: 88.4,
  },
  {
    id: 'S-4',
    admissionNo: 'ADM-2026-104',
    name: 'Liam Cooper',
    gradeClass: 'Grade 11-A',
    parentName: 'Robert Cooper',
    parentPhone: '+91 98234-11004',
    feeStatus: 'Pending',
    feePaidTill: 'Pending from April 2026 (Overdue)',
    totalFee: '₹75,000',
    dueAmount: '₹75,000',
    attendanceRate: 78.0,
  },
  {
    id: 'S-5',
    admissionNo: 'ADM-2026-105',
    name: 'Ananya Sen',
    gradeClass: 'Grade 11-A',
    parentName: 'Debabrata Sen',
    parentPhone: '+91 98234-11005',
    feeStatus: 'Paid',
    feePaidTill: 'Paid Full Year (Session 2026-27)',
    totalFee: '₹75,000',
    dueAmount: '₹0',
    attendanceRate: 98.2,
  },
  {
    id: 'S-6',
    admissionNo: 'ADM-2026-106',
    name: 'Rohan Deshmukh',
    gradeClass: 'Grade 12-A',
    parentName: 'Vilas Deshmukh',
    parentPhone: '+91 98234-11006',
    feeStatus: 'Partial',
    feePaidTill: 'Paid till Term 2 (Nov 2026)',
    totalFee: '₹80,000',
    dueAmount: '₹25,000',
    attendanceRate: 91.0,
  },
];

const TIMETABLE_DATA: Record<string, TimetableSlot[]> = {
  'Grade 10-A': [
    { period: 'Period 1', time: '08:30 - 09:20 AM', subject: 'Mathematics', teacher: 'Prof. Marcus Chen', room: 'Room 201' },
    { period: 'Period 2', time: '09:20 - 10:10 AM', subject: 'Physics & Lab', teacher: 'Dr. Sophia Rodriguez', room: 'Lab B' },
    { period: 'Break', time: '10:10 - 10:30 AM', subject: 'Morning Recess', teacher: '--', room: 'Campus Court' },
    { period: 'Period 3', time: '10:30 - 11:20 AM', subject: 'English Literature', teacher: 'Julian Hayes', room: 'Room 201' },
    { period: 'Period 4', time: '11:20 - 12:10 PM', subject: 'Computer Science', teacher: 'Rajesh Sharma', room: 'Computer Lab 1' },
  ],
  'Grade 10-B': [
    { period: 'Period 1', time: '08:30 - 09:20 AM', subject: 'English Literature', teacher: 'Julian Hayes', room: 'Room 202' },
    { period: 'Period 2', time: '09:20 - 10:10 AM', subject: 'Mathematics', teacher: 'Prof. Marcus Chen', room: 'Room 202' },
    { period: 'Break', time: '10:10 - 10:30 AM', subject: 'Morning Recess', teacher: '--', room: 'Campus Court' },
    { period: 'Period 3', time: '10:30 - 11:20 AM', subject: 'Chemistry Lab', teacher: 'Amara Okafor', room: 'Chem Lab' },
  ],
  'Grade 11-A': [
    { period: 'Period 1', time: '08:30 - 09:20 AM', subject: 'Advanced Physics', teacher: 'Dr. Sophia Rodriguez', room: 'Room 301' },
    { period: 'Period 2', time: '09:20 - 10:10 AM', subject: 'Chemistry Theory', teacher: 'Amara Okafor', room: 'Room 301' },
    { period: 'Break', time: '10:10 - 10:30 AM', subject: 'Morning Recess', teacher: '--', room: 'Campus Court' },
    { period: 'Period 3', time: '10:30 - 11:20 AM', subject: 'Calculus & Vectors', teacher: 'Prof. Marcus Chen', room: 'Room 301' },
  ],
  'Grade 12-A': [
    { period: 'Period 1', time: '08:30 - 09:20 AM', subject: 'Calculus & Integration', teacher: 'Prof. Marcus Chen', room: 'Room 401' },
    { period: 'Period 2', time: '09:20 - 10:10 AM', subject: 'Quantum Physics', teacher: 'Dr. Sophia Rodriguez', room: 'Room 401' },
    { period: 'Break', time: '10:10 - 10:30 AM', subject: 'Morning Recess', teacher: '--', room: 'Campus Court' },
    { period: 'Period 3', time: '10:30 - 11:20 AM', subject: 'Organic Chemistry', teacher: 'Amara Okafor', room: 'Room 401' },
  ],
};

export const DashboardOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'timetable'>('students');

  // Teachers State with LocalStorage persistence
  const [teachers, setTeachers] = useState<TeacherItem[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_teachers_att_v2');
      if (saved) return JSON.parse(saved);
      const savedOld = localStorage.getItem('attendly_teachers_v1');
      return savedOld ? JSON.parse(savedOld) : INITIAL_TEACHERS;
    } catch {
      return INITIAL_TEACHERS;
    }
  });

  // Students & Fee Records State with LocalStorage
  const [students, setStudents] = useState<StudentItem[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_students_v1');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  // Bulk Upload Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkModalType, setBulkModalType] = useState<'students' | 'teachers' | 'fees'>('fees');

  // Add Student & Fee Modal State
  const [isAddStudentFeeOpen, setIsAddStudentFeeOpen] = useState(false);
  const [newAdmNo, setNewAdmNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('Grade 10-A');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newFeeStatus, setNewFeeStatus] = useState<'Paid' | 'Partial' | 'Pending'>('Paid');
  const [newPaidTill, setNewPaidTill] = useState('Paid Full Year (2026-27)');
  const [newDueAmount, setNewDueAmount] = useState('₹0');

  // Filter & Search
  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [feeFilter, setFeeFilter] = useState<'all' | 'Paid' | 'Partial' | 'Pending'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('Grade 10-A');

  // Key Counters
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const teachersPresent = teachers.filter((t) => t.status === 'present').length;
  const teachersAbsent = teachers.filter((t) => t.status === 'absent').length;

  // Toggle Teacher Status
  const toggleTeacherStatus = (teacherId: string) => {
    const updated = teachers.map((t) => {
      if (t.id === teacherId) {
        const nextStatus = t.status === 'present' ? 'absent' : 'present';
        return {
          ...t,
          status: nextStatus as 'present' | 'absent',
          checkInTime: nextStatus === 'present' ? '08:30 AM' : '--',
        };
      }
      return t;
    });
    setTeachers(updated);
    localStorage.setItem('attendly_teachers_att_v2', JSON.stringify(updated));
  };

  // Delete Student Fee Record
  const handleDeleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    localStorage.setItem('attendly_students_v1', JSON.stringify(updated));
  };

  // Clear Sample Data
  const handleClearSampleData = () => {
    if (window.confirm('Kya aap saara sample data delete karke clean slate karna chahte hain?')) {
      setStudents([]);
      localStorage.setItem('attendly_students_v1', JSON.stringify([]));
    }
  };

  // Submit New Student & Fee
  const handleCreateStudentFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStudent: StudentItem = {
      id: `S-${Date.now()}`,
      admissionNo: newAdmNo.trim() || `ADM-2026-${100 + students.length + 1}`,
      name: newName.trim(),
      gradeClass: newClass,
      parentName: newParentName.trim() || 'Parent/Guardian',
      parentPhone: newParentPhone.trim() || '+91 98000-00000',
      feeStatus: newFeeStatus,
      feePaidTill: newPaidTill.trim() || 'Paid Full Year',
      totalFee: '₹60,000',
      dueAmount: newFeeStatus === 'Paid' ? '₹0' : (newDueAmount.trim() || '₹15,000'),
      attendanceRate: 95,
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem('attendly_students_v1', JSON.stringify(updated));

    // Also add to attendance roster
    const attendanceItem = {
      id: `STU-${Date.now()}`,
      admissionNo: newStudent.admissionNo,
      name: newStudent.name,
      gradeClass: newStudent.gradeClass,
      parentName: newStudent.parentName,
      parentPhone: newStudent.parentPhone,
      checkIn: '08:15 AM',
      status: 'present' as const,
    };
    const existingAtt = JSON.parse(localStorage.getItem('attendly_students_att_v2') || '[]');
    localStorage.setItem('attendly_students_att_v2', JSON.stringify([...existingAtt, attendanceItem]));

    // Reset & Close
    setNewName('');
    setNewAdmNo('');
    setNewParentName('');
    setNewParentPhone('');
    setIsAddStudentFeeOpen(false);
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (studentSearch) {
        const q = studentSearch.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesAdm = s.admissionNo.toLowerCase().includes(q);
        const matchesParent = s.parentName.toLowerCase().includes(q);
        if (!matchesName && !matchesAdm && !matchesParent) return false;
      }
      if (classFilter !== 'all' && s.gradeClass !== classFilter) return false;
      if (feeFilter !== 'all' && s.feeStatus !== feeFilter) return false;
      return true;
    });
  }, [students, studentSearch, classFilter, feeFilter]);

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              Institution Administration Portal
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-white text-[11px] font-mono">
              Admin View
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time student registry, faculty presence monitoring, fee checkpoints, and class schedules.
          </p>
        </div>

        {/* Action Tabs Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Students & Fees ({totalStudents})
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Teachers Attendance ({teachersPresent}/{totalTeachers})
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'timetable'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Class Timetables
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-500">
              Total Students
            </span>
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-zinc-950">
            {totalStudents}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Enrolled student records
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-500">
              Total Teachers
            </span>
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-zinc-950">
            {totalTeachers}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Faculty & Department Heads
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono text-emerald-600">
              Teacher Present Today
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-zinc-950">
            {teachersPresent}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {totalTeachers > 0 ? Math.round((teachersPresent / totalTeachers) * 100) : 0}% Faculty Present
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono text-rose-600">
              Teacher Absent Today
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <UserX size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-zinc-950">
            {teachersAbsent}
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">
            {teachersAbsent > 0 ? `${teachersAbsent} on approved leave` : 'Full Attendance'}
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: STUDENTS DIRECTORY & FEE TRACKER */}
      {/* ======================================================== */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
          {/* Header & Action Controls */}
          <div className="p-5 border-b border-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-950">
                  Students Registry & Fee Records
                </h2>
                {students.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSampleData}
                    className="text-[11px] text-red-600 hover:underline cursor-pointer font-mono"
                  >
                    (Clear Sample Data)
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Complete student records with Admission No, Class, Parents info, Fee paid status, and coverage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Name, Admission No..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 w-44 sm:w-56 focus:outline-none focus:border-zinc-950"
                />
                <Search size={13} className="absolute left-2.5 top-2 text-zinc-400" />
              </div>

              {/* Class Filter */}
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-2 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:border-zinc-950"
              >
                <option value="all">All Classes</option>
                <option value="Grade 10-A">Grade 10-A</option>
                <option value="Grade 10-B">Grade 10-B</option>
                <option value="Grade 11-A">Grade 11-A</option>
                <option value="Grade 12-A">Grade 12-A</option>
              </select>

              {/* Fee Filter */}
              <select
                value={feeFilter}
                onChange={(e) => setFeeFilter(e.target.value as any)}
                className="px-2 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:border-zinc-950"
              >
                <option value="all">All Fees</option>
                <option value="Paid">Fully Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>

              {/* 💳 BULK UPLOAD FEES CSV BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setBulkModalType('fees');
                  setIsBulkModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-800 cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet size={13} className="text-zinc-600" />
                <span>Bulk Upload Fees (CSV)</span>
              </button>

              {/* ➕ ADD STUDENT & FEE BUTTON */}
              <button
                type="button"
                onClick={() => setIsAddStudentFeeOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>+ Add Student & Fee</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/70 border-b border-zinc-200/80 text-[11px] font-mono uppercase text-zinc-500 tracking-wider">
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Parents Name & Phone</th>
                  <th className="py-3 px-4">Fee Status</th>
                  <th className="py-3 px-4">Fees Paid Till (Coverage)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      Koi student record nahi mila. "+ Add Student & Fee" ya "Bulk Upload Fees" se apna real data add karein.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-900">
                        {s.admissionNo}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-zinc-950">
                        {s.name}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 font-mono text-[11px] font-semibold text-zinc-800 border border-zinc-200">
                          {s.gradeClass}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-zinc-900">{s.parentName}</div>
                        <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone size={10} className="text-zinc-400" />
                          <span>{s.parentPhone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {s.feeStatus === 'Paid' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                            <CheckCircle2 size={11} />
                            <span>Paid</span>
                          </span>
                        )}
                        {s.feeStatus === 'Partial' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
                            <CreditCard size={11} />
                            <span>Partially Paid</span>
                          </span>
                        )}
                        {s.feeStatus === 'Pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200">
                            <AlertCircle size={11} />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-900 text-xs">
                          {s.feePaidTill}
                        </div>
                        {s.dueAmount && s.dueAmount !== '₹0' && (
                          <div className="text-[11px] text-rose-600 font-mono font-medium mt-0.5">
                            Due Amount: {s.dueAmount}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(s.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between text-xs text-zinc-500">
            <span>Showing {filteredStudents.length} of {students.length} students enrolled</span>
            <span className="font-mono">Academic Session 2026-2027</span>
          </div>
        </div>
      )}

      {/* SECTION 2: TEACHERS ATTENDANCE */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-zinc-950">
                Faculty & Teacher Attendance Roster
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Daily roll call for faculty members.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setBulkModalType('teachers');
                  setIsBulkModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-800 cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet size={13} className="text-zinc-600" />
                <span>Bulk Upload Teachers (CSV)</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/70 border-b border-zinc-200/80 text-[11px] font-mono uppercase text-zinc-500 tracking-wider">
                  <th className="py-3 px-4">Faculty ID</th>
                  <th className="py-3 px-4">Teacher Name</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Assigned Class</th>
                  <th className="py-3 px-4">Check-in Time</th>
                  <th className="py-3 px-4">Today's Status</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-500">{t.id}</td>
                    <td className="py-3.5 px-4 font-bold text-zinc-950">{t.name}</td>
                    <td className="py-3.5 px-4 text-zinc-700">{t.subject}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono text-[11px]">
                        {t.assignedClass}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-600">{t.checkInTime}</td>
                    <td className="py-3.5 px-4">
                      {t.status === 'present' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-950 text-white text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Present</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Absent</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleTeacherStatus(t.id)}
                        className="px-3 py-1 rounded-lg border border-zinc-300 hover:border-zinc-950 text-xs font-semibold text-zinc-900 transition-all cursor-pointer hover:bg-zinc-100"
                      >
                        {t.status === 'present' ? 'Mark Absent' : 'Mark Present'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: TIME TABLE */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-zinc-950">
                Daily Class Schedules & Timetables
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Period-wise subject breakdown, assigned faculty, and designated lecture rooms.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {['Grade 10-A', 'Grade 10-B', 'Grade 11-A', 'Grade 12-A'].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedClass === cls
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {TIMETABLE_DATA[selectedClass]?.map((slot, index) => {
                const isBreak = slot.period === 'Break';
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all ${
                      isBreak
                        ? 'bg-zinc-50 border-dashed border-zinc-300 text-zinc-500'
                        : 'bg-white border-zinc-200/90 hover:border-zinc-900 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800">
                        {slot.period}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                        <Clock size={11} />
                        <span>{slot.time}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-950 mt-1">
                      {slot.subject}
                    </h3>

                    <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
                      <span className="font-medium text-zinc-800">{slot.teacher}</span>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700">
                        {slot.room}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 💳 MODAL: ADD INDIVIDUAL STUDENT & FEE RECORD */}
      {isAddStudentFeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsAddStudentFeeOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">Add Student & Fee Record</h3>
                <p className="text-xs text-zinc-500">Register student details and fee payment checkpoint.</p>
              </div>
            </div>

            <form onSubmit={handleCreateStudentFee} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">Admission No</label>
                  <input
                    type="text"
                    placeholder="e.g. ADM-2026-201"
                    value={newAdmNo}
                    onChange={(e) => setNewAdmNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">Class & Section *</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-zinc-950"
                  >
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 10-B">Grade 10-B</option>
                    <option value="Grade 11-A">Grade 11-A</option>
                    <option value="Grade 12-A">Grade 12-A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">Fee Status</label>
                  <select
                    value={newFeeStatus}
                    onChange={(e) => setNewFeeStatus(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-zinc-950"
                  >
                    <option value="Paid">Fully Paid</option>
                    <option value="Partial">Partially Paid</option>
                    <option value="Pending">Pending / Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Fees Paid Till (Coverage) *</label>
                <input
                  type="text"
                  placeholder="e.g. Paid till Term 2 (Nov 2026) ya Paid Full Year"
                  value={newPaidTill}
                  onChange={(e) => setNewPaidTill(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">Due Amount</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹0 ya ₹15,000"
                    value={newDueAmount}
                    onChange={(e) => setNewDueAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">Parent Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765-43210"
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunil Sharma"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentFeeOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-950 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 cursor-pointer shadow-xs"
                >
                  Save Student & Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3-IN-1 BULK UPLOAD MODAL */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        defaultType={bulkModalType}
      />
    </div>
  );
};
